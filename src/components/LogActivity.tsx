"use client"

import type React from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { supabase } from "../supabaseClient"
import { BookOpen, Headphones, PenTool, Info } from "lucide-react"
import { calculateXP, explainXPCalculation } from "../lib/xpCalculator"
import { Modal, SuccessModal, ErrorModal } from "./Modal"

interface LogActivityProps {
  userId: string
  profile: any
  onActivityLogged?: () => void
}

function LogActivity({ userId, profile, onActivityLogged }: LogActivityProps) {
  const [activityType, setActivityType] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showXPInfoModal, setShowXPInfoModal] = useState(false)

  const parsedDuration = Number.parseFloat(duration) || 0
  const estimatedXP = activityType && parsedDuration > 0 ? calculateXP(activityType, parsedDuration) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activityType || !duration) {
      setErrorMessage("Please select an activity type and enter a duration")
      setShowErrorModal(true)
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate XP using our new formula
      const xpEarned = calculateXP(activityType, parsedDuration)

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

      // Show success message
      setSuccessMessage(`Study activity logged! You earned ${xpEarned} XP`)
      setShowSuccessModal(true)

      // Notify parent component that activity was logged
      if (onActivityLogged) {
        onActivityLogged()
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred")
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 right-5 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">min</span>
            </div>
          </div>
          {estimatedXP > 0 && (
            <div className="mt-2 flex items-center">
              <p className="text-sm text-gray-600">You'll earn approximately {estimatedXP} XP for this activity</p>
              <button
                type="button"
                onClick={() => setShowXPInfoModal(true)}
                className="ml-1 text-violet-500 hover:text-violet-600"
              >
                <Info className="h-4 w-4" />
                <span className="sr-only">XP calculation info</span>
              </button>
            </div>
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

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />

      {/* Error Modal */}
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} message={errorMessage} />

      {/* XP Info Modal */}
      <Modal isOpen={showXPInfoModal} onClose={() => setShowXPInfoModal(false)} title="XP Calculation">
        <div>
          <p className="mb-4 text-gray-700">XP is calculated based on several factors:</p>
          <div className="bg-gray-50 p-3 rounded-md mb-4 whitespace-pre-line font-mono text-sm">
            {activityType && parsedDuration > 0
              ? explainXPCalculation(activityType, parsedDuration)
              : "Select an activity type and enter a duration to see the calculation."}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Different activities have different multipliers to reward more challenging study methods. Longer study
            sessions also earn bonus XP to encourage deeper learning.
          </p>
          <button
            onClick={() => setShowXPInfoModal(false)}
            className="w-full rounded-md bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            Got it
          </button>
        </div>
      </Modal>
    </>
  )
}

export default LogActivity
