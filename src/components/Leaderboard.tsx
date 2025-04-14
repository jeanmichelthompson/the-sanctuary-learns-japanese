/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import { useAuth } from "../context/AuthContext"
import { Header } from "./Header"
import {
  Award,
  BookOpen,
  Clock,
  Crown,
  Headphones,
  Medal,
  Mic,
  PenTool,
  Trophy,
  User,
  ToggleLeft,
  ToggleRight,
  Car,
} from "lucide-react"

function Leaderboard() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true)
  const [showRaceView, setShowRaceView] = useState(false)
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
      case "Milestone":
        return <Award className="h-5 w-5 text-amber-500" />
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

  // Helper function to format activity description
  const formatActivityDescription = (activity: any) => {
    if (activity.activity_type === "Milestone") {
      return (
        <p className="text-sm text-gray-700 mt-1">
          <span className="font-medium text-amber-600">Achieved milestone:</span>{" "}
          <span className="font-medium">{activity.description.replace("Achieved: ", "")}</span>
        </p>
      )
    }

    return (
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
    )
  }

  // Calculate a dynamic target XP that's always ahead of the current leader
  const calculateDynamicMaxXP = () => {
    if (profiles.length === 0) return 1000

    // Get the highest XP value
    const highestXP = profiles[0].xp

    // Set the target to be 30% higher than the current leader
    // This creates a "moving target" effect where even the leader has room to grow
    return Math.max(1000, highestXP * 1.3)
  }

  // Get the dynamic maximum XP
  const dynamicMaxXP = calculateDynamicMaxXP()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header activeItem="leaderboard" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Leaderboard Section */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-amber-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Community</h1>
            </div>

            {/* Toggle switch for race view */}
            <button
              onClick={() => setShowRaceView(!showRaceView)}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
            >
              {showRaceView ? (
                <>
                  <ToggleRight className="h-5 w-5 mr-1.5 text-violet-600" />
                  Race View
                </>
              ) : (
                <>
                  <ToggleLeft className="h-5 w-5 mr-1.5" />
                  Race View
                </>
              )}
            </button>
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
          ) : showRaceView ? (
            // Race car view
            <div className="p-6 space-y-8">
              <div className="relative">
                {/* Race track */}
                <div className="space-y-6 py-4">
                  {profiles.map((profile, index) => {
                    // Calculate progress percentage with the dynamic max
                    // This ensures everyone is gradually moving right as they progress
                    const rawProgress = (profile.xp / dynamicMaxXP) * 100

                    // Ensure minimum spacing for cars at the start (20% for 0 XP)
                    // and maximum of 85% to leave room for growth
                    const minProgress = 20
                    const maxProgress = 85

                    // Scale the progress between min and max
                    const progress =
                      profile.xp === 0 ? minProgress : minProgress + (rawProgress * (maxProgress - minProgress)) / 100

                    // Calculate car position to ensure it stays inside the progress bar
                    // Adjust by 4.5% (half the car width) to center the car within the progress
                    const carPosition = Math.max(4.5, progress - 6)

                    // Determine car and track colors based on position
                    const carColor =
                      index === 0
                        ? "text-amber-500"
                        : index === 1
                          ? "text-gray-600"
                          : index === 2
                            ? "text-amber-700"
                            : "text-violet-600"

                    const trackColor =
                      index === 0
                        ? "bg-amber-100"
                        : index === 1
                          ? "bg-gray-100"
                          : index === 2
                            ? "bg-amber-50"
                            : "bg-violet-50"

                    const progressColor =
                      index === 0
                        ? "bg-amber-200"
                        : index === 1
                          ? "bg-gray-200"
                          : index === 2
                            ? "bg-amber-200/70"
                            : "bg-violet-200"

                    return (
                      <div key={profile.id} className="relative">
                        {/* Lane */}
                        <div
                          className={`h-14 w-full ${trackColor} rounded-full relative overflow-hidden border border-gray-200`}
                        >
                          {/* Progress track */}
                          <div
                            className={`absolute top-0 left-0 h-full ${progressColor} rounded-r-full`}
                            style={{ width: `${progress}%` }}
                          ></div>

                          {/* Finish line pattern */}
                          <div className="absolute top-0 right-0 h-full w-8 flex items-center justify-center">
                            <div className="h-full w-full flex flex-col">
                              {[...Array(7)].map((_, i) => (
                                <div key={i} className="flex-1 bg-black/10 odd:bg-transparent"></div>
                              ))}
                            </div>
                          </div>

                          {/* User info with position number on the left */}
                          <div className="absolute top-0 left-6 h-full flex items-center">
                            <div className="flex items-center">
                              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-white text-xs font-bold mr-2 border border-gray-300 shadow-sm">
                                {index + 1}
                              </span>
                              <p className="text-sm font-medium text-gray-900">{profile.username}</p>
                            </div>
                          </div>

                          {/* XP display on the right */}
                          <div className="absolute top-0 right-12 h-full flex items-center">
                            <span className="text-xs bg-white/80 px-2 py-0.5 rounded-full text-gray-700 shadow-sm">
                              {profile.xp} XP
                            </span>
                          </div>

                          {/* Car - positioned to stay inside the progress bar */}
                          <div className="absolute top-0 h-full flex items-center" style={{ left: `${carPosition}%` }}>
                            <Car className={`h-9 w-9 ${carColor}`} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-sm text-gray-700">Race to Japanese Fluency!</span>
                </div>
              </div>
            </div>
          ) : (
            // Standard leaderboard view
            <ul className="divide-y divide-gray-100 custom-scrollbar" style={{ maxHeight: "400px", overflowY: "auto" }}>
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
                            <span>{profile.study_hours.toFixed(2)} hours studied</span>
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
            <h1 className="text-xl font-bold text-gray-900">Recent Activity</h1>
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
            <ul className="divide-y divide-gray-100 custom-scrollbar" style={{ maxHeight: "400px", overflowY: "auto" }}>
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
                      {formatActivityDescription(activity)}
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

export default Leaderboard
