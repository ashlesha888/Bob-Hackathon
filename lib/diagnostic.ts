'use client'

export interface DiagnosticResult {
  currentUrl: string
  protocol: string
  hostname: string
  port: string
  isHttps: boolean
  isLocalhost: boolean
  isSecureContext: boolean
  mediaDevicesAvailable: boolean
  getUserMediaAvailable: boolean
  mediaRecorderAvailable: boolean
  supportedMimeTypes: string[]
  cameraPermissionState: 'granted' | 'denied' | 'prompt' | 'unknown' | 'unsupported'
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  issues: string[]
  recommendations: string[]
}

export async function runNetworkDiagnostics(): Promise<DiagnosticResult> {
  const isBrowser = typeof window !== 'undefined'
  
  if (!isBrowser) {
    return {
      currentUrl: 'Server-Side Rendering',
      protocol: '',
      hostname: '',
      port: '',
      isHttps: false,
      isLocalhost: false,
      isSecureContext: false,
      mediaDevicesAvailable: false,
      getUserMediaAvailable: false,
      mediaRecorderAvailable: false,
      supportedMimeTypes: [],
      cameraPermissionState: 'unknown',
      status: 'WARNING',
      issues: ['Running in SSR mode.'],
      recommendations: ['Diagnostics must run in client browser context.'],
    }
  }

  const currentUrl = window.location.href
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = window.location.port

  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost')

  const isHttps = protocol === 'https:'
  const isSecureContext = window.isSecureContext ?? (isHttps || isLocalhost)

  const mediaDevicesAvailable = !!(navigator.mediaDevices)
  const getUserMediaAvailable = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  const mediaRecorderAvailable = typeof MediaRecorder !== 'undefined'

  const testTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4;codecs=avc1',
    'video/mp4',
  ]
  
  const supportedMimeTypes: string[] = []
  if (mediaRecorderAvailable) {
    for (const type of testTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        supportedMimeTypes.push(type)
      }
    }
  }

  let cameraPermissionState: DiagnosticResult['cameraPermissionState'] = 'unknown'
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const perm = await navigator.permissions.query({ name: 'camera' as PermissionName })
      cameraPermissionState = perm.state as any
    } catch {
      cameraPermissionState = 'unsupported'
    }
  }

  const issues: string[] = []
  const recommendations: string[] = []

  if (!isSecureContext) {
    issues.push(`Insecure context detected: ${protocol}//${hostname}`)
    recommendations.push(
      `Browsers disable camera access over HTTP network URLs. Access the site via HTTPS (e.g. https://${hostname}${port ? ':' + port : ''}) or on localhost.`
    )
  }

  if (!getUserMediaAvailable) {
    issues.push('navigator.mediaDevices.getUserMedia is unavailable in this environment.')
    if (!isSecureContext) {
      recommendations.push('Switching to an HTTPS connection will enable navigator.mediaDevices.')
    } else {
      recommendations.push('Ensure your browser supports web camera access and grants permission.')
    }
  }

  if (cameraPermissionState === 'denied') {
    issues.push('Camera access permission is currently denied by browser settings.')
    recommendations.push('Click the lock/camera icon in your browser address bar and set Camera to Allow.')
  }

  if (!mediaRecorderAvailable) {
    issues.push('MediaRecorder API is not supported by this browser.')
    recommendations.push('Use a modern browser (Chrome, Safari 14+, Firefox, Edge).')
  }

  let status: DiagnosticResult['status'] = 'HEALTHY'
  if (issues.length > 0) {
    status = !isSecureContext || !getUserMediaAvailable || cameraPermissionState === 'denied' ? 'CRITICAL' : 'WARNING'
  }

  return {
    currentUrl,
    protocol,
    hostname,
    port,
    isHttps,
    isLocalhost,
    isSecureContext,
    mediaDevicesAvailable,
    getUserMediaAvailable,
    mediaRecorderAvailable,
    supportedMimeTypes,
    cameraPermissionState,
    status,
    issues,
    recommendations,
  }
}
