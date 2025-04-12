/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import { Link } from "react-router-dom"
import { BookOpen, Clock, Crown, Headphones, Home, LogOut, Medal, Menu, Mic, PenTool, Trophy, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"

function Leaderboard() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  useAuth()

  useEffect(() => {
    async function fetchProfiles() {
      setIsLoading(true)
      const { data, error } = await supabase.from("profiles").select("*").order("xp", { ascending: false })

      if (error) console.error(error)
      else setProfiles(data)

      setIsLoading(false)
    }

    async function fetchRecentActivities() {
      setIsActivitiesLoading(true)
      // Get the most recent 20 activities from all users
      const { data, error } = await supabase
        .from("study_logs")
        .select(`
          *,
          profiles:user_id (username)
        `)
        .order("logged_at", { ascending: false })
        .limit(20)

      if (error) console.error(error)
      else setActivities(data)

      setIsActivitiesLoading(false)
    }

    fetchProfiles()
    fetchRecentActivities()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Helper function to get the appropriate icon for each activity type
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "Reading":
        return <BookOpen className="h-5 w-5 text-pink-500" />
      case "Listening":
        return <Headphones className="h-5 w-5 text-blue-500" />
      case "Grammar":
        return <PenTool className="h-5 w-5 text-green-500" />
      case "Speaking":
        return <Mic className="h-5 w-5 text-purple-500" />
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />
    }
  }

  // Helper function to format the date in a more readable way
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Languages className="h-8 w-8 text-violet-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">The Sanctuary</h1>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link
                to="/leaderboard"
                className="text-violet-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Leaderboard
              </Link>
              <Link
                to="/resources"
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Resources
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-violet-600 p-2">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <div className="px-4 space-y-1">
              <Link
                to="/"
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <Home className="h-5 w-5 mr-2" />
                Home
              </Link>
              <Link
                to="/leaderboard"
                className="text-violet-600 px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Leaderboard
              </Link>
              <Link
                to="/resources"
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Resources
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Leaderboard Section */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center">
            <Trophy className="h-6 w-6 text-amber-500 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
          </div>

          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-pulse space-y-4 w-full">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {profiles.map((profile, index) => (
                <li key={profile.id} className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      {index === 0 ? (
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <Crown className="h-6 w-6 text-amber-500" />
                          </div>
                          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            1
                          </span>
                        </div>
                      ) : index === 1 ? (
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Medal className="h-6 w-6 text-gray-500" />
                          </div>
                          <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            2
                          </span>
                        </div>
                      ) : index === 2 ? (
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                            <Medal className="h-6 w-6 text-amber-700" />
                          </div>
                          <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            3
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-violet-50 flex items-center justify-center">
                            <User className="h-6 w-6 text-violet-500" />
                          </div>
                          <span className="absolute -top-1 -right-1 bg-violet-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{profile.username}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="flex items-center">
                          <Crown className="h-4 w-4 mr-1 text-amber-500" />
                          Level {profile.level}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{profile.xp} XP</span>
                        {profile.study_hours > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{profile.study_hours} hours studied</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {index === 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Top Student
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center">
            <Clock className="h-6 w-6 text-violet-500 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Community Activity</h1>
          </div>

          {isActivitiesLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-pulse space-y-4 w-full">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <li key={activity.id} className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-3">{getActivityIcon(activity.activity_type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.profiles?.username || "Anonymous"}
                        </p>
                        <span className="mx-2 text-gray-400">•</span>
                        <p className="text-xs text-gray-500">{formatDate(activity.logged_at)}</p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        Studied <span className="font-medium">{activity.activity_type}</span> for{" "}
                        <span className="font-medium">{activity.duration} minutes</span>
                        {activity.description && (
                          <>
                            <span className="mx-1">-</span>
                            <span className="italic">{activity.description}</span>
                          </>
                        )}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span className="flex items-center text-amber-500">
                          <Trophy className="h-3.5 w-3.5 mr-1" />
                          <span>{activity.xp_earned} XP earned</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

// Add missing icon component
function Languages(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  )
}

export default Leaderboard
