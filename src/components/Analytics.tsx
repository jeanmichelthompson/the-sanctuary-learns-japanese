/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"
import { BarChart, PieChart, Calendar, Clock, BookOpen, Headphones, Mic, PenTool, TrendingUp } from "lucide-react"
import { cn } from "../lib/utils"

interface AnalyticsProps {
  userId: string
  studyLogs: any[]
  className?: string
}

export function Analytics({ studyLogs, className }: AnalyticsProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("week")

  // Filter logs based on selected timeframe
  const filteredLogs = useMemo(() => {
    if (timeframe === "all") return studyLogs

    const now = new Date()
    const cutoffDate = new Date()

    if (timeframe === "week") {
      cutoffDate.setDate(now.getDate() - 7)
    } else if (timeframe === "month") {
      cutoffDate.setMonth(now.getMonth() - 1)
    }

    return studyLogs.filter((log) => new Date(log.logged_at) >= cutoffDate)
  }, [studyLogs, timeframe])

  // Calculate total study time
  const totalStudyTime = useMemo(() => {
    return filteredLogs.reduce((total, log) => {
      // Skip milestone logs which have 0 duration
      if (log.activity_type === "Milestone") return total
      return total + (log.duration || 0)
    }, 0)
  }, [filteredLogs])

  // Calculate activity type distribution
  const activityDistribution = useMemo(() => {
    const distribution: Record<string, { minutes: number; sessions: number; color: string }> = {
      Reading: { minutes: 0, sessions: 0, color: "bg-pink-500" },
      Listening: { minutes: 0, sessions: 0, color: "bg-blue-500" },
      Grammar: { minutes: 0, sessions: 0, color: "bg-green-500" },
      Speaking: { minutes: 0, sessions: 0, color: "bg-purple-500" },
      Milestone: { minutes: 0, sessions: 0, color: "bg-amber-500" },
    }

    filteredLogs.forEach((log) => {
      const type = log.activity_type
      if (distribution[type]) {
        distribution[type].minutes += log.duration || 0
        distribution[type].sessions += 1
      }
    })

    return distribution
  }, [filteredLogs])

  // Calculate study streak (consecutive days)
  const streak = useMemo(() => {
    if (filteredLogs.length === 0) return 0

    const dates = filteredLogs.map((log) => {
      const date = new Date(log.logged_at)
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    })

    // Get unique dates
    const uniqueDates = [...new Set(dates)].sort()

    // If no study today, streak is 0
    const today = new Date()
    const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    const yesterdayDate = new Date(today)
    yesterdayDate.setDate(today.getDate() - 1)
    const yesterdayString = `${yesterdayDate.getFullYear()}-${yesterdayDate.getMonth() + 1}-${yesterdayDate.getDate()}`

    if (
      uniqueDates[uniqueDates.length - 1] !== todayString &&
      uniqueDates[uniqueDates.length - 1] !== yesterdayString
    ) {
      return 0
    }

    // Count consecutive days
    let currentStreak = 1
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const currentDate = new Date(uniqueDates[i + 1])
      const prevDate = new Date(uniqueDates[i])

      currentDate.setDate(currentDate.getDate() - 1)

      if (
        currentDate.getFullYear() === prevDate.getFullYear() &&
        currentDate.getMonth() === prevDate.getMonth() &&
        currentDate.getDate() === prevDate.getDate()
      ) {
        currentStreak++
      } else {
        break
      }
    }

    return currentStreak
  }, [filteredLogs])

  // Calculate average session length
  const averageSessionLength = useMemo(() => {
    const nonMilestoneLogs = filteredLogs.filter((log) => log.activity_type !== "Milestone")
    if (nonMilestoneLogs.length === 0) return 0

    const totalMinutes = nonMilestoneLogs.reduce((total, log) => total + (log.duration || 0), 0)
    return Math.round(totalMinutes / nonMilestoneLogs.length)
  }, [filteredLogs])

  // Calculate most active day of week
  const mostActiveDay = useMemo(() => {
    if (filteredLogs.length === 0) return { day: "N/A", minutes: 0 }

    const dayMinutes: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    filteredLogs.forEach((log) => {
      if (log.activity_type !== "Milestone") {
        const date = new Date(log.logged_at)
        const day = dayNames[date.getDay()]
        dayMinutes[day] += log.duration || 0
      }
    })

    let maxDay = "N/A"
    let maxMinutes = 0

    Object.entries(dayMinutes).forEach(([day, minutes]) => {
      if (minutes > maxMinutes) {
        maxDay = day
        maxMinutes = minutes
      }
    })

    return { day: maxDay, minutes: maxMinutes }
  }, [filteredLogs])

  // Calculate most studied activity type
  const mostStudiedActivity = useMemo(() => {
    if (filteredLogs.length === 0) return { type: "N/A", minutes: 0 }

    let maxType = "N/A"
    let maxMinutes = 0

    Object.entries(activityDistribution).forEach(([type, data]) => {
      if (data.minutes > maxMinutes) {
        maxType = type
        maxMinutes = data.minutes
      }
    })

    return { type: maxType, minutes: maxMinutes }
  }, [activityDistribution, filteredLogs.length])

  // Calculate daily study time for the past week
  const dailyStudyTime = useMemo(() => {
    const last7Days: Record<string, number> = {}
    const today = new Date()

    // Initialize the last 7 days with 0 minutes
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      last7Days[dateString] = 0
    }

    // Fill in the actual study time
    filteredLogs.forEach((log) => {
      if (log.activity_type !== "Milestone") {
        const date = new Date(log.logged_at)
        const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

        if (last7Days[dateString] !== undefined) {
          last7Days[dateString] += log.duration || 0
        }
      }
    })

    return Object.entries(last7Days).map(([date, minutes]) => ({
      date,
      minutes,
      displayDate: new Date(date).toLocaleDateString(undefined, { weekday: "short" }),
    }))
  }, [filteredLogs])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Timeframe selector */}
      <div className="flex justify-end">
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeframe("week")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === "week" ? "bg-violet-100 text-violet-700 font-medium" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Past Week
          </button>
          <button
            onClick={() => setTimeframe("month")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === "month" ? "bg-violet-100 text-violet-700 font-medium" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Past Month
          </button>
          <button
            onClick={() => setTimeframe("all")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === "all" ? "bg-violet-100 text-violet-700 font-medium" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-violet-100 p-3 rounded-full mr-4">
            <Clock className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Study Time</p>
            <p className="text-xl font-semibold">{Math.round(totalStudyTime)} min</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-amber-100 p-3 rounded-full mr-4">
            <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Streak</p>
            <p className="text-xl font-semibold">{streak} days</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <BarChart className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg. Session</p>
            <p className="text-xl font-semibold">{averageSessionLength} min</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Most Active Day</p>
            <p className="text-xl font-semibold">{mostActiveDay.day}</p>
          </div>
        </div>
      </div>

      {/* Activity distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Activity Distribution</h4>

          {Object.entries(activityDistribution).map(([type, data]) => (
            <div key={type} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  {type === "Reading" ? (
                    <BookOpen className="h-4 w-4 text-pink-500 mr-2" />
                  ) : type === "Listening" ? (
                    <Headphones className="h-4 w-4 text-blue-500 mr-2" />
                  ) : type === "Grammar" ? (
                    <PenTool className="h-4 w-4 text-green-500 mr-2" />
                  ) : type === "Speaking" ? (
                    <Mic className="h-4 w-4 text-purple-500 mr-2" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-amber-500 mr-2" />
                  )}
                  <span className="text-sm text-gray-700">{type}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {data.minutes} min ({data.sessions} sessions)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${data.color} h-2 rounded-full`}
                  style={{
                    width: `${totalStudyTime > 0 ? (data.minutes / totalStudyTime) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Daily study time chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Daily Study Time (Past Week)</h4>

          <div className="flex items-end h-40 space-x-2">
            {dailyStudyTime.map((day) => {
              // Calculate height percentage (max 100%)
              const maxMinutes = Math.max(...dailyStudyTime.map((d) => d.minutes))
              const heightPercentage = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex justify-center mb-1">
                    <div
                      className={`w-full max-w-[30px] rounded-t-md ${day.minutes > 0 ? "bg-violet-500" : "bg-gray-200"}`}
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{day.displayDate}</span>
                  <span className="text-xs font-medium">{day.minutes > 0 ? `${day.minutes}m` : ""}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Study Insights</h4>

        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <p className="text-sm text-gray-500">No study data available for the selected timeframe.</p>
          ) : (
            <>
              <div className="flex items-start">
                <div className="bg-violet-100 p-2 rounded-full mr-3">
                  <PieChart className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    Your most studied activity is <span className="font-medium">{mostStudiedActivity.type}</span> with{" "}
                    {mostStudiedActivity.minutes} minutes.
                  </p>
                </div>
              </div>

              {streak > 0 && (
                <div className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">You're on a {streak} day study streak! Keep it up!</p>
                  </div>
                </div>
              )}

              {mostActiveDay.day !== "N/A" && (
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      {mostActiveDay.day} is your most productive day with {mostActiveDay.minutes} minutes of study.
                    </p>
                  </div>
                </div>
              )}

              {averageSessionLength > 0 && (
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      Your average study session is {averageSessionLength} minutes long.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
