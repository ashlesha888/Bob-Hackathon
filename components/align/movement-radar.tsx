import { cn } from '@/lib/utils'

type Axis = { label: string; value: number } // value 0..1

const size = 240
const cx = size / 2
const cy = size / 2
const maxR = 92

function point(index: number, total: number, radius: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  }
}

export function MovementRadar({
  axes,
  className,
}: {
  axes: Axis[]
  className?: string
}) {
  const total = axes.length
  const rings = [0.25, 0.5, 0.75, 1]

  const dataPoints = axes.map((a, i) => point(i, total, a.value * maxR))
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn('h-full w-full', className)}
      role="img"
      aria-label="Radar chart of movement quality metrics"
    >
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={axes
            .map((_, i) => {
              const p = point(i, total, r * maxR)
              return `${p.x},${p.y}`
            })
            .join(' ')}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}

      {/* spokes */}
      {axes.map((_, i) => {
        const p = point(i, total, maxR)
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth="1" />
        )
      })}

      {/* data area */}
      <polygon
        points={dataPath}
        fill="url(#radarFill)"
        stroke="var(--primary)"
        strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 6px var(--primary))' }}
      />

      {/* data vertices */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--violet)" />
      ))}
    </svg>
  )
}
