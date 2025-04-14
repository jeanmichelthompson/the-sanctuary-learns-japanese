/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabaseClient"
import { useAuth } from "../context/AuthContext"
import { Header } from "./Header"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Film, X } from "lucide-react"
import { ErrorModal, SuccessModal } from "./Modal"

function EditPost() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  const fetchPost = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("forum_posts").select("*").eq("id", id).single()

      if (error) throw error

      // Check if the current user is the author
      if (user?.id !== data.user_id) {
        setErrorMessage("You don't have permission to edit this post.")
        setShowErrorModal(true)
        navigate(`/forum/post/${id}`)
        return
      }

      setTitle(data.title)
      setContent(data.content)
      setVideoUrl(data.video_url || "")
    } catch (error: any) {
      console.error("Error fetching post:", error)
      setErrorMessage(error.message || "Failed to load the post. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }, [id, user, navigate])

  useEffect(() => {
    if (id) {
      fetchPost()
    }
  }, [id, fetchPost])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      setErrorMessage("Please provide both a title and content for your post.")
      setShowErrorModal(true)
      return
    }

    if (!user) {
      setErrorMessage("You must be logged in to edit a post.")
      setShowErrorModal(true)
      return
    }

    setIsSubmitting(true)

    try {
      // Validate video URL if provided
      let processedVideoUrl = videoUrl.trim()
      if (processedVideoUrl) {
        // Simple validation for YouTube URLs
        if (!processedVideoUrl.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
          throw new Error("Please enter a valid YouTube URL.")
        }

        // Convert youtu.be links to youtube.com embed format
        if (processedVideoUrl.includes("youtu.be")) {
          const videoId = processedVideoUrl.split("/").pop()
          processedVideoUrl = `https://www.youtube.com/embed/${videoId}`
        }
        // Convert regular youtube.com links to embed format
        else if (processedVideoUrl.includes("youtube.com/watch")) {
          const url = new URL(processedVideoUrl)
          const videoId = url.searchParams.get("v")
          processedVideoUrl = `https://www.youtube.com/embed/${videoId}`
        }
      }

      const { error } = await supabase
        .from("forum_posts")
        .update({
          title: title.trim(),
          content: content.trim(),
          video_url: processedVideoUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      setShowSuccessModal(true)

      // Navigate back to the post after success modal is closed
      setTimeout(() => {
        navigate(`/forum/post/${id}`)
      }, 2000)
    } catch (error: any) {
      console.error("Error updating post:", error)
      setErrorMessage(error.message || "Failed to update post. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header activeItem="forum" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-xl p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header activeItem="forum" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center">
            <Link to={`/forum/post/${id}`} className="mr-4 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Edit Post</h1>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your post a descriptive title"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or resources..."
                  required
                />
              </div>

              <div>
                <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Video URL (optional)
                </label>
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="video"
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {videoUrl && (
                      <button
                        type="button"
                        onClick={() => setVideoUrl("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Add a YouTube video to share learning resources with the community
                </p>
              </div>

              <div className="flex justify-end">
                <Link
                  to={`/forum/post/${id}`}
                  className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Your post has been updated successfully!"
      />

      {/* Error Modal */}
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} message={errorMessage} />
    </div>
  )
}

export default EditPost
