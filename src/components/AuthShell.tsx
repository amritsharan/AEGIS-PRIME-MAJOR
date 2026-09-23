import type { ReactNode } from 'react'
import { IconShield } from './ui'

const SHIELDS = [
  { k: 'Lumina-Auth', v: 'Zero-knowledge behavioral identity' },
  { k: 'Synapse-OS', v: 'Wasm SFI sandboxed inference' },
  { k: 'Cypher-Shield', v: 'ML-KEM-768 post-quantum transport' },
  { k: 'Zenith-Mesh', v: 'Substrate Proof-of-Agency ledger' },
]

export default function AuthShell({
  step,
  children,
}: {
  step: 1 | 2
  children: ReactNode
}) {
  return (
    <div className="relative grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_520px]">
      {/* Liquid blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="blob absolute -left-32 -top-32 h-[500px] w-[500px]"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)',
          }}
        />
        <div
          className="blob-2 absolute -right-20 bottom-0 h-[400px] w-[400px]"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)',
          }}
        />
        <div
          className="blob-3 absolute bottom-1/4 left-1/2 h-[300px] w-[300px]"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* Brand rail */}
      <div
        className="relative hidden flex-col justify-between p-12 lg:flex"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0c1a2e 100%)',
        }}
      >
        {/* Glass sheen overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

        <div className="relative flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[15px] font-semibold text-[#0f172a] shadow-lg"
            style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' }}
          >
            Æ
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-white">Aegis-Prime</span>
        </div>

        <div className="relative max-w-[440px]">
          <h2 className="text-[28px] font-semibold leading-tight tracking-tight text-white">
            Sovereign Intelligence Mesh
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/50">
            Four cryptographic shields replacing implicit policy trust with formal mathematical
            guarantees — running on commodity Intel Core i7 nodes, no datacenter GPU.
          </p>

          <div className="mt-8 space-y-px overflow-hidden rounded-xl border border-white/10">
            {SHIELDS.map((s) => (
              <div
                key={s.k}
                className="flex items-center gap-3 bg-white/[0.04] px-4 py-3 backdrop-blur-sm"
              >
                <IconShield width={16} height={16} className="shrink-0 text-[#34d399]" />
                <div>
                  <div className="font-mono text-[12px] text-white">{s.k}</div>
                  <div className="text-[11px] text-white/40">{s.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative font-mono text-[11px] text-white/30">
          ISCWP v0x02 · Poly1305 authenticated transport
        </div>
      </div>

      {/* Form column */}
      <div
        className="flex flex-col justify-center px-6 py-10 sm:px-12"
        style={{ background: 'rgba(244, 246, 251, 0.9)' }}
      >
        <div className="mx-auto w-full max-w-[380px]">
          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-2 text-[11px] font-medium">
            <span
              className={
                step === 1 ? 'text-[var(--color-ink)]' : 'text-[var(--color-emerald)]'
              }
            >
              1 · Credentials
            </span>
            <span className="h-px w-8 bg-[var(--color-stroke)]" />
            <span
              className={
                step === 2 ? 'text-[var(--color-ink)]' : 'text-[var(--color-slate)]'
              }
            >
              2 · Liveness Proof
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
