import { cn } from '@/lib/utils'

type Session = { label: string; value: number }

const W = 520
const H = 220
const padX = 34
const padY = 28

export function ProgressChart({
  sessions,
  className,
}: {
  sessions: Session[]
  className?: string
}) {
  const min = 60
  const max = 100
  const innerW = W - padX * 2
  const innerH = H - padY * 2

  const pts = sessions.map((s, i) => {
    const x = padX + (innerW * i) / (sessions.length - 1)
    const y = padY + innerH * (1 - (s.value - min) / (max - min))
    return { x, y, ...s }
  })

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${H - padY} L${pts[0].x},${H - padY} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn('h-full w-full', className)}
      role="img"
      aria-label="Line chart showing movement score improving across five sessions"
    >
      <defs>
        <linearGradient id="progArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="progLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--violet)" />
        </linearGradient>
      </defs>

      {/* gridlines */}
      {[0, 0.5, 1].map((g) => {
        const y = padY + innerH * g
        return (
          <line
            key={g}
            x1={padX}
            y1={y}
            x2={W - padX}
            y2={y}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        )
      })}

      <path d={areaPath} fill="url(#progArea)" />
      <path
        d={linePath}
        fill="none"
        stroke="url(#progLine)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 4px 10px oklch(0.62 0.2 285 / 0.4))' }}
      />

      {pts.map((p, i) => {
        const last = i === pts.length - 1
        return (
          <g key={p.label}>
            <circle
              cx={p.x}
              cy={p.y}
              r={last ? 6 : 4}
              fill={last ? 'var(--violet)' : 'var(--background)'}
              stroke="var(--primary)"
              strokeWidth="2.5"
            />
            <text
              x={p.x}
              y={p.y - 14}
              textAnchor="middle"
              className="fill-foreground font-display"
              style={{ fontSize: 15, fontWeight: 700 }}
            >
              {p.value}
            </text>
            <text
              x={p.x}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 10 }}
            >
              {p.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
