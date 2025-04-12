"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabaseClient"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import { Award, Clock, List, Pencil, BookOpen } from "lucide-react"
import { MilestoneCard } from "./MilestoneCard"
import { Header } from "./Header"

function MilestonesPage() {
  const { user } = useAuth()
  const [milestones, setMilestones] = useState<any[]>([])
  const [userMilestones, setUserMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  // Function to fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

    if (error) {
      console.error("Error fetching profile:", error)
    } else if (data) {
      setProfile(data)
    }
  }, [user])

  // Function to fetch milestones
  const fetchMilestones = useCallback(async () => {
    setIsLoading(true)

    try {
      // Fetch all milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from("milestones")
        .select("*")
        .order("xp_reward", { ascending: true })

      if (milestonesError) throw milestonesError

      setMilestones(milestonesData || [])

      // Fetch user's claimed milestones if user is logged in
      if (user) {
        const { data: userMilestonesData, error: userMilestonesError } = await supabase
          .from("user_milestones")
          .select("*")
          .eq("user_id", user.id)

        if (userMilestonesError) throw userMilestonesError

        setUserMilestones(userMilestonesData || [])
      }
    } catch (error) {
      console.error("Error fetching milestones:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Initial data loading
  useEffect(() => {
    fetchProfile()
    fetchMilestones()
  }, [fetchProfile, fetchMilestones])

  // Function to check if a milestone has been claimed
  const isMilestoneClaimed = useCallback(
    (milestoneId: number) => {
      return userMilestones.some((um) => um.milestone_id === milestoneId)
    },
    [userMilestones],
  )

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view milestones.</p>
          <Link
            to="/login"
            className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header activeItem="milestones" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Progress Summary */}
        {profile && (
          <div className="bg-white shadow rounded-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white rounded-full p-1 mr-4">
                  <Award className="h-10 w-10 text-violet-600" />
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{profile.username}</h2>
                  <div className="flex items-center mt-1">
                    <Award className="h-4 w-4 mr-1" />
                    <span>
                      {userMilestones.length} / {milestones.length} Milestones Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Award className="h-6 w-6 mr-2 text-violet-600" />
          Japanese Learning Milestones
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="border border-gray-200 rounded-lg p-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Writing System Milestones */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Pencil className="h-5 w-5 mr-2 text-pink-500" />
                Writing System Milestones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedMilestones.writing.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    isClaimed={isMilestoneClaimed(milestone.id)}
                    userId={user.id}
                    onMilestoneClaimed={fetchMilestones}
                  />
                ))}
              </div>
            </section>

            {/* Vocabulary Milestones */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                Vocabulary Milestones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedMilestones.vocabulary.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    isClaimed={isMilestoneClaimed(milestone.id)}
                    userId={user.id}
                    onMilestoneClaimed={fetchMilestones}
                  />
                ))}
              </div>
            </section>

            {/* Grammar Milestones */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <List className="h-5 w-5 mr-2 text-green-500" />
                Grammar Milestones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedMilestones.grammar.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    isClaimed={isMilestoneClaimed(milestone.id)}
                    userId={user.id}
                    onMilestoneClaimed={fetchMilestones}
                  />
                ))}
              </div>
            </section>

            {/* Practice & Study Milestones */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-amber-500" />
                Practice & Study Milestones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedMilestones.practice.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    isClaimed={isMilestoneClaimed(milestone.id)}
                    userId={user.id}
                    onMilestoneClaimed={fetchMilestones}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default MilestonesPage
