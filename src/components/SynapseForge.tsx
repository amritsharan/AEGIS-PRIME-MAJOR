import { useState } from 'react'
import { MODELS } from './ModelSelector'
import {
  IconClose,
  IconHammer,
  IconShield,
  IconDatabase,
  IconCode,
  IconLock,
  IconLayers,
  IconNetwork,
  IconAtom,
  IconFlask,
} from './ui'

const TEMPLATES = [
  {
    id: 'secure-login',
    icon: <IconShield width={20} height={20} />,
    title: 'Secure Login Portal',
    desc: 'OAuth2 + JWT + PQC Auth',
    tag: 'Security',
    iconBg: 'bg-teal-100 text-teal-600',
  },
  {
    id: 'rest-api',
    icon: <IconDatabase width={20} height={20} />,
    title: 'REST API Backend',
    desc: 'FastAPI + PostgreSQL',
    tag: 'Backend',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'ai-chat',
    icon: <IconAtom width={20} height={20} />,
    title: 'AI Chat Interface',
    desc: 'Multi-model streaming UI',
    tag: 'Frontend',
    iconBg: 'bg-pink-100 text-pink-500',
  },
  {
    id: 'blockchain',
    icon: <IconNetwork width={20} height={20} />,
    title: 'Blockchain Dashboard',
    desc: 'Real-time ledger monitor',
    tag: 'Web3',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'microservice',
    icon: <IconNetwork width={20} height={20} />,
    title: 'Microservice Auth',
    desc: 'Zero-trust architecture',
    tag: 'Cloud',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'dashboard',
    icon: <IconCode width={20} height={20} />,
    title: 'Real-time Dashboard',
    desc: 'WebSocket + React',
    tag: 'Frontend',
    iconBg: 'bg-orange-100 text-orange-500',
  },
  {
    id: 'pqc-module',
    icon: <IconLock width={20} height={20} />,
    title: 'PQC Crypto Module',
    desc: 'Post-quantum encryption',
    tag: 'Crypto',
    iconBg: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'cdn-api',
    icon: <IconLayers width={20} height={20} />,
    title: 'Edge CDN API',
    desc: 'Distributed caching layer',
    tag: 'Infra',
    iconBg: 'bg-sky-100 text-sky-600',
  },
]

const TAG_COLORS: Record<string, string> = {
  Security: 'bg-teal-100 text-teal-700',
  Backend: 'bg-blue-100 text-blue-700',
  Frontend: 'bg-pink-100 text-pink-700',
  Web3: 'bg-amber-100 text-amber-700',
  Cloud: 'bg-emerald-100 text-emerald-700',
  Crypto: 'bg-purple-100 text-purple-700',
  Infra: 'bg-sky-100 text-sky-700',
}

export default function SynapseForge({
  activeModel,
  onClose,
}: {
  activeModel: string
  onClose: () => void
}) {
  const [prompt, setPrompt] = useState('')
  const model = MODELS.find((m) => m.id === activeModel) ?? MODELS[0]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Forge header */}
      <header className="glass-strong shrink-0 border-b border-white/50 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md shadow-amber-500/20"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              <IconHammer width={18} height={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] font-bold tracking-widest text-[var(--color-ink)]">
                  SYNAPSE FORGE
                </span>
                <span className="flex items-center gap-1 rounded-full bg-[var(--color-emerald)] px-2 py-0.5 text-[10px] font-semibold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  READY
                </span>
              </div>
              <div className="font-mono text-[10px] text-[var(--color-slate)]">
                AGENTIC BUILD STUDIO // v2.0
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-xl border border-[var(--color-hairline)] bg-white/80 px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink)] transition hover:shadow-sm">
              {model.name}
              <span className="text-[var(--color-slate)]">↓</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--color-hairline)] bg-white/80 px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-ruby-soft)] hover:text-[var(--color-ruby)] hover:border-[var(--color-ruby)]/30"
            >
              <IconClose width={13} height={13} />
              CLOSE FORGE
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="scroll-quiet flex-1 overflow-y-auto px-8 py-10">
        {/* Mode badge */}
        <div className="flex justify-center">
          <span className="flex items-center gap-2 rounded-full border border-[var(--color-orange)]/30 bg-[var(--color-orange-soft)] px-4 py-1.5 text-[11px] font-semibold text-[var(--color-orange)]">
            ⚡ AGENTIC BUILD MODE // ACTIVE
          </span>
        </div>

        {/* Heading */}
        <div className="mt-6 text-center">
          <h1 className="text-[38px] font-bold tracking-tight text-[var(--color-ink)]">
            What would you like to{' '}
            <span className="gradient-text-orange">build</span> today?
          </h1>
          <p className="mt-3 text-[14px] text-[var(--color-slate)]">
            Describe your project — Synapse Forge will scaffold, generate, and build it using{' '}
            <span className="font-semibold text-[var(--color-orange)]">{model.name}</span>.
          </p>
        </div>

        {/* Build input */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-hairline)] bg-white/80 p-3 shadow-lg shadow-black/5 backdrop-blur-xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-orange)]">
              <IconHammer width={18} height={18} />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build me a modern portfolio with hero, about, skills, and projects…"
              className="flex-1 bg-transparent text-[14px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-slate)]/60"
            />
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold text-white shadow-lg shadow-orange-500/30 transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
            >
              🔨 FORGE
            </button>
          </div>

          {/* Model info row */}
          <div className="mt-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-[11px] text-[var(--color-slate)]">
              <span>Model:</span>
              <span className="font-semibold text-[var(--color-orange)]">{model.name}</span>
              <span>·</span>
              <span>{model.detail.split('·')[0].trim()}</span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-emerald-soft)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-emerald)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-emerald)]" />
              {model.name} Core · Online
            </span>
          </div>
        </div>

        {/* Quick Start Templates */}
        <div className="mx-auto mt-10 max-w-3xl">
          <h3 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-slate)]">
            <IconFlask width={13} height={13} />
            Quick Start Templates
          </h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPrompt(`Build a ${t.title}: ${t.desc}`)}
                className="group flex flex-col rounded-2xl border border-[var(--color-hairline)] bg-white/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-stroke)] hover:shadow-lg hover:shadow-black/5 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.iconBg}`}>
                    {t.icon}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${TAG_COLORS[t.tag] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {t.tag}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-[12px] font-semibold leading-snug text-[var(--color-ink)]">
                    {t.title}
                  </div>
                  <div className="mt-0.5 font-mono text-[10.5px] text-[var(--color-slate)]">
                    {t.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="glass shrink-0 border-t border-white/50 px-6 py-3">
        <div className="flex items-center justify-center gap-8 text-[10.5px] text-[var(--color-slate)]">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-orange)]" />
            {model.name} Neural Core
          </span>
          <span className="flex items-center gap-1.5">📦 Direct .ZIP Bundle Export</span>
          <span className="flex items-center gap-1.5">&lt;/&gt; Multi-file scaffolding</span>
          <span className="flex items-center gap-1.5">✦ Agentic code generation</span>
        </div>
      </footer>
    </div>
  )
}
