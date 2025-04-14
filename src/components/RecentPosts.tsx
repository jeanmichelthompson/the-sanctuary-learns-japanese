/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import { Link } from "react-router-dom"
import { MessageSquare, Clock } from "lucide-react"

export function RecentPosts() {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecentPosts()
  }, [])

  const fetchRecentPosts = async () => {
    setIsLoading(true)
    try {
      // First, fetch the posts
      const { data: postsData, error: postsError } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

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

      setPosts(postsWithCommentCounts)
    } catch (error) {
      console.error("Error fetching recent posts:", error)
    } finally {
      setIsLoading(false)
    }
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
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="h-6 w-6 text-violet-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Recent Forum Posts</h2>
        </div>
        <Link to="/forum" className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center">
          View All <span className="ml-1">→</span>
        </Link>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No forum posts yet.</p>
            <Link
              to="/forum/new"
              className="inline-flex items-center mt-4 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            >
              Create the First Post
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
                <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">{post.title}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{post.username || "Anonymous"}</span>
                  <span className="mx-2">•</span>
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>{formatDate(post.created_at)}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    {post.comment_count || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
