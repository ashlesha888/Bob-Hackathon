'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function AuthModal() {
  const { isAuthModalOpen, authModalView, closeAuthModal, login, signup, openAuthModal } = useAuth()

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Validation & feedback state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ usernameOrEmail?: string; password?: string; name?: string }>({})

  // Input focus ref
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset form & auto-focus when modal opens/closes or view changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg(null)
      setFieldErrors({})
      // Autofocus input after brief delay for smooth modal transition
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isAuthModalOpen, authModalView])

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthModalOpen, closeAuthModal])

  if (!isAuthModalOpen) return null

  // Validate fields before sending request
  const validateForm = (): boolean => {
    const errors: { usernameOrEmail?: string; password?: string; name?: string } = {}
    let isValid = true

    if (authModalView === 'signup' && !name.trim()) {
      errors.name = 'Full name is required'
      isValid = false
    }

    const trimmedUser = usernameOrEmail.trim()
    if (!trimmedUser) {
      errors.usernameOrEmail = authModalView === 'signin' ? 'Username or email address is required' : 'Email address is required'
      isValid = false
    } else if (authModalView === 'signup' && !trimmedUser.includes('@')) {
      errors.usernameOrEmail = 'Please enter a valid email address'
      isValid = false
    } else if (authModalView === 'signin' && !trimmedUser.includes('@') && trimmedUser.length < 3) {
      errors.usernameOrEmail = 'Username must be at least 3 characters'
      isValid = false
    }

    if (!password) {
      errors.password = 'Password is required'
      isValid = false
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (authModalView === 'signin') {
        const result = await login(usernameOrEmail, password, rememberMe)
        if (!result.success) {
          setErrorMsg(result.error || 'Failed to sign in. Please check your credentials.')
        }
      } else {
        const result = await signup(name, usernameOrEmail, password)
        if (!result.success) {
          setErrorMsg(result.error || 'Failed to create account. Please try again.')
        }
      }
    } catch {
      setErrorMsg('An unexpected error occurred during authentication. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickDemoFill = () => {
    setUsernameOrEmail('alex@align.ai')
    setPassword('password123')
    setErrorMsg(null)
    setFieldErrors({})
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl shadow-primary/10 transition-all animate-in zoom-in-95 duration-200">
        {/* Glow backdrop inside modal */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-violet/15 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close sign-in dialog"
          className="absolute right-5 top-5 grid size-8 place-items-center rounded-full border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary hover:text-foreground cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Header Tabs */}
        <div className="relative flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3" />
              ALIGN.AI AUTHENTICATION
            </span>
          </div>

          <h2 id="auth-modal-title" className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {authModalView === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {authModalView === 'signin'
              ? 'Enter your username or email and password to access your AI coach.'
              : 'Join ALIGN.AI today for personalized movement feedback and tracking.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex rounded-xl border border-border bg-secondary/30 p-1">
          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all cursor-pointer ${
              authModalView === 'signin'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all cursor-pointer ${
              authModalView === 'signup'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Global Error Alert Banner */}
        {errorMsg && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-foreground animate-in fade-in duration-150">
            <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Authentication Failed</p>
              <p className="mt-0.5 text-muted-foreground">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss error message"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
          {authModalView === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name-input" className="text-xs font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="size-4" />
                </span>
                <input
                  id="name-input"
                  type="text"
                  placeholder="Alex Chen"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  className={`w-full rounded-xl border bg-secondary/40 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                    fieldErrors.name ? 'border-destructive' : 'border-border'
                  }`}
                />
              </div>
              {fieldErrors.name && <p className="text-[11px] text-destructive">{fieldErrors.name}</p>}
            </div>
          )}

          {/* Username or Email Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username-email-input" className="text-xs font-medium text-foreground">
              {authModalView === 'signin' ? 'Username or Email' : 'Email Address'}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="size-4" />
              </span>
              <input
                ref={inputRef}
                id="username-email-input"
                type="text"
                autoComplete="username"
                placeholder={authModalView === 'signin' ? 'alex@align.ai or alex_coach' : 'alex@example.com'}
                value={usernameOrEmail}
                onChange={(e) => {
                  setUsernameOrEmail(e.target.value)
                  if (fieldErrors.usernameOrEmail) setFieldErrors((prev) => ({ ...prev, usernameOrEmail: undefined }))
                  if (errorMsg) setErrorMsg(null)
                }}
                className={`w-full rounded-xl border bg-secondary/40 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                  fieldErrors.usernameOrEmail ? 'border-destructive' : 'border-border'
                }`}
                aria-invalid={!!fieldErrors.usernameOrEmail}
              />
            </div>
            {fieldErrors.usernameOrEmail && (
              <p className="text-[11px] text-destructive">{fieldErrors.usernameOrEmail}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password-input" className="text-xs font-medium text-foreground">
                Password
              </label>
              {authModalView === 'signin' && (
                <button
                  type="button"
                  onClick={() => setErrorMsg('Demo Hint: Try "alex@align.ai" with password "password123" or click "Fill Demo Credentials" below!')}
                  className="text-[11px] text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="size-4" />
              </span>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete={authModalView === 'signin' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  if (errorMsg) setErrorMsg(null)
                }}
                className={`w-full rounded-xl border bg-secondary/40 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                  fieldErrors.password ? 'border-destructive' : 'border-border'
                }`}
                aria-invalid={!!fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-[11px] text-destructive">{fieldErrors.password}</p>}
          </div>

          {/* Remember me option for Sign In */}
          {authModalView === 'signin' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border bg-secondary/40 text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                Remember me on this device
              </label>

              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                <KeyRound className="size-3" />
                Fill Demo Credentials
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-violet to-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 disabled:pointer-events-none disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {authModalView === 'signin' ? 'Authenticating...' : 'Creating Account...'}
              </>
            ) : (
              <>
                {authModalView === 'signin' ? 'Sign In to ALIGN.AI' : 'Create Account'}
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          {/* Preset Demo Account Quick Banner */}
          {authModalView === 'signin' && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-border/60 bg-secondary/20 p-2.5 text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-3.5 text-success" />
                <span className="text-muted-foreground">Demo Credentials:</span>
              </div>
              <code className="rounded bg-secondary/60 px-1.5 py-0.5 text-foreground font-mono text-[10px]">
                alex@align.ai / password123
              </code>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

