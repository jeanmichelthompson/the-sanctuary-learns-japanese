/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabaseClient"
import { useAuth } from "../context/AuthContext"
import { Header } from "./Header"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, MessageSquare, Trash2, Edit2, Send } from "lucide-react"
import { BackToTop } from "./BackToTop"
import { ConfirmModal, ErrorModal } from "./Modal"

function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [postAuthor, setPostAuthor] = useState<string>("Anonymous")
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  const fetchPostAndComments = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch post
      const { data: postData, error: postError } = await supabase.from("forum_posts").select("*").eq("id", id).single()

      if (postError) throw postError

      // Fetch post author username
      if (postData.user_id) {
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", postData.user_id)
          .single()

        if (!userError && userData) {
          setPostAuthor(userData.username)
        }
      }

      setPost(postData)

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("forum_comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true })

      if (commentsError) throw commentsError

      // If we have comments, fetch the usernames for each comment
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map((comment) => comment.user_id))]

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds)

        if (!profilesError && profilesData) {
          // Create a map of user_id to username
          const usernameMap = new Map()
          profilesData.forEach((profile) => {
            usernameMap.set(profile.id, profile.username)
          })

          // Add username to each comment
          const commentsWithUsernames = commentsData.map((comment) => ({
            ...comment,
            username: usernameMap.get(comment.user_id) || "Anonymous",
          }))

          setComments(commentsWithUsernames)
        } else {
          setComments(
            commentsData.map((comment) => ({
              ...comment,
              username: "Anonymous",
            })),
          )
        }
      } else {
        setComments([])
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      setErrorMessage("Failed to load the post. It may have been deleted or you don't have permission to view it.")
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchPostAndComments()
    }
  }, [id, fetchPostAndComments])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return
    if (!user) {
      setErrorMessage("You must be logged in to comment.")
      setShowErrorModal(true)
      return
    }

    setIsSubmittingComment(true)

    try {
      const { error } = await supabase.from("forum_comments").insert({
        post_id: id,
        user_id: user.id,
        content: newComment.trim(),
      })

      if (error) throw error

      // Clear input and refresh comments
      setNewComment("")
      fetchPostAndComments()
    } catch (error: any) {
      console.error("Error posting comment:", error)
      setErrorMessage(error.message || "Failed to post comment. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeletePost = async () => {
    if (!user || !post || user.id !== post.user_id) {
      setErrorMessage("You don't have permission to delete this post.")
      setShowErrorModal(true)
      return
    }

    try {
      const { error } = await supabase.from("forum_posts").delete().eq("id", id)

      if (error) throw error

      // Navigate back to forum after successful deletion
      navigate("/forum")
    } catch (error: any) {
      console.error("Error deleting post:", error)
      setErrorMessage(error.message || "Failed to delete post. Please try again.")
      setShowErrorModal(true)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header activeItem="forum" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-xl p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header activeItem="forum" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-xl p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Post not found</h2>
            <p className="text-gray-500 mb-4">The post you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/forum"
              className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forum
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeItem="forum" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/forum" className="mr-4 text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 truncate">{post.title}</h1>
            </div>
            {user && user.id === post.user_id && (
              <div className="flex space-x-2">
                <Link
                  to={`/forum/edit/${post.id}`}
                  className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-full"
                >
                  <Edit2 className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span className="font-medium text-gray-700">{postAuthor}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(post.created_at)}</span>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-line">{post.content}</p>
            </div>

            {post.video_url && (
              <div className="mt-4 mb-6">
                <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={post.video_url}
                    className="absolute top-0 left-0 w-full h-full"
                    title="Embedded video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</h3>

              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="font-medium text-gray-700">{comment.username}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-800">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {user ? (
                <form onSubmit={handleSubmitComment} className="mt-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <textarea
                        placeholder="Add a comment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70"
                    >
                      {isSubmittingComment ? (
                        "Posting..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-700 mb-2">You need to be logged in to comment.</p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
                  >
                    Log In to Comment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <BackToTop />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Error Modal */}
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} message={errorMessage} />
    </div>
  )
}

export default PostDetail
