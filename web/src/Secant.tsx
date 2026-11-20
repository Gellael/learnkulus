import { useState } from 'react'
import Tex from './Tex'

const A = 1
const f = (x: number) => x * x
const X = (x: number) => 40 + (x + 0.5) * 88
const Y = (y: number) => 220 - y * 22

function line(m: number) {
  const y = (x: number) => f(A) + m * (x - A)
  return { x1: X(-0.5), y1: Y(y(-0.5)), x2: X(3), y2: Y(y(3)) }
}

export default function Secant() {
  const [h, setH] = useState(1.5)
  const slope = 2 * A + h
  const pts = Array.from({ length: 36 }, (_, i) => {
    const x = -0.5 + i * 0.1
    return `${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`
  }).join(' ')

  return (
    <div className="demo">
      <svg viewBox="0 0 360 240" role="img" aria-label="Garis sekan mendekati garis singgung saat h mengecil">
        <line x1={X(-0.5)} y1={Y(0)} x2={355} y2={Y(0)} className="axis" />
        <line x1={X(0)} y1={10} x2={X(0)} y2={Y(0)} className="axis" />
        <polyline points={pts} className="curve" />
        <line {...line(2 * A)} className="tan-ref" />
        <line {...line(slope)} className="sec" />
        <circle cx={X(A)} cy={Y(f(A))} r="5.5" className="dot" />
        <circle cx={X(A + h)} cy={Y(f(A + h))} r="5" className="dot-q" />
        <text x={X(A) - 18} y={Y(f(A)) + 16} className="label">P</text>
        <text x={X(A + h) + 8} y={Y(f(A + h)) - 6} className="label">Q</text>
      </svg>
      <label className="slider">
        <span>Jarak h = <strong>{h.toFixed(2)}</strong></span>
        <input type="range" min="0.02" max="2" step="0.01" value={h} onChange={(e) => setH(+e.target.value)} />
      </label>
      <p className="demo-eq">
        <Tex tex={String.raw`\dfrac{f(1+h)-f(1)}{h}=${slope.toFixed(2)}`} />
      </p>
      <p className="muted">Untuk f(x) = x² di titik P. Geser h ke kecil: garis sekan (biru) menyatu dengan garis singgung (putus-putus) dan kemiringannya mendekati f′(1) = 2.</p>
    </div>
  )
}
