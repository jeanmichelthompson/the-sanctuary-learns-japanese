"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import { Eye, EyeOff, Languages } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const { user } = useAuth()
  const navigate = useNavigate()

  // Automatically navigate to dashboard if user is authenticated
  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  const validateFields = () => {
    if (!email || !password) {
      setErrorMessage("Please fill in both your email and password.")
      return false
    }
    return true
  }

  const handleLogin = async () => {
    if (!validateFields()) return

    setErrorMessage("")
    setSuccessMessage("")
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
    } else {
      setSuccessMessage("Logged in successfully!")
      // The useEffect will redirect because the auth context updates with the new user.
    }
  }

  const handleSignup = async () => {
    if (!validateFields()) return

    setErrorMessage("")
    setSuccessMessage("")
    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
    } else {
      setSuccessMessage("Sign up successful! Please check your email for the confirmation link.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-indigo-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <Languages className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-center">The Sanctuary</h1>
          <p className="text-center opacity-90">Learns Japanese</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Error message */}
          {errorMessage && (
            <div className="px-4 py-2 text-red-700 bg-red-100 border border-red-200 rounded-md">
              {errorMessage}
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="px-4 py-2 text-green-700 bg-green-100 border border-green-200 rounded-md">
              {successMessage}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <button
              onClick={handleSignup}
              disabled={isLoading}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-70"
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
