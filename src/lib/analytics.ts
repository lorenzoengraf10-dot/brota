const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string

export function initGA(): void {
  if (!GA_ID) return
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.gtag = function (...args: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).dataLayer = (window as any).dataLayer || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { anonymize_ip: true })
}

export function trackEvent(action: string, category: string, label?: string, value?: number): void {
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('event', action, { event_category: category, event_label: label, value })
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}
