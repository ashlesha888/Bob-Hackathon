'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Activity, Award, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  // Get user initials
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-full border border-border bg-secondary/40 py-1 pl-1 pr-3 text-sm text-foreground transition-all hover:border-primary/40 hover:bg-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary to-violet font-display text-xs font-bold text-primary-foreground">
          {initials}
        </span>
        <span className="max-w-[100px] truncate font-medium sm:max-w-[120px]">{user.name}</span>
        <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-violet font-display text-sm font-bold text-primary-foreground">
                {initials}
              </span>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
              <span className="inline-flex items-center gap-1 text-primary font-medium">
                <Award className="size-3" />
                {user.level}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Activity className="size-3 text-success" />
                {user.workoutCount} Workouts
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-1.5 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                const section = document.getElementById('exercises') || document.getElementById('top')
                if (section) section.scrollIntoView({ behavior: 'smooth' })
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <Activity className="size-3.5 text-primary" />
              Exercise Studio
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false)
                const section = document.getElementById('progress')
                if (section) section.scrollIntoView({ behavior: 'smooth' })
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <User className="size-3.5 text-violet" />
              My Progress
            </button>
          </div>

          <div className="my-1 border-t border-border" />

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              logout()
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
