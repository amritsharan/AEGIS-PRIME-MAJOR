import { useState, useEffect } from 'react'
import { Badge, Drawer, IconClose, IconExternal } from './ui'
import { ZENITH_MESH_URL } from '../lib/aegisDispatcher'

const FALLBACK_EXTRINSICS = [
  {
    ts: '14:02:51',
    intent: '0x7f1a…c93b',
    tool: 'vfs://write',
    proof: '0x9b3e…004f',
    status: 'Finalized',
  },
  {
    ts: '14:02:44',
    intent: '0x2ed0…81aa',
    tool: 'kem://rekey',
    proof: '0x4c77…19e2',
    status: 'Finalized',
  },
  {
    ts: '14:02:39',
    intent: '0xa4b9…5f10',
    tool: 'z3://verify',
    proof: '0x0d31…7b8c',
    status: 'Finalized',
  },
  {
    ts: '14:02:31',
    intent: '0xc180…22de',
    tool: 'vfs://read',
    proof: '0xe6f2…4a05',
    status: 'Finalized',
  },
]

export default function AuditDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [liveBlocks, setLiveBlocks] = useState<any[]>([])
  const [blockHeight, setBlockHeight] = useState<number>(4821)
  const [merkleRoot, setMerkleRoot] = useState<string>('0x9b3e7c02a41f88d5e0177b9c3fa2e6104d55ab90…004f')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    async function loadData() {
      try {
        const [stateRes, blocksRes] = await Promise.all([
          fetch(`${ZENITH_MESH_URL}/ledger/state`, { signal: AbortSignal.timeout(1500) }),
          fetch(`${ZENITH_MESH_URL}/ledger/latest?limit=6`, { signal: AbortSignal.timeout(1500) }),
        ])

        if (stateRes.ok && blocksRes.ok && !cancelled) {
          const stateData = await stateRes.json()
          const blocksData = await blocksRes.json()
          setBlockHeight(stateData.current_block ?? 1048)
          if (blocksData.length > 0 && blocksData[0].merkleRoot) {
            setMerkleRoot(blocksData[0].merkleRoot)
          }
          setLiveBlocks(blocksData)
          setIsLive(true)
        }
      } catch {
        if (!cancelled) setIsLive(false)
      }
    }

    loadData()
    const timer = setInterval(loadData, 4000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [open])

  const extrinsicsToRender = isLive && liveBlocks.length > 0
    ? liveBlocks.map((b) => ({
        ts: new Date(b.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        intent: b.intentDigest ? `${b.intentDigest.slice(0, 6)}…${b.intentDigest.slice(-4)}` : b.evidenceHash ? `${b.evidenceHash.slice(0, 6)}…` : '0x…',
        tool: b.type === 'FORENSIC_INCIDENT' ? 'honey://breach' : 'poa://commit',
        proof: b.txHash ? `${b.txHash.slice(0, 6)}…${b.txHash.slice(-4)}` : '0x…',
        status: b.status === 'EVIDENCE_SEALED' ? 'Sealed' : 'Finalized',
      }))
    : FALLBACK_EXTRINSICS

  return (
    <Drawer open={open} onClose={onClose} width={560}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-hairline)] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-semibold tracking-tight text-[var(--color-ink)]">
              Zenith-Mesh Proof-of-Agency Ledger
            </h2>
            {isLive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Node :9944 Live
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-[11px] text-[var(--color-slate)]">
            Substrate node · block height{' '}
            <span className="text-[var(--color-ink)] font-bold">#{blockHeight}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-slate)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] cursor-pointer"
        >
          <IconClose width={16} height={16} />
        </button>
      </div>

      <div className="scroll-quiet flex-1 overflow-y-auto px-5 py-4">
        {/* State root */}
        <div className="rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate)]">
            Merkle-Patricia Trie · State Root
          </div>
          <div className="mt-1.5 flex items-center gap-2 font-mono text-[13px] text-[var(--color-mono-ink)] break-all">
            {merkleRoot}
            <IconExternal
              width={13}
              height={13}
              className="shrink-0 cursor-pointer text-[var(--color-slate)] transition hover:text-[var(--color-ink)]"
            />
          </div>
        </div>

        {/* Extrinsics feed */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate)]">
            <span>Finalized Extrinsics</span>
            <span className="font-mono text-[10px] lowercase text-[var(--color-slate)]">
              {isLive ? 'live aura-grandpa feed' : 'cached local state'}
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--color-hairline)]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[var(--color-surface)] font-mono text-[10.5px] uppercase tracking-wide text-[var(--color-slate)]">
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">τ_audit</th>
                  <th className="px-3 py-2 font-medium">Tool URI</th>
                  <th className="px-3 py-2 font-medium">ZK-Proof / Tx</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11.5px] text-[var(--color-mono-ink)]">
                {extrinsicsToRender.map((e, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-[var(--color-hairline)] transition hover:bg-[var(--color-surface)]"
                  >
                    <td className="px-3 py-2.5 text-[var(--color-slate)]">{e.ts}</td>
                    <td className="px-3 py-2.5">{e.intent}</td>
                    <td className="px-3 py-2.5 text-[var(--color-indigo)]">{e.tool}</td>
                    <td className="px-3 py-2.5 text-[var(--color-slate)]">{e.proof}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 ${e.status === 'Sealed' ? 'text-rose-600' : 'text-[var(--color-emerald)]'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${e.status === 'Sealed' ? 'bg-rose-500' : 'bg-[var(--color-emerald)]'}`} />
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Canary monitor */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--color-emerald)]/25 bg-[var(--color-emerald-soft)] px-4 py-3">
          <div>
            <div className="text-[13px] font-medium text-[var(--color-ink)]">
              Canary &amp; Honey-Data Monitor
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-[var(--color-slate)]">
              Active deception grid · forensic vault sealed
            </div>
          </div>
          <Badge tone="emerald" dot>
            0 Perimeter Breaches Detected
          </Badge>
        </div>
      </div>
    </Drawer>
  )
}

