import Link from 'next/link'
import { Logo } from '@/components/logo'

const columns = [
  {
    heading: 'Product',
    links: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Features', href: '#features' },
      { label: 'Exercises', href: '#exercises' },
      { label: 'Progress', href: '#progress' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Safety', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
            Your camera. Your movement. Your AI coach. Move better, train smarter with real-time
            movement intelligence.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading} className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
              {col.heading}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>Movement guidance, powered by computer vision.</p>
          <p>© {new Date().getFullYear()} ALIGN.AI</p>
        </div>
      </div>
    </footer>
  )
}
