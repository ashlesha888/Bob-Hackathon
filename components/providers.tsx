'use client'

import React from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { AuthModal } from '@/components/auth/auth-modal'
import { ToastNotification } from '@/components/auth/toast-notification'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AuthModal />
      <ToastNotification />
    </AuthProvider>
  )
}
