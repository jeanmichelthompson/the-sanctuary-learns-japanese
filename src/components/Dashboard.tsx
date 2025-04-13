"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabaseClient"
import LogActivity from "./LogActivity"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import {
  Award,
  BookOpen,
  Clock,
  Crown,
  Edit2,
  Headphones,
  Mic,
  MoreVertical,
  PenTool,
  Pencil,
  List,
  Trash2,
  User,
} from "lucide-react"
import { Modal, SuccessModal, ConfirmModal } from "./Modal"
import { Header } from "./Header"
import { Analytics } from "./Analytics"

function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [userMilestones, setUserMilestones] = useState<any[]>([])
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)

  // Function to fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

    if (error) {
      console.error("Error fetching profile:", error)
    } else if (!data) {
      console.log("No profile found for user. Upserting a new profile.")
      const { data: upsertedData, error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: user.email,
          xp: 0,
          level: 1,
          study_hours: 0,
        })
        .select("*")
        .maybeSingle()

      if (upsertError) {
        console.error("Error upserting profile:", upsertError)
      } else if (upsertedData) {
        setProfile(upsertedData)
        setNewUsername(upsertedData.username)
      }
    } else {
      setProfile(data)
      setNewUsername(data.username)
    }
  }, [user])

  // Function to fetch activities
  const fetchActivities = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from("study_logs")
      .select("*")
      .eq("user_id", user.id) // filter by the logged in user
      .order("logged_at", { ascending: false })
    if (error) console.error(error)
    else setActivities(data)
  }, [user])

  // Function to fetch milestones
  const fetchMilestones = useCallback(async () => {
    const { data, error } = await supabase.from("milestones").select("*")
    if (error) console.error(error)
    else setMilestones(data)
  }, [])

  // Function to fetch user's claimed milestones
  const fetchUserMilestones = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase.from("user_milestones").select("*").eq("user_id", user.id)

    if (error) console.error("Error fetching user milestones:", error)
    else setUserMilestones(data || [])
  }, [user])

  // Initial data loading
  useEffect(() => {
    fetchProfile()
    fetchActivities()
    fetchMilestones()
    fetchUserMilestones()
  }, [fetchProfile, fetchActivities, fetchMilestones, fetchUserMilestones, user])

  const handleUpdateUsername = async () => {
    if (!profile || !newUsername.trim()) return

    try {
      const { error } = await supabase.from("profiles").update({ username: newUsername.trim() }).eq("id", profile.id)

      if (error) throw error

      // Update local state
      setProfile({ ...profile, username: newUsername.trim() })
      setIsEditingUsername(false)

      // Show success message
      setSuccessMessage("Username updated successfully!")
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error updating username:", error)
      alert("Failed to update username. Please try again.")
    }
  }

  // Function to handle activity logging success
  const handleActivityLogged = useCallback(() => {
    // Refetch data to show updated information
    fetchProfile()
    fetchActivities()
  }, [fetchProfile, fetchActivities])

  // Function to clear all user progress
  const handleClearAllProgress = async () => {
    if (!user || !profile) return

    try {
      // 1. Delete all study logs for this user
      const { error: logsError } = await supabase.from("study_logs").delete().eq("user_id", user.id)

      if (logsError) throw logsError

      // 2. Delete all user milestones
      const { error: milestonesError } = await supabase.from("user_milestones").delete().eq("user_id", user.id)

      if (milestonesError) throw milestonesError

      // 3. Reset user profile stats
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          xp: 0,
          level: 1,
          study_hours: 0,
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      // 4. Refresh data
      fetchProfile()
      fetchActivities()
      fetchMilestones()
      fetchUserMilestones()

      // 5. Show success message
      setSuccessMessage("All progress has been cleared successfully!")
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error clearing progress:", error)
      alert("Failed to clear progress. Please try again.")
    }
  }

  // Function to check if a milestone has been claimed
  const isMilestoneClaimed = useCallback(
    (milestoneId: number) => {
      return userMilestones.some((um) => um.milestone_id === milestoneId)
    },
    [userMilestones],
  )

  // Update the claimMilestone function to also add an entry to study_logs
  const claimMilestone = async (milestoneId: number, xpReward: number, title: string) => {
    if (!user || !profile) return

    try {
      // 1. Insert into user_milestones
      const { error: insertError } = await supabase.from("user_milestones").insert({
        user_id: user.id,
        milestone_id: milestoneId,
        claimed_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      // 2. Update user's XP
      const newXP = profile.xp + xpReward
      const newLevel = Math.floor(newXP / 1000) + 1

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          xp: newXP,
          level: newLevel,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      // 3. Add to study_logs to show in activity feed
      const { error: logError } = await supabase.from("study_logs").insert({
        user_id: user.id,
        activity_type: "Milestone",
        description: `Achieved: ${title}`,
        duration: 0, // Milestones don't have duration
        xp_earned: xpReward,
        logged_at: new Date().toISOString(),
      })

      if (logError) throw logError

      // 4. Refresh data
      fetchProfile()
      fetchUserMilestones()
      fetchActivities() // Refresh activities to show the new milestone

      // 5. Show success message
      setSuccessMessage(`Milestone claimed! You earned ${xpReward} XP`)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error claiming milestone:", error)
      alert("Failed to claim milestone. Please try again.")
    }
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isUserMenuOpen && !target.closest("[data-user-menu]")) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isUserMenuOpen])

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-violet-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Count claimed milestones
  const claimedMilestonesCount = userMilestones.length

  // Group milestones by category
  const groupedMilestones = {
    writing: milestones.filter(
      (m) => m.title.includes("Hiragana") || m.title.includes("Katakana") || m.title.includes("Kanji"),
    ),
    vocabulary: milestones.filter((m) => m.title.includes("Vocabulary") || m.title.includes("JLPT")),
    grammar: milestones.filter((m) => m.title.includes("Grammar")),
    practice: milestones.filter(
      (m) =>
        m.title.includes("Conversation") ||
        m.title.includes("Book") ||
        m.title.includes("Listening") ||
        m.title.includes("Hours"),
    ),
  }

  // Get the next unclaimed milestone for each category
  const getNextMilestone = (categoryMilestones: any[]) => {
    return categoryMilestones.find((m) => !isMilestoneClaimed(m.id))
  }

  const nextMilestones = {
    writing: getNextMilestone(groupedMilestones.writing),
    vocabulary: getNextMilestone(groupedMilestones.vocabulary),
    grammar: getNextMilestone(groupedMilestones.grammar),
    practice: getNextMilestone(groupedMilestones.practice),
  }

  // Filter out undefined milestones (all claimed in a category)
  const nextMilestonesToShow = Object.values(nextMilestones).filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header activeItem="home" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile card */}
        <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white rounded-full p-1 mr-4">
                  <User className="h-12 w-12 text-violet-600" />
                </div>
                <div className="text-white">
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold">{profile.username}</h2>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                      aria-label="Edit username"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center mt-1">
                    <Crown className="h-4 w-4 mr-1" />
                    <span>Level {profile.level}</span>
                    <span className="mx-2">•</span>
                    <span>{profile.xp} XP</span>
                  </div>
                </div>
              </div>

              {/* User menu */}
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                  aria-label="User menu"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-100">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        setShowClearConfirmModal(true)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Progress
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-violet-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Total Study Time</p>
                  <p className="font-semibold">{profile.study_hours.toFixed(2)} hours</p>
                </div>
              </div>

              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-violet-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Sessions</p>
                  <p className="font-semibold">{activities.length}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Award className="h-5 w-5 text-violet-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Milestones</p>
                  <p className="font-semibold">
                    {claimedMilestonesCount} / {milestones.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Log Activity + Recent Activity */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Log Study Session</h3>
              </div>
              <div className="p-6">
                <LogActivity userId={profile.id} profile={profile} onActivityLogged={handleActivityLogged} />
              </div>
            </div>

            <div className="bg-white shadow rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
              </div>
              <div
                className="divide-y divide-gray-100 custom-scrollbar"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {activities.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No sessions yet.</p>
                  </div>
                ) : (
                  activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {activity.activity_type === "Reading" ? (
                            <BookOpen className="h-5 w-5 text-pink-500" />
                          ) : activity.activity_type === "Listening" ? (
                            <Headphones className="h-5 w-5 text-blue-500" />
                          ) : activity.activity_type === "Speaking" ? (
                            <Mic className="h-5 w-5 text-purple-500" />
                          ) : activity.activity_type === "Milestone" ? (
                            <Award className="h-5 w-5 text-amber-500" />
                          ) : (
                            <PenTool className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{activity.activity_type}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.logged_at).toLocaleString()}
                            {activity.duration > 0 && ` • ${activity.duration} min`} • {activity.xp_earned} XP
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {activities.length > 5 && (
                <div className="px-6 py-3 bg-gray-50 text-center">
                  <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                    View all sessions
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Milestones */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Next Milestones</h3>
              <Link
                to="/milestones"
                className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center"
              >
                View All <span className="ml-1">→</span>
              </Link>
            </div>
            <div className="divide-y divide-gray-100 custom-scrollbar">
              {nextMilestonesToShow.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">All milestones completed! Great job!</p>
                </div>
              ) : (
                nextMilestonesToShow.map((ms) => {
                  // Determine the category icon
                  let CategoryIcon = Award
                  let iconColor = "text-amber-500"

                  if (groupedMilestones.writing.some((m) => m.id === ms.id)) {
                    CategoryIcon = Pencil
                    iconColor = "text-pink-500"
                  } else if (groupedMilestones.vocabulary.some((m) => m.id === ms.id)) {
                    CategoryIcon = BookOpen
                    iconColor = "text-blue-500"
                  } else if (groupedMilestones.grammar.some((m) => m.id === ms.id)) {
                    CategoryIcon = List
                    iconColor = "text-green-500"
                  }

                  return (
                    <div key={ms.id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div className="flex">
                          <div className={`flex-shrink-0 mt-1 mr-3 ${iconColor}`}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{ms.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{ms.description}</p>
                            <div className="flex items-center mt-2">
                              <div className="flex items-center text-amber-500">
                                <Award className="h-4 w-4 mr-1" />
                                <span className="text-xs font-medium">{ms.xp_reward} XP</span>
                              </div>
                              {ms.badge && (
                                <span className="ml-3 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded">
                                  {ms.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                          onClick={() => claimMilestone(ms.id, ms.xp_reward, ms.title)}
                        >
                          Claim
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Analytics section - always visible at the bottom */}
        <div className="mt-6">
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Study Analytics</h3>
            </div>
            <div className="p-6">
              <Analytics userId={profile.id} studyLogs={activities} />
            </div>
          </div>
        </div>
      </main>

      {/* Edit Username Modal */}
      <Modal isOpen={isEditingUsername} onClose={() => setIsEditingUsername(false)} title="Edit Username">
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="Enter your username"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditingUsername(false)}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateUsername}
              className="flex-1 rounded-md bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />

      {/* Clear Progress Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirmModal}
        onClose={() => setShowClearConfirmModal(false)}
        onConfirm={handleClearAllProgress}
        title="Clear All Progress"
        message="Are you sure you want to clear all your progress? This will reset your XP, level, study hours, and delete all your study sessions. This action cannot be undone."
        confirmText="Yes, Clear Everything"
        cancelText="Cancel"
      />
    </div>
  )
}

export default Dashboard
