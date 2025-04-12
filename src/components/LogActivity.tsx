"use client"

import type React from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { supabase } from "../supabaseClient"
import { BookOpen, Headphones, PenTool } from "lucide-react"

interface LogActivityProps {
  userId: string
  profile: any // so we can reference profile.xp if needed
}

function LogActivity({ userId, profile }: LogActivityProps) {
  const [activityType, setActivityType] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activityType || !duration) {
      alert("Please select an activity type and enter a duration")
      return
    }

    setIsSubmitting(true)

    // Convert the duration string to a number
    const parsedDuration = Number.parseFloat(duration) || 0
    const xpEarned = Math.floor(parsedDuration * 10)

    try {
      // 1) Insert new study log
      const { error } = await supabase.from("study_logs").insert({
        user_id: userId,
        activity_type: activityType,
        description,
        duration: parsedDuration,
        xp_earned: xpEarned,
        logged_at: new Date().toISOString(),
      })

      if (error) throw error

      // 2) Update the user's XP in their profile
      await supabase
        .from("profiles")
        .update({
          xp: (profile?.xp ?? 0) + xpEarned,
          study_hours: (profile?.study_hours ?? 0) + parsedDuration / 60,
        })
        .eq("id", userId)

      // Reset form fields
      setActivityType("")
      setDescription("")
      setDuration("")

      alert(`Study activity logged! Earned ${xpEarned} XP`)
    } catch (error: any) {
      alert(error.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
              activityType === "Reading"
                ? "bg-pink-50 border-pink-200 text-pink-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setActivityType("Reading")}
          >
            <BookOpen className={`h-6 w-6 ${activityType === "Reading" ? "text-pink-500" : "text-gray-400"}`} />
            <span className="mt-1 text-sm font-medium">Reading</span>
          </button>

          <button
            type="button"
            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
              activityType === "Listening"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setActivityType("Listening")}
          >
            <Headphones className={`h-6 w-6 ${activityType === "Listening" ? "text-blue-500" : "text-gray-400"}`} />
            <span className="mt-1 text-sm font-medium">Listening</span>
          </button>

          <button
            type="button"
            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
              activityType === "Grammar"
                ? "bg-green-50 border-green-200 text-green-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setActivityType("Grammar")}
          >
            <PenTool className={`h-6 w-6 ${activityType === "Grammar" ? "text-green-500" : "text-gray-400"}`} />
            <span className="mt-1 text-sm font-medium">Grammar</span>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description/Notes
        </label>
        <textarea
          id="description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          placeholder="What did you study? What did you learn?"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
          Duration (minutes)
        </label>
        <div className="relative rounded-md shadow-sm">
          <input
            id="duration"
            type="number"
            min="1"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            placeholder="30"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500 sm:text-sm">min</span>
          </div>
        </div>
        {duration && (
          <p className="mt-1 text-sm text-gray-500">
            You'll earn approximately {Math.floor(Number.parseFloat(duration) * 10)} XP for this activity.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !activityType || !duration}
        className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70"
      >
        {isSubmitting ? "Logging..." : "Log Activity"}
      </button>
    </form>
  )
}

export default LogActivity
