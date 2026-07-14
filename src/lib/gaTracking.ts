const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-396330824'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

let initialized = false

export function initGA(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
}

export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, params)
}

export function trackPageView(page: string): void {
  trackEvent('page_view', {
    page_title: page,
    page_path: `/${page}`,
  })
}
