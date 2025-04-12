"use client"

import type React from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabaseClient"
import LogActivity from "./LogActivity"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import { Award, BookOpen, Clock, Crown, Edit2, Home, LogOut, Menu, Trophy, User } from "lucide-react"
import { Modal, SuccessModal } from "./Modal"

function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)

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
    const { data, error } = await supabase.from("study_logs").select("*").order("logged_at", { ascending: false })
    if (error) console.error(error)
    else setActivities(data)
  }, [])

  // Function to fetch milestones
  const fetchMilestones = useCallback(async () => {
    const { data, error } = await supabase.from("milestones").select("*")
    if (error) console.error(error)
    else setMilestones(data)
  }, [])

  // Initial data loading
  useEffect(() => {
    fetchProfile()
    fetchActivities()
    fetchMilestones()
  }, [fetchProfile, fetchActivities, fetchMilestones, user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

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
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Leaderboard
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
                className=" text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <Home className="h-5 w-5 mr-2" />
                Home
              </Link>
              <Link
                to="/leaderboard"
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Leaderboard
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile card */}
        <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4">
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
          </div>

          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-violet-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Total Study Time</p>
                  <p className="font-semibold">{profile.study_hours} hours</p>
                </div>
              </div>

              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-violet-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Activities</p>
                  <p className="font-semibold">{activities.length}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Award className="h-5 w-5 text-violet-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Milestones</p>
                  <p className="font-semibold">{milestones.length} available</p>
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
                <h3 className="text-lg font-semibold text-gray-900">Log Study Activity</h3>
              </div>
              <div className="p-6">
                <LogActivity userId={profile.id} profile={profile} onActivityLogged={handleActivityLogged} />
              </div>
            </div>

            <div className="bg-white shadow rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {activities.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No activities yet. Start logging your study sessions!</p>
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
                          ) : (
                            <PenTool className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{activity.activity_type}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.logged_at).toLocaleString()} • {activity.duration} min •{" "}
                            {activity.xp_earned} XP
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
                    View all activities
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Milestones */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {milestones.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No milestones available yet.</p>
                </div>
              ) : (
                milestones.map((ms) => (
                  <div key={ms.id} className="px-6 py-4">
                    <div className="flex justify-between items-start">
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
                      <button
                        className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from("user_milestones")
                              .insert({ user_id: profile.id, milestone_id: ms.id })

                            if (error) throw error

                            // Show success message
                            setSuccessMessage("Milestone claimed successfully!")
                            setShowSuccessModal(true)

                            // Update profile to reflect new XP
                            fetchProfile()
                          } catch (error: any) {
                            alert(error.message || "Failed to claim milestone")
                          }
                        }}
                      >
                        Claim
                      </button>
                    </div>
                  </div>
                ))
              )}
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
    </div>
  )
}

export default Dashboard

// Add missing icon components
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

function Headphones(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

function PenTool(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/  {
  return (
    <svg
      {...props}
      xmlns="
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  )
}
