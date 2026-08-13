'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Globe, Menu, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { CtaButton } from '@/components/align/cta-button'
import { useAuth } from '@/lib/auth-context'
import { UserMenu } from '@/components/auth/user-menu'
import { NetworkDiagnosticModal } from '@/components/align/network-diagnostic-modal'

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Exercises', href: '#exercises' },
  { label: 'Progress', href: '#progress' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [diagModalOpen, setDiagModalOpen] = useState(false)
  const { isAuthenticated, openAuthModal, logout, user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleStartTraining = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (!isAuthenticated) {
      openAuthModal('signin')
    } else {
      const section = document.getElementById('exercises') || document.getElementById('top')
      if (section) section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-colors duration-300',
          scrolled
            ? 'border-b border-border bg-background/80 backdrop-blur-xl'
            : 'border-b border-transparent',
        )}
      >
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="#top" aria-label="ALIGN.AI home">
            <Logo />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => setDiagModalOpen(true)}
              title="Network & HTTPS Diagnostics"
              className="grid size-9 place-items-center rounded-full border border-border bg-secondary/40 text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary cursor-pointer"
            >
              <Globe className="size-4 text-primary" />
            </button>

            {isAuthenticated ? (
              <>
                <UserMenu />
                <CtaButton onClick={handleStartTraining} size="md">
                  Exercise Studio
                </CtaButton>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer px-2 py-1"
                >
                  Sign In
                </button>
                <CtaButton onClick={handleStartTraining} size="md">
                  Start Training
                </CtaButton>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setDiagModalOpen(true)}
              title="Network Diagnostics"
              className="grid size-10 place-items-center rounded-lg border border-border bg-secondary/40 text-foreground"
            >
              <Globe className="size-4 text-primary" />
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-lg border border-border bg-secondary/40 text-foreground"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {open ? (
          <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setDiagModalOpen(true)
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-secondary/60"
              >
                <ShieldCheck className="size-4" />
                Network Diagnostics
              </button>
              <div className="mt-2 flex flex-col gap-3 border-t border-border pt-4">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-secondary/30">
                      <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary to-violet text-xs font-bold text-primary-foreground">
                        {user?.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                        <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <CtaButton
                      onClick={(e) => {
                        setOpen(false)
                        handleStartTraining(e)
                      }}
                      size="md"
                      className="w-full"
                    >
                      Exercise Studio
                    </CtaButton>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        logout()
                      }}
                      className="w-full rounded-xl border border-destructive/30 py-2 text-center text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        openAuthModal('signin')
                      }}
                      className="px-3 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Sign In
                    </button>
                    <CtaButton
                      onClick={(e) => {
                        setOpen(false)
                        handleStartTraining(e)
                      }}
                      size="md"
                      className="w-full"
                    >
                      Start Training
                    </CtaButton>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* Network Diagnostic Modal */}
      <NetworkDiagnosticModal isOpen={diagModalOpen} onClose={() => setDiagModalOpen(false)} />
    </>
  )
}
