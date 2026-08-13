import { cn } from '@/lib/utils'

/**
 * Stylized computer-vision pose skeleton used across the mock training UI.
 * Purely decorative / illustrative — not a real pose-estimation output.
 */

type Point = { id: string; x: number; y: number; tone?: 'ok' | 'warn' }

// normalized coordinates on a 200 x 320 viewbox
const JOINTS: Point[] = [
  { id: 'head', x: 100, y: 40 },
  { id: 'neck', x: 100, y: 72 },
  { id: 'shoulderL', x: 72, y: 82 },
  { id: 'shoulderR', x: 128, y: 82 },
  { id: 'elbowL', x: 58, y: 128 },
  { id: 'elbowR', x: 142, y: 128 },
  { id: 'wristL', x: 52, y: 172 },
  { id: 'wristR', x: 148, y: 172 },
  { id: 'hip', x: 100, y: 168 },
  { id: 'hipL', x: 82, y: 170 },
  { id: 'hipR', x: 118, y: 170 },
  { id: 'kneeL', x: 78, y: 232 },
  { id: 'kneeR', x: 126, y: 232, tone: 'warn' },
  { id: 'ankleL', x: 80, y: 292 },
  { id: 'ankleR', x: 116, y: 292 },
]

const BONES: [string, string, ('ok' | 'warn')?][] = [
  ['head', 'neck'],
  ['neck', 'shoulderL'],
  ['neck', 'shoulderR'],
  ['shoulderL', 'elbowL'],
  ['elbowL', 'wristL'],
  ['shoulderR', 'elbowR'],
  ['elbowR', 'wristR'],
  ['neck', 'hip'],
  ['hip', 'hipL'],
  ['hip', 'hipR'],
  ['hipL', 'kneeL'],
  ['kneeL', 'ankleL'],
  ['hipR', 'kneeR', 'warn'],
  ['kneeR', 'ankleR', 'warn'],
]

function pt(id: string) {
  return JOINTS.find((j) => j.id === id)!
}

export function PoseSkeleton({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 320"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label="Illustration of a detected body pose skeleton"
    >
      {/* soft body silhouette */}
      <ellipse cx="100" cy="180" rx="66" ry="132" fill="var(--primary)" opacity="0.06" />

      {BONES.map(([a, b, tone], i) => {
        const p1 = pt(a)
        const p2 = pt(b)
        const stroke = tone === 'warn' ? 'var(--warning)' : 'var(--primary)'
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={tone === 'warn' ? 0.95 : 0.8}
            style={{ filter: `drop-shadow(0 0 5px ${stroke})` }}
          />
        )
      })}

      {JOINTS.map((j, i) => {
        const color = j.tone === 'warn' ? 'var(--warning)' : 'var(--violet)'
        return (
          <g key={j.id}>
            <circle cx={j.x} cy={j.y} r="5.5" fill={color} opacity="0.22" />
            <circle
              cx={j.x}
              cy={j.y}
              r="2.8"
              fill={color}
              style={{
                filter: `drop-shadow(0 0 4px ${color})`,
                transformOrigin: `${j.x}px ${j.y}px`,
                animation: `align-pulse-dot 2.4s ease-in-out ${i * 0.12}s infinite`,
              }}
            />
          </g>
        )
      })}
    </svg>
  )
}
