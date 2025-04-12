"use client"

import { Award, Check } from "lucide-react"
import { useState } from "react"
import { supabase } from "../supabaseClient"
import { SuccessModal } from "./Modal"

interface MilestoneCardProps {
  milestone: {
    id: number
    title: string
    description: string
    xp_reward: number
    badge: string | null
  }
  isClaimed: boolean
  userId: string
  onMilestoneClaimed: () => void
}

export function MilestoneCard({ milestone, isClaimed, userId, onMilestoneClaimed }: MilestoneCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleClaimMilestone = async () => {
    if (isClaimed || !userId) return

    setIsSubmitting(true)

    try {
      // 1. Insert into user_milestones
      const { error: insertError } = await supabase.from("user_milestones").insert({
        user_id: userId,
        milestone_id: milestone.id,
        claimed_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      // 2. Update user's XP in a separate function call
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("xp, level")
        .eq("id", userId)
        .single()

      if (profileError) throw profileError

      const newXP = (profileData?.xp || 0) + milestone.xp_reward
      const newLevel = Math.floor(newXP / 1000) + 1

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          xp: newXP,
          level: newLevel,
        })
        .eq("id", userId)

      if (updateError) throw updateError

      // 3. Add to study_logs to show in activity feed
      const { error: logError } = await supabase.from("study_logs").insert({
        user_id: userId,
        activity_type: "Milestone",
        description: `Achieved: ${milestone.title}`,
        duration: 0, // Milestones don't have duration
        xp_earned: milestone.xp_reward,
        logged_at: new Date().toISOString(),
      })

      if (logError) throw logError

      // 4. Show success message
      setSuccessMessage(`Milestone claimed! You earned ${milestone.xp_reward} XP`)
      setShowSuccessModal(true)

      // 5. Notify parent component
      onMilestoneClaimed()
    } catch (error) {
      console.error("Error claiming milestone:", error)
      alert("Failed to claim milestone. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
          <div className="flex items-center mt-2">
            <div className="flex items-center text-amber-500">
              <Award className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">{milestone.xp_reward} XP</span>
            </div>
            {milestone.badge && (
              <span className="ml-3 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded">
                {milestone.badge}
              </span>
            )}
          </div>
        </div>
        {isClaimed ? (
          <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-md">
            <Check className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Claimed</span>
          </div>
        ) : (
          <button
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70"
            onClick={handleClaimMilestone}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Claiming..." : "Claim"}
          </button>
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
    </div>
  )
}
