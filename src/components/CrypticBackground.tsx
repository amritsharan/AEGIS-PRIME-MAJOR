/* Shared animated background used by LoginPage and LuminaAuth */

const HEX_NODES = [
  { x: 12, y: 18, r: 3, color: '#06b6d4', delay: 0 },
  { x: 28, y: 42, r: 4, color: '#818cf8', delay: 0.8 },
  { x: 55, y: 22, r: 3, color: '#34d399', delay: 1.4 },
  { x: 72, y: 55, r: 5, color: '#06b6d4', delay: 0.3 },
  { x: 38, y: 70, r: 3, color: '#c084fc', delay: 2.1 },
  { x: 82, y: 28, r: 4, color: '#f472b6', delay: 1.7 },
  { x: 18, y: 78, r: 3, color: '#34d399', delay: 0.6 },
  { x: 62, y: 82, r: 5, color: '#818cf8', delay: 1.1 },
  { x: 45, y: 45, r: 7, color: '#06b6d4', delay: 0.4 },
]

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 7], [1, 4], [4, 6], [2, 5], [3, 5], [4, 8], [8, 3], [8, 7],
]

export default function CrypticBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #060d1f 0%, #0b1535 30%, #0f2040 55%, #091428 80%, #060d1f 100%)',
        }}
      />

      {/* Hex grid */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexgrid" x="0" y="0" width="56" height="97" patternUnits="userSpaceOnUse">
            <polygon
              points="28,1 55,16 55,80 28,96 1,80 1,16"
              fill="none"
              stroke="rgba(6,182,212,0.09)"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexgrid)" />
      </svg>

      {/* Connection lines */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        {EDGES.map(([a, b], i) => {
          const na = HEX_NODES[a]
          const nb = HEX_NODES[b]
          return (
            <line
              key={i}
              x1={`${na.x}%`} y1={`${na.y}%`}
              x2={`${nb.x}%`} y2={`${nb.y}%`}
              stroke="rgba(6,182,212,0.13)"
              strokeWidth="0.8"
              strokeDasharray="4 6"
              style={{
                animation: `dash-flow ${3 + i * 0.4}s linear infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          )
        })}
      </svg>

      {/* Glowing nodes */}
      {HEX_NODES.map((n, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${n.x}%`, top: `${n.y}%`,
            width: n.r * 2, height: n.r * 2,
            transform: 'translate(-50%, -50%)',
            background: n.color,
            boxShadow: `0 0 ${n.r * 5}px ${n.r * 2}px ${n.color}55`,
            animation: `node-pulse ${2.2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${n.delay}s`,
          }}
        />
      ))}

      {/* Aurora blobs */}
      <div className="absolute blob pointer-events-none" style={{ width: 420, height: 420, left: '10%', top: '15%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute blob-2 pointer-events-none" style={{ width: 300, height: 300, right: '5%', bottom: '20%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      <div className="absolute blob-3 pointer-events-none" style={{ width: 200, height: 200, left: '40%', top: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }} />

      {/* Branding */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold" style={{ background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', color: '#0f172a' }}>
            Æ
          </div>
          <span className="text-[13px] font-semibold text-white/70">Aegis-Prime</span>
        </div>
        <p className="font-mono text-[10px] text-white/20">ISCWP v0x02 · Groth16 BN254 · ML-KEM-768</p>
      </div>
    </div>
  )
}
