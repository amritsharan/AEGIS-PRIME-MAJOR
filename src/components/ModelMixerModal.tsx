import { useState } from 'react'
import { MODELS, type ModelDef } from './ModelSelector'
import { IconClose, IconMixer, IconCpu, IconCloud, IconCheck, IconSparkles } from './ui'

interface ModelMixerModalProps {
  isOpen: boolean
  onClose: () => void
  modelA: string
  modelB: string
  onSelectModelA: (id: string) => void
  onSelectModelB: (id: string) => void
  onStartMixer: () => void
  onDisableMixer: () => void
  isMixerActive: boolean
}

export default function ModelMixerModal({
  isOpen,
  onClose,
  modelA,
  modelB,
  onSelectModelA,
  onSelectModelB,
  onStartMixer,
  onDisableMixer,
  isMixerActive,
}: ModelMixerModalProps) {
  const [selectedA, setSelectedA] = useState(modelA)
  const [selectedB, setSelectedB] = useState(modelB)
  const [swapping, setSwapping] = useState(false)

  if (!isOpen) return null

  const defA = MODELS.find((m) => m.id === selectedA) ?? MODELS[1]
  const defB = MODELS.find((m) => m.id === selectedB) ?? MODELS[2]

  function handleSwap() {
    setSwapping(true)
    const prevA = selectedA
    setSelectedA(selectedB)
    setSelectedB(prevA)
    setTimeout(() => setSwapping(false), 300)
  }

  function handleApply() {
    onSelectModelA(selectedA)
    onSelectModelB(selectedB)
    onStartMixer()
    onClose()
  }

  const PRESETS = [
    {
      label: 'Local Ollama Dual',
      desc: 'Llama-3 (1B) + Qwen-2.5 (0.5B) · Zero cloud egress',
      a: 'llama3-local',
      b: 'qwen-local',
    },
    {
      label: 'Local vs Grok Cloud',
      desc: 'Llama-3 Local + xAI Grok-3 · Local vs Frontier Cloud',
      a: 'llama3-local',
      b: 'grok-cloud',
    },
    {
      label: 'Ultra-Fast Mesh',
      desc: 'Synapse Free + SmolLM-2 Local · Sub-15ms throughput',
      a: 'synapse-free',
      b: 'smollm-local',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="animate-fade-in fixed inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="animate-scale-in relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl md:p-8"
        style={{
          boxShadow:
            '0 25px 50px -12px rgba(244, 63, 94, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md shadow-rose-300"
              style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)' }}
            >
              <IconMixer width={22} height={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-bold text-slate-900">
                  Model Mixer Configuration
                </span>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-rose-600 border border-rose-200">
                  SPLIT VERTICAL
                </span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                Choose any 2 models to run simultaneously for side-by-side consensus inference.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <IconClose width={16} height={16} />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Recommended Pairings</span>
            <span className="text-slate-400 font-mono">1-Click Setup</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PRESETS.map((p) => {
              const isActive = selectedA === p.a && selectedB === p.b
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setSelectedA(p.a)
                    setSelectedB(p.b)
                  }}
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                    isActive
                      ? 'border-rose-300 bg-rose-50/70 shadow-sm'
                      : 'border-slate-200/80 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-[12px] text-slate-800">
                    <IconSparkles width={12} height={12} className={isActive ? 'text-rose-500' : 'text-slate-400'} />
                    {p.label}
                  </div>
                  <div className="mt-1 text-[10.5px] text-slate-500 leading-snug">{p.desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dual Channel Model Selector */}
        <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4">
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr,auto,1fr]">
            {/* Model A (Left Channel) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold tracking-wider text-slate-700">
                  CHANNEL A · LEFT PANE
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-600">
                  {defA.latency}ms
                </span>
              </div>

              <select
                value={selectedA}
                onChange={(e) => setSelectedA(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-[13px] font-semibold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.id === selectedB}>
                    {m.name} ({m.detail}) {m.id === selectedB ? '— (In Channel B)' : ''}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 rounded-lg bg-white/80 p-2 text-[11px] text-slate-600 border border-slate-200/60">
                {defA.type === 'local' ? (
                  <IconCpu width={14} height={14} className="text-cyan-500 shrink-0" />
                ) : (
                  <IconCloud width={14} height={14} className="text-purple-500 shrink-0" />
                )}
                <span className="truncate font-medium">{defA.name}</span>
                <span className="ml-auto font-mono text-[10px] text-emerald-600 font-semibold">● ONLINE</span>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pt-2 sm:pt-4">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap Channel A and Channel B"
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-rose-300 hover:text-rose-500 hover:scale-105 active:scale-95 ${
                  swapping ? 'rotate-180 duration-300' : 'duration-150'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {/* Model B (Right Channel) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold tracking-wider text-slate-700">
                  CHANNEL B · RIGHT PANE
                </span>
                <span className="rounded bg-purple-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-purple-600">
                  {defB.latency}ms
                </span>
              </div>

              <select
                value={selectedB}
                onChange={(e) => setSelectedB(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-[13px] font-semibold text-slate-800 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.id === selectedA}>
                    {m.name} ({m.detail}) {m.id === selectedA ? '— (In Channel A)' : ''}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 rounded-lg bg-white/80 p-2 text-[11px] text-slate-600 border border-slate-200/60">
                {defB.type === 'local' ? (
                  <IconCpu width={14} height={14} className="text-cyan-500 shrink-0" />
                ) : (
                  <IconCloud width={14} height={14} className="text-purple-500 shrink-0" />
                )}
                <span className="truncate font-medium">{defB.name}</span>
                <span className="ml-auto font-mono text-[10px] text-emerald-600 font-semibold">● ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Split Vertical Layout Preview */}
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
            <span>Split Vertical Output Preview</span>
            <span className="font-mono text-[10px] text-slate-400">Equal Columns · Live Streaming</span>
          </div>
          <div className="grid grid-cols-2 gap-2 h-14 text-center">
            <div className="flex flex-col items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50/60 px-2 py-1">
              <span className="text-[11.5px] font-bold text-indigo-700 truncate w-full">{defA.name}</span>
              <span className="text-[9.5px] text-indigo-400 font-mono">Stream Column 1</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-purple-200 bg-purple-50/60 px-2 py-1">
              <span className="text-[11.5px] font-bold text-purple-700 truncate w-full">{defB.name}</span>
              <span className="text-[9.5px] text-purple-400 font-mono">Stream Column 2</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-2">
          {isMixerActive ? (
            <button
              type="button"
              onClick={() => {
                onDisableMixer()
                onClose()
              }}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[13px] font-medium text-rose-600 transition hover:bg-rose-100"
            >
              Turn Off Mixer
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:opacity-90 active:scale-98"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)',
            }}
          >
            <IconMixer width={16} height={16} />
            <span>Start Model Mixer</span>
          </button>
        </div>
      </div>
    </div>
  )
}
