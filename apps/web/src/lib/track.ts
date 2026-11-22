/** Raises an analytics event. The tracker (public/a.js) listens for it; with no tracker, DNT or an opt-out, nothing happens. */
export function track(name: string, value?: number): void {
  if (typeof document === 'undefined') return
  document.dispatchEvent(new CustomEvent('ir:track', { detail: { n: name, v: value } }))
}
