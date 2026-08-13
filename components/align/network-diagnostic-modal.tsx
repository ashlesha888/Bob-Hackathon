'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react'
import { DiagnosticResult, runNetworkDiagnostics } from '@/lib/diagnostic'

interface NetworkDiagnosticModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NetworkDiagnosticModal({ isOpen, onClose }: NetworkDiagnosticModalProps) {
  const [diag, setDiag] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await runNetworkDiagnostics()
      setDiag(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      refresh()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCopyHttpsUrl = () => {
    if (!diag) return
    const httpsUrl = `https://${diag.hostname}${diag.port ? ':' + diag.port : ''}${window.location.pathname}${window.location.search}`
    navigator.clipboard.writeText(httpsUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-primary/30 bg-card p-6 shadow-2xl backdrop-blur-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                ALIGN.AI Network & System Diagnostics
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time security context & camera capability check
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Diagnostic Results */}
        {loading || !diag ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <RefreshCw className="size-8 animate-spin text-primary" />
            <p className="mt-3 text-xs text-muted-foreground">Running diagnostics...</p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Status Banner */}
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                diag.status === 'HEALTHY'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : diag.status === 'WARNING'
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : 'border-destructive/40 bg-destructive/10 text-destructive'
              }`}
            >
              <div className="flex items-center gap-3">
                {diag.status === 'HEALTHY' ? (
                  <CheckCircle2 className="size-6 shrink-0" />
                ) : (
                  <ShieldAlert className="size-6 shrink-0" />
                )}
                <div>
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                    {diag.status === 'HEALTHY'
                      ? 'System Fully HTTPS & Camera Ready'
                      : diag.status === 'WARNING'
                      ? 'Minor Configuration Notice'
                      : 'Camera Blocked by Insecure HTTP Origin'}
                  </h4>
                  <p className="text-xs opacity-90 leading-snug">
                    {diag.status === 'HEALTHY'
                      ? 'All secure context and camera APIs are fully functional.'
                      : 'Action required to enable video camera features over the network.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={refresh}
                title="Re-run Diagnostics"
                className="grid size-8 shrink-0 place-items-center rounded-xl bg-background/50 hover:bg-background transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
              </button>
            </div>

            {/* Recommendations if any */}
            {diag.recommendations.length > 0 && (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <h5 className="font-display text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <Info className="size-4" />
                  Recommended Action
                </h5>
                <ul className="flex flex-col gap-1.5 text-xs text-foreground/90">
                  {diag.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>

                {!diag.isHttps && !diag.isLocalhost && (
                  <button
                    type="button"
                    onClick={handleCopyHttpsUrl}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <Copy className="size-3.5" />
                    {copied ? 'HTTPS URL Copied!' : 'Copy HTTPS Network Link'}
                  </button>
                )}
              </div>
            )}

            {/* Key Metric Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Protocol
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {diag.protocol} ({diag.isHttps ? 'HTTPS' : 'HTTP'})
                </span>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Secure Context
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    diag.isSecureContext ? 'text-emerald-400' : 'text-destructive'
                  }`}
                >
                  {diag.isSecureContext ? 'TRUE (SECURE)' : 'FALSE (INSECURE)'}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  getUserMedia
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    diag.getUserMediaAvailable ? 'text-emerald-400' : 'text-destructive'
                  }`}
                >
                  {diag.getUserMediaAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  MediaRecorder
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    diag.mediaRecorderAvailable ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {diag.mediaRecorderAvailable ? 'SUPPORTED' : 'NOT SUPPORTED'}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Camera Permission
                </span>
                <span className="font-mono text-xs font-bold uppercase text-foreground">
                  {diag.cameraPermissionState}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Host Context
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {diag.isLocalhost ? 'Localhost' : 'Network/LAN'}
                </span>
              </div>
            </div>

            {/* Current Environment Specs */}
            <div className="rounded-2xl border border-border bg-secondary/20 p-3.5 text-[11px] font-mono flex flex-col gap-1 text-muted-foreground">
              <div>
                <strong className="text-foreground">URL:</strong> {diag.currentUrl}
              </div>
              <div>
                <strong className="text-foreground">Supported Formats:</strong>{' '}
                {diag.supportedMimeTypes.join(', ') || 'Native Default'}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 border-t border-border pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-secondary px-5 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  )
}
