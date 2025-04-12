"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Award, BookOpen, Home, LogOut, Menu, Trophy } from "lucide-react"
import { supabase } from "../supabaseClient"

interface HeaderProps {
  activeItem?: "home" | "leaderboard" | "resources" | "milestones"
}

export function Header({ activeItem }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
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
              className={`${
                activeItem === "home" ? "text-violet-600" : "text-gray-700 hover:text-violet-600"
              } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <Link
              to="/leaderboard"
              className={`${
                activeItem === "leaderboard" ? "text-violet-600" : "text-gray-700 hover:text-violet-600"
              } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
            >
              <Trophy className="h-4 w-4 mr-1" />
              Community
            </Link>
            <Link
              to="/resources"
              className={`${
                activeItem === "resources" ? "text-violet-600" : "text-gray-700 hover:text-violet-600"
              } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Resources
            </Link>
            <Link
              to="/milestones"
              className={`${
                activeItem === "milestones" ? "text-violet-600" : "text-gray-700 hover:text-violet-600"
              } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
            >
              <Award className="h-4 w-4 mr-1" />
              Milestones
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
              className={`${
                activeItem === "home" ? "text-violet-600" : "text-gray-700 hover:text-violet-600"
              } px-3 py-2 rounded-md text-base font-medium flex items-center`}
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link
              to="/leaderboard"
              className={`${
                activeItem === "leaderboard" ? "text-violet-600" : "text-gray-700 hover:text-violet-600"
              } px-3 py-2 rounded-md text-base font-medium flex items-center`}
            >
              <Trophy className="h-5 w-5 mr-2" />
              Community
            </Link>
            <Link
              to="/resources"
              className={`${
                activeItem === "resources" ? "text-violet-600" : "text-gray-700 hover:text-violet-600"
              } px-3 py-2 rounded-md text-base font-medium flex items-center`}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Resources
            </Link>
            <Link
              to="/milestones"
              className={`${
                activeItem === "milestones" ? "text-violet-600" : "text-gray-700 hover:text-violet-600"
              } px-3 py-2 rounded-md text-base font-medium flex items-center`}
            >
              <Award className="h-5 w-5 mr-2" />
              Milestones
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
  )
}

// Languages icon component
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
