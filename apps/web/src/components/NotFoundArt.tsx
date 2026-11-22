/**
 * Line-drawn room for the 404 page: window, sofa, lamp, frame and floor are drawn stroke by stroke (CSS), the lamp then
 * sways gently. Purely decorative (aria-hidden); the page text carries the message.
 */
export function NotFoundArt() {
  const n = (i: number) => ({ '--n': i }) as React.CSSProperties
  return (
    <svg
      className="nf-art"
      viewBox={['0', '0', '400', '240'].join(' ')}
      aria-hidden="true"
      focusable="false"
    >
      <line x1="10" y1="206" x2="390" y2="206" pathLength="1" style={n(0)} />
      <rect x="52" y="34" width="96" height="104" pathLength="1" style={n(1)} />
      <line x1="100" y1="34" x2="100" y2="138" pathLength="1" style={n(2)} />
      <line x1="52" y1="86" x2="148" y2="86" pathLength="1" style={n(3)} />
      <path d="M44 138 H156" pathLength="1" style={n(4)} />
      <path
        d="M176 206 V168 q0-14 14-14 H322 q14 0 14 14 V206 M176 182 H336 M190 154 V132 q0-12 12-12 H306 q12 0 12 12 V154"
        pathLength="1"
        style={n(5)}
      />
      <path d="M186 206 v10 M326 206 v10" pathLength="1" style={n(6)} />
      <rect x="206" y="52" width="76" height="52" pathLength="1" style={n(7)} />
      <path d="M214 94 l22-22 18 14 12-10 10 12" pathLength="1" style={n(8)} />
      <g className="nf-lamp">
        <line x1="352" y1="20" x2="352" y2="86" pathLength="1" style={n(9)} />
        <path d="M330 118 q22-34 44 0 z" pathLength="1" style={n(10)} />
        <circle cx="352" cy="124" r="3" pathLength="1" style={n(11)} />
      </g>
    </svg>
  )
}
