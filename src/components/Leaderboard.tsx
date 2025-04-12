"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import { Link } from "react-router-dom"
import { ArrowLeft, Crown, Medal, Trophy, User } from "lucide-react"

function Leaderboard() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProfiles() {
      setIsLoading(true)
      const { data, error } = await supabase.from("profiles").select("*").order("xp", { ascending: false })

      if (error) console.error(error)
      else setProfiles(data)

      setIsLoading(false)
    }
    fetchProfiles()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/" className="flex items-center text-gray-700 hover:text-violet-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  )
}

export default Leaderboard
