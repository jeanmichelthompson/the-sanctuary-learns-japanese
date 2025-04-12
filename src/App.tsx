"use client"

// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./components/Dashboard"
import Login from "./components/Login"
import Leaderboard from "./components/Leaderboard"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { type JSX, StrictMode } from "react"

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()

  if (loading) {
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

  if (!user) return <Navigate to="/login" />

  return children
}

function App() {
  return (
    <StrictMode>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </StrictMode>
  )
}

export default App
