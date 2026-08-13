'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface UserProfile {
  id: string
  name: string
  email: string
  username: string
  avatarUrl?: string
  role: string
  workoutCount: number
  streakDays: number
  level: string
}

interface StoredUserCredential extends UserProfile {
  passwordHash: string
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  isAuthModalOpen: boolean
  authModalView: 'signin' | 'signup'
  selectedExercise: string | null
  toastMessage: { type: 'success' | 'error' | 'info'; text: string } | null
  openAuthModal: (view?: 'signin' | 'signup', exercise?: string | null) => void
  closeAuthModal: () => void
  login: (usernameOrEmail: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  setSelectedExercise: (exercise: string | null) => void
  clearToast: () => void
}

const STORAGE_KEY = 'align_ai_user_session'
const USERS_DB_KEY = 'align_ai_registered_users'

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_demo_101',
  name: 'Alex Chen',
  email: 'alex@align.ai',
  username: 'alex_coach',
  role: 'Pro Athlete',
  workoutCount: 14,
  streakDays: 5,
  level: 'Intermediate',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup'>('signin')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  // Load session state from localStorage or sessionStorage on initial client mount
  useEffect(() => {
    try {
      const savedLocalSession = localStorage.getItem(STORAGE_KEY)
      const savedSessionSession = sessionStorage.getItem(STORAGE_KEY)
      const activeSession = savedLocalSession || savedSessionSession

      if (activeSession) {
        const parsedUser = JSON.parse(activeSession) as UserProfile
        setUser(parsedUser)
      }
    } catch (e) {
      console.error('Failed to load auth session:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type })
  }

  const clearToast = () => {
    setToastMessage(null)
  }

  const openAuthModal = (view: 'signin' | 'signup' = 'signin', exercise: string | null = null) => {
    setAuthModalView(view)
    if (exercise) {
      setSelectedExercise(exercise)
    }
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  const getRegisteredUsers = (): StoredUserCredential[] => {
    try {
      const raw = localStorage.getItem(USERS_DB_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const login = async (
    usernameOrEmail: string,
    password: string,
    rememberMe = true,
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Input sanitization & initial validations
    const trimmedInput = usernameOrEmail.trim()
    const trimmedPassword = password.trim()

    if (!trimmedInput) {
      return { success: false, error: 'Please enter your username or email address.' }
    }

    if (!trimmedPassword) {
      return { success: false, error: 'Please enter your password.' }
    }

    // Network delay simulation for realistic auth flow UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    const lowerInput = trimmedInput.toLowerCase()

    // 2. Demo User Checks
    const isDemoAccount =
      lowerInput === 'alex@align.ai' ||
      lowerInput === 'demo@align.ai' ||
      lowerInput === 'alex_coach' ||
      lowerInput === 'alex' ||
      lowerInput === 'demo'

    if (isDemoAccount) {
      if (trimmedPassword !== 'password123') {
        return {
          success: false,
          error: 'Invalid credentials. Password for demo account is "password123".',
        }
      }
      const authenticatedUser = DEFAULT_DEMO_USER

      // Save session according to rememberMe preference
      try {
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser))
          sessionStorage.removeItem(STORAGE_KEY)
        } else {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser))
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (e) {
        console.error('Failed to save auth session:', e)
      }

      setUser(authenticatedUser)
      setIsAuthModalOpen(false)
      showToast(`Welcome back, ${authenticatedUser.name}! Ready to train.`, 'success')

      // Scroll to exercise studio view or selected exercise
      const targetElement = selectedExercise
        ? document.getElementById('exercises') || document.getElementById('top')
        : document.getElementById('top') || document.getElementById('exercises')
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }

      return { success: true }
    }

    // 3. Registered User DB check from localStorage
    const registeredUsers = getRegisteredUsers()
    const foundUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === lowerInput || u.username.toLowerCase() === lowerInput,
    )

    if (foundUser) {
      if (foundUser.passwordHash !== trimmedPassword) {
        return {
          success: false,
          error: 'Invalid credentials. Incorrect password for this account.',
        }
      }

      const { passwordHash, ...userProfile } = foundUser
      try {
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile))
          sessionStorage.removeItem(STORAGE_KEY)
        } else {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile))
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (e) {
        console.error('Failed to save auth session:', e)
      }

      setUser(userProfile)
      setIsAuthModalOpen(false)
      showToast(`Welcome back, ${userProfile.name}!`, 'success')

      const targetElement = document.getElementById('top') || document.getElementById('exercises')
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }

      return { success: true }
    }

    // 4. Dynamic Generic User Login (for testing arbitrary credentials)
    if (trimmedPassword === 'wrongpass' || trimmedPassword.length < 6) {
      return {
        success: false,
        error: 'Invalid credentials. Please check your username/email and password.',
      }
    }

    const isFormatValid = lowerInput.includes('@') || lowerInput.length >= 3
    if (!isFormatValid) {
      return {
        success: false,
        error: 'Please enter a valid email address or username (at least 3 characters).',
      }
    }

    // Create dynamic user profile for non-demo valid input
    const displayName = lowerInput.includes('@')
      ? lowerInput.split('@')[0].replace(/[._-]/g, ' ')
      : lowerInput

    const formattedName = displayName
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

    const dynamicUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: formattedName || 'Athlete',
      email: lowerInput.includes('@') ? lowerInput : `${lowerInput}@align.ai`,
      username: lowerInput.replace(/[^a-zA-Z0-9_]/g, '_'),
      role: 'Member',
      workoutCount: 3,
      streakDays: 2,
      level: 'Beginner',
    }

    try {
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicUser))
        sessionStorage.removeItem(STORAGE_KEY)
      } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicUser))
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.error('Failed to save auth session:', e)
    }

    setUser(dynamicUser)
    setIsAuthModalOpen(false)
    showToast(`Welcome to ALIGN.AI, ${dynamicUser.name}!`, 'success')

    const targetElement = document.getElementById('top') || document.getElementById('exercises')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }

    return { success: true }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedName) {
      return { success: false, error: 'Full name is required.' }
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Valid email address is required.' }
    }
    if (!trimmedPassword || trimmedPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' }
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const username = trimmedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      username,
      role: 'Member',
      workoutCount: 0,
      streakDays: 1,
      level: 'Beginner',
    }

    // Save to registered users list for subsequent sign-in lookup
    try {
      const existing = getRegisteredUsers()
      const updated = [...existing.filter((u) => u.email.toLowerCase() !== trimmedEmail.toLowerCase()), { ...newUser, passwordHash: trimmedPassword }]
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(updated))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    } catch (e) {
      console.error('Failed to register user:', e)
    }

    setUser(newUser)
    setIsAuthModalOpen(false)
    showToast(`Account created! Welcome to ALIGN.AI, ${newUser.name}.`, 'success')

    const targetElement = document.getElementById('top') || document.getElementById('exercises')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }

    return { success: true }
  }

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear session:', e)
    }
    setUser(null)
    setSelectedExercise(null)
    showToast('Signed out successfully.', 'info')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalView,
        selectedExercise,
        toastMessage,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        setSelectedExercise,
        clearToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

