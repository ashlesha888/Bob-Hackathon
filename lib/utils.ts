import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the current application base URL dynamically.
 * Priority:
 * 1. window.location.origin (if running in browser)
 * 2. process.env.NEXT_PUBLIC_APP_URL
 * 3. Default fallback: http://localhost:3000
 */
export function getAppUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  return 'http://localhost:3000'
}

/**
 * Returns complete API endpoint URL.
 * Automatically uses relative routes (/api/...) on client to avoid hardcoding localhost or CORS issues,
 * or NEXT_PUBLIC_API_URL if configured.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const customApiBase = process.env.NEXT_PUBLIC_API_URL

  if (customApiBase) {
    return `${customApiBase.replace(/\/$/, '')}${cleanPath}`
  }

  // Use relative route for same-origin client requests
  if (typeof window !== 'undefined') {
    return cleanPath
  }

  return `${getAppUrl()}${cleanPath}`
}

/**
 * Helper to test whether the current environment is a secure context for Web APIs like getUserMedia.
 */
export function checkIsSecureContext(): {
  isSecure: boolean
  isLocalhost: boolean
  protocol: string
  hostname: string
  reason?: string
} {
  if (typeof window === 'undefined') {
    return { isSecure: true, isLocalhost: true, protocol: 'https:', hostname: 'localhost' }
  }

  const hostname = window.location.hostname
  const protocol = window.location.protocol

  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost')

  const isHttps = protocol === 'https:'
  
  // window.isSecureContext is standard in HTML5 browsers
  const isSecure = window.isSecureContext ?? (isHttps || isLocalhost)

  if (!isSecure) {
    return {
      isSecure: false,
      isLocalhost,
      protocol,
      hostname,
      reason: `Camera access requires a secure HTTPS connection when accessed over the network (${window.location.host}). Browsers block media devices on HTTP network origins.`,
    }
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      isSecure: false,
      isLocalhost,
      protocol,
      hostname,
      reason: 'Your browser or webview does not support the navigator.mediaDevices camera API.',
    }
  }

  return { isSecure: true, isLocalhost, protocol, hostname }
}
