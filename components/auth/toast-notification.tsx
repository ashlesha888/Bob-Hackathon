'use client'

import React, { useEffect } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function ToastNotification() {
  const { toastMessage, clearToast } = useAuth()

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage, clearToast])

  if (!toastMessage) return null

  const icons = {
    success: <CheckCircle2 className="size-4 text-success" />,
    error: <AlertTriangle className="size-4 text-destructive" />,
    info: <Info className="size-4 text-primary" />,
  }

  const borderStyles = {
    success: 'border-success/30 bg-card/95 text-foreground shadow-success/10',
    error: 'border-destructive/30 bg-card/95 text-foreground shadow-destructive/10',
    info: 'border-primary/30 bg-card/95 text-foreground shadow-primary/10',
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center gap-3 ${borderStyles[toastMessage.type]}`}>
        {icons[toastMessage.type]}
        <p className="text-sm font-medium pr-2">{toastMessage.text}</p>
        <button
          type="button"
          onClick={clearToast}
          className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
