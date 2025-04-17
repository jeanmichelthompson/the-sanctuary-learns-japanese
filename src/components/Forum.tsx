/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import removeMarkdown from "remove-markdown"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabaseClient"
import { useAuth } from "../context/AuthContext"
import { Header } from "./Header"
import { Link, useNavigate } from "react-router-dom"
import { MessageSquare, Plus, Search, ThumbsUp, Clock } from "lucide-react"
import { BackToTop } from "./BackToTop"

function Forum() {
  useAuth() // Keep the hook for authentication context, but don't destructure user
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"latest" | "popular">("latest")
  const navigate = useNavigate()

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      // First, fetch the posts
      let query = supabase.from("forum_posts").select("*")

      if (filter === "latest") {
        query = query.order("created_at", { ascending: false })
      }
      // We'll handle the popular filter differently since we can't rely on the join

      const { data: postsData, error: postsError } = await query

      if (postsError) throw postsError

      if (!postsData || postsData.length === 0) {
        setPosts([])
        setIsLoading(false)
        return
      }

      // Get all user_ids from the posts
      const userIds = [...new Set(postsData.map((post) => post.user_id))]

      // Fetch usernames for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds)

      if (profilesError) throw profilesError

      // Create a map of user_id to username
      const usernameMap = new Map()
      profilesData?.forEach((profile) => {
        usernameMap.set(profile.id, profile.username)
      })

      // For each post, count the comments
      const postsWithCommentCounts = await Promise.all(
        postsData.map(async (post) => {
          const { count, error: countError } = await supabase
            .from("forum_comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id)

          if (countError) {
            console.error("Error counting comments:", countError)
            return {
              ...post,
              username: usernameMap.get(post.user_id) || "Anonymous",
              comment_count: 0,
            }
          }

          return {
            ...post,
            username: usernameMap.get(post.user_id) || "Anonymous",
            comment_count: count || 0,
          }
        }),
      )

      // If filter is "popular", sort by comment count
      if (filter === "popular") {
        postsWithCommentCounts.sort((a, b) => b.comment_count - a.comment_count)
      }

      setPosts(postsWithCommentCounts)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchPosts()
  }, [filter, fetchPosts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Navigate to search results
    navigate(`/forum/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header activeItem="forum" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Forum Header */}
        <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-violet-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Community Forum</h1>
            </div>
            <Link
              to="/forum/new"
              className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </div>
          <div className="p-6">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-violet-600 hover:text-violet-700"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Discussion Threads</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("latest")}
                  className={`flex items-center px-3 py-1 rounded-md text-sm ${
                    filter === "latest"
                      ? "bg-violet-100 text-violet-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Latest
                </button>
                <button
                  onClick={() => setFilter("popular")}
                  className={`flex items-center px-3 py-1 rounded-md text-sm ${
                    filter === "popular"
                      ? "bg-violet-100 text-violet-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Popular
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No posts yet</h3>
                <p className="text-gray-500 mb-4">Be the first to start a discussion!</p>
                <Link
                  to="/forum/new"
                  className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/forum/post/${post.id}`}
                    className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{post.title}</h3>
                    <p className="text-gray-600 line-clamp-2 mb-3">{removeMarkdown(post.content)}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium text-gray-700">{post.username || "Anonymous"}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(post.created_at)}</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {post.comment_count || 0} comments
                      </span>
                      {post.video_url && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-violet-600">Contains video</span>
                        </>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <BackToTop />
    </div>
  )
}

export default Forum
