import { useState, useRef, useEffect, useCallback } from 'react'
import NavRail from './NavRail'
import ModelSelector, { MODELS } from './ModelSelector'
import ModelMixerModal from './ModelMixerModal'
import SynapseForge from './SynapseForge'
import ConversationHistory from './ConversationHistory'
import { saveSession, type ConversationSession } from '../lib/historyStorage'
import { streamCompletion, type ApiMessage } from '../lib/api'
import {
  IconShield,
  IconSparkles,
  IconPaperclip,
  IconSend,
  IconCpu,
  IconChevronDown,
  IconMixer,
  IconAtom,
  IconBinary,
  IconFlask,
  IconArrow,
} from './ui'

/* ─── Types ───────────────────────────────────────────────── */
type Role = 'user' | 'assistant' | 'mixer'
type ChatMsg = {
  id: string
  role: Role
  content: string
  model: string
  streaming: boolean
  error: string | null
  ts: Date
  /* mixer only */
  mixerResponses?: Array<{ modelId: string; content: string; streaming: boolean; error: string | null }>
}

type View = 'workspace' | 'forge'

/* ─── Helpers ─────────────────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function modelName(id: string) {
  return MODELS.find((m) => m.id === id)?.name ?? id
}

/* ─── Code Block Formatter ────────────────────────────────── */
function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] text-slate-100 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3.5 py-1.5 font-mono text-[11px] text-slate-400">
        <span className="font-semibold uppercase text-cyan-400">{lang || 'code'}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 text-[10.5px] text-slate-400 hover:text-white transition cursor-pointer"
        >
          {copied ? '✓ Copied' : 'Copy Code'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-[12px] leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function FormattedContent({ content, streaming }: { content: string; streaming?: boolean }) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return (
    <div className="space-y-2 text-[13.5px] leading-relaxed text-slate-800">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const raw = part.slice(3, -3).trim()
          const firstLineBreak = raw.indexOf('\n')
          let lang = ''
          let code = raw
          if (firstLineBreak !== -1) {
            const possibleLang = raw.slice(0, firstLineBreak).trim()
            if (possibleLang && !possibleLang.includes(' ')) {
              lang = possibleLang
              code = raw.slice(firstLineBreak + 1)
            }
          }
          return <CodeBlock key={idx} lang={lang} code={code} />
        }
        return (
          <span key={idx} style={{ whiteSpace: 'pre-wrap' }}>
            {part}
          </span>
        )
      })}
      {streaming && (
        <span className="ml-1 inline-flex items-center gap-0.5 align-middle">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
        </span>
      )}
    </div>
  )
}

/* ─── Background ──────────────────────────────────────────── */
function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 10% -10%, rgba(99,102,241,0.07) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 90% 100%, rgba(6,182,212,0.07) 0%, transparent 55%), #f0f4ff',
        }}
      />
      <div
        className="blob absolute -left-60 -top-60 h-[700px] w-[700px] opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)' }}
      />
      <div
        className="blob-2 absolute -right-40 top-1/3 h-[500px] w-[500px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 65%)' }}
      />
      <div
        className="blob-3 absolute bottom-0 left-1/2 h-[380px] w-[380px] -translate-x-1/2 opacity-35"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 65%)' }}
      />
    </div>
  )
}

/* ─── Welcome hero ────────────────────────────────────────── */
const ACTION_CARDS = [
  {
    id: 'synth',
    icon: <IconAtom width={18} height={18} />,
    title: 'Synthesize Ethanol Molecular Structure',
    desc: 'Verify C1-C2 bonds under Carbon valency rules with Z3 prover',
    from: '#f0fdfa', to: '#ecfeff', icon_bg: 'bg-teal-100 text-teal-600', border: 'border-teal-200/60',
    prompt: 'Synthesize the ethanol molecular structure and verify C1-C2 bonds under Carbon valency rules using Z3 prover methodology.',
  },
  {
    id: 'audit',
    icon: <IconShield width={18} height={18} />,
    title: 'Audit WASI Filesystem Isolation',
    desc: 'Verify zero ambient authority & ephemeral vfs:// memory mount',
    from: '#f0fdf4', to: '#ecfdf5', icon_bg: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200/60',
    prompt: 'Audit WASI filesystem isolation: verify zero ambient authority and ephemeral vfs:// memory mount constraints.',
  },
  {
    id: 'quantum',
    icon: <IconBinary width={18} height={18} />,
    title: 'Quantum Telemetry Variance Audit',
    desc: 'Analyze phase variance and Shannon entropy distribution',
    from: '#f5f3ff', to: '#eef2ff', icon_bg: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-200/60',
    prompt: 'Analyze quantum telemetry phase variance and compute Shannon entropy distribution across measurement samples.',
  },
  {
    id: 'mixer',
    icon: <IconFlask width={18} height={18} />,
    title: 'Launch Dual Model Mixer',
    desc: 'Combine 2 models for split-vertical concurrent consensus',
    from: '#fff1f2', to: '#fdf2f8', icon_bg: 'bg-rose-100 text-rose-500', border: 'border-rose-200/60',
    prompt: 'Explain the mechanical and reasoning differences between local quantizations and cloud foundation models.',
  },
]

const SUGGESTIONS = ['Synthesize Ethanol structure', 'Verify WASI file isolation', 'Audit Quantum noise telemetry', 'Compare Ollama Llama-3 vs Qwen-2.5']

function WelcomeHero({
  activeModel,
  onPrompt,
  onOpenMixer,
}: {
  activeModel: string
  onPrompt: (text: string) => void
  onOpenMixer?: () => void
}) {
  const name = modelName(activeModel)
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 md:px-10 md:py-14">
      {/* Icon ring */}
      <div className="relative mb-8">
        <div
          className="absolute -inset-3 rounded-full opacity-40"
          style={{ background: 'conic-gradient(from 0deg, #4f46e5, #06b6d4, #4f46e5)', animation: 'spin 8s linear infinite' }}
        />
        <div
          className="relative flex h-[72px] w-[72px] items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #e0e7ff 100%)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.15)',
          }}
        >
          <IconSparkles width={30} height={30} className="text-indigo-500" strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="text-[34px] md:text-[40px] font-extrabold tracking-tight text-slate-900 text-center">
        Hello,{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 60%, #4f46e5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Operator
        </span>
      </h1>
      <p className="mt-2.5 max-w-[440px] text-center text-[14px] md:text-[15px] leading-relaxed text-slate-500">
        Ready to assist with{' '}
        <span className="font-semibold text-slate-700">{name}</span>.
        {' '}What shall we explore, synthesize, or compare?
      </p>

      {/* Cards */}
      <div className="mt-8 md:mt-10 grid w-full max-w-[680px] grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTION_CARDS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              if (c.id === 'mixer' && onOpenMixer) {
                onOpenMixer()
              } else {
                onPrompt(c.prompt)
              }
            }}
            className={`group flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/80 cursor-pointer ${c.border}`}
            style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
          >
            <div className="flex items-start justify-between">
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${c.icon_bg}`}>
                {c.icon}
              </span>
              <IconArrow
                width={14}
                height={14}
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
              />
            </div>
            <div>
              <div className="text-[13px] font-semibold leading-snug text-slate-800">{c.title}</div>
              <div className="mt-1 text-[11.5px] leading-relaxed text-slate-500">{c.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Message bubble ──────────────────────────────────────── */
function UserBubble({ msg }: { msg: ChatMsg }) {
  return (
    <div className="flex items-end justify-end gap-3 px-6 py-1.5">
      <div className="max-w-[72%]">
        <div
          className="rounded-2xl rounded-br-sm px-4 py-3 text-[14px] leading-relaxed text-white shadow-md shadow-indigo-200/60"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}
        >
          {msg.content}
        </div>
        <div className="mt-1 text-right text-[10.5px] text-slate-400">
          {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-xs"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #2563eb)' }}
      >
        OP
      </div>
    </div>
  )
}

function AiBubble({ msg }: { msg: ChatMsg }) {
  const [copied, setCopied] = useState(false)
  const name = modelName(msg.model)
  const isThinking = msg.streaming && !msg.content && !msg.error

  function copy() {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="group flex items-start gap-3 px-6 py-1.5">
      <div
        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm"
        style={{ background: 'linear-gradient(135deg, #06b6d4, #4f46e5)' }}
      >
        Æ
      </div>
      <div className="max-w-[76%]">
        <div
          className="relative rounded-2xl rounded-tl-sm border border-slate-200/70 bg-white/90 px-4 py-3.5 text-[14px] leading-relaxed text-slate-800 shadow-sm shadow-slate-100 backdrop-blur-sm"
          style={{ minWidth: 80 }}
        >
          {/* thinking state — before first token */}
          {isThinking && (
            <div className="flex items-center gap-2.5 text-slate-400">
              <span className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-indigo-400"
                    style={{ animation: `bar-flicker 1s ease-in-out ${i * 0.22}s infinite` }}
                  />
                ))}
              </span>
              <span className="text-[12px]">Synthesizing response…</span>
            </div>
          )}

          {msg.error ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-rose-500 font-medium text-[13px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                API Error
              </div>
              <p className="font-mono text-[11.5px] text-rose-400 break-all">{msg.error}</p>
            </div>
          ) : msg.content ? (
            <FormattedContent content={msg.content} streaming={msg.streaming} />
          ) : null}

          {/* copy button */}
          {!msg.streaming && msg.content && !msg.error && (
            <button
              onClick={copy}
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:text-slate-700 cursor-pointer"
              style={{ opacity: copied ? 1 : undefined }}
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              )}
            </button>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10.5px] text-slate-400">
          <span className="font-mono font-medium text-slate-600">{name}</span>
          <span>·</span>
          <span>{msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Split Vertically: Mixer Column & Bubble ─────────────── */
function MixerColumn({
  modelId,
  content,
  streaming,
  error,
  channelLabel,
  colorScheme,
}: {
  modelId: string
  content: string
  streaming: boolean
  error: string | null
  channelLabel: string
  colorScheme: 'indigo' | 'purple'
}) {
  const [copied, setCopied] = useState(false)
  const def = MODELS.find((m) => m.id === modelId)
  const name = def?.name ?? modelId
  const latency = def?.latency ?? 20
  const isLocal = def?.type === 'local'

  function copy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const isThinking = streaming && !content && !error

  return (
    <div className="flex flex-col h-full bg-white/95 transition-colors">
      {/* Pane Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/75 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-xs ${
              colorScheme === 'indigo'
                ? 'bg-gradient-to-br from-indigo-500 to-cyan-500'
                : 'bg-gradient-to-br from-purple-500 to-rose-500'
            }`}
          >
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-semibold text-[13px] text-slate-800">{name}</span>
              <span className="rounded bg-slate-200/70 px-1.5 py-0.2 font-mono text-[9.5px] font-medium text-slate-600">
                {channelLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-mono">
              <span>{isLocal ? 'OLLAMA LOCAL' : 'CLOUD TUNNEL'}</span>
              <span>·</span>
              <span className="text-emerald-600 font-semibold">{latency}ms</span>
            </div>
          </div>
        </div>

        {/* Right status & copy */}
        <div className="flex items-center gap-2">
          {streaming ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Streaming
            </span>
          ) : error ? (
            <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600 border border-rose-200">
              Error
            </span>
          ) : content ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-200">
              ✓ Ready
            </span>
          ) : null}

          {content && (
            <button
              onClick={copy}
              title="Copy model response"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-xs transition hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Pane Content */}
      <div className="flex-1 p-4 overflow-y-auto min-h-[140px]">
        {isThinking && (
          <div className="flex flex-col gap-2 py-8 items-center justify-center text-slate-400">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${
                    colorScheme === 'indigo' ? 'bg-indigo-400' : 'bg-purple-400'
                  }`}
                  style={{ animation: `bar-flicker 1s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <span className="text-[12px] font-medium">Synthesizing solution from {name}…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-[12.5px] text-rose-600">
            <div className="font-semibold mb-1">Inference Exception</div>
            <p className="font-mono text-[11px] break-all">{error}</p>
          </div>
        )}

        {content && (
          <FormattedContent content={content} streaming={streaming} />
        )}
      </div>

      {/* Pane Footer */}
      <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-2 flex items-center justify-between text-[10.5px] text-slate-400 font-mono">
        <span>{content ? `${content.split(/\s+/).filter(Boolean).length} words` : '0 words'}</span>
        <span>{isLocal ? 'Local Hardware Enclave' : 'Zero-Egress Proxy'}</span>
      </div>
    </div>
  )
}

/* Mixer split-vertically dual response */
function MixerBubble({ msg }: { msg: ChatMsg }) {
  const responses = msg.mixerResponses ?? []
  const respA = responses[0]
  const respB = responses[1]

  if (!respA || !respB) return null

  const isStreaming = respA.streaming || respB.streaming

  return (
    <div className="px-4 py-2.5 md:px-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 shadow-md shadow-slate-200/50 backdrop-blur-md overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-xs"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #a855f7)' }}
            >
              <IconMixer width={14} height={14} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-slate-800">
                  Fusion Consensus Engine
                </span>
                <span className="rounded-full bg-rose-50 px-2 py-0.2 font-mono text-[9.5px] font-semibold text-rose-500 border border-rose-200">
                  SPLIT VERTICAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Comparing answers for identical prompt side-by-side in vertical columns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            {isStreaming ? (
              <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                Concurrent Dual-Model Streaming…
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                ✓ Dual Synthesis Complete
              </span>
            )}
          </div>
        </div>

        {/* Split Vertically Layout: Left Channel & Right Channel */}
        <div className="grid grid-cols-1 divide-y lg:grid-cols-2 lg:divide-y-0 lg:divide-x divide-slate-200/80">
          <MixerColumn
            modelId={respA.modelId}
            content={respA.content}
            streaming={respA.streaming}
            error={respA.error}
            channelLabel="CHANNEL A"
            colorScheme="indigo"
          />

          <MixerColumn
            modelId={respB.modelId}
            content={respB.content}
            streaming={respB.streaming}
            error={respB.error}
            channelLabel="CHANNEL B"
            colorScheme="purple"
          />
        </div>

        {/* Comparative Ribbon */}
        <div className="border-t border-slate-200/70 bg-gradient-to-r from-indigo-50/50 via-slate-50 to-purple-50/50 px-4 py-2 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Consensus Assessment:</span>
            <span>Parallel inference executed concurrently under sovereign memory mounts.</span>
          </div>
          <div className="font-mono text-[10.5px] text-slate-400">
            {respA.modelId} ⚡ {respB.modelId}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Input bar ───────────────────────────────────────────── */
function InputBar({
  activeModel,
  mixerMode,
  mixerModelA,
  mixerModelB,
  loading,
  onSend,
  onOpenMixerModal,
  onDisableMixer,
}: {
  activeModel: string
  mixerMode: boolean
  mixerModelA: string
  mixerModelB: string
  loading: boolean
  onSend: (text: string) => void
  onOpenMixerModal: () => void
  onDisableMixer: () => void
}) {
  const [draft, setDraft] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  function send() {
    const t = draft.trim()
    if (!t || loading) return
    onSend(t)
    setDraft('')
  }

  const placeholder = mixerMode
    ? `Ask Fusion Mixer (${modelName(mixerModelA)} + ${modelName(mixerModelB)})…`
    : `Ask ${modelName(activeModel)} anything…`

  return (
    <div className="shrink-0 px-4 md:px-6 pb-5 pt-2">
      {/* Suggestions Chips */}
      <div className="mb-2.5 flex items-center gap-2 overflow-x-auto pb-0.5 scroll-quiet">
        <span className="shrink-0 text-[11px] text-slate-400">Suggestions:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setDraft(s); ref.current?.focus() }}
            className="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] text-slate-600 backdrop-blur-sm transition hover:border-slate-300 hover:shadow-xs cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Mixer mode indicator & model swap trigger */}
      {mixerMode && (
        <div
          className="mb-2.5 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-[12px] font-medium text-white shadow-md shadow-rose-500/15"
          style={{ background: 'linear-gradient(90deg, #f43f5e 0%, #a855f7 100%)' }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-[12px] font-bold">
              ⊕
            </span>
            <span>
              Split-Vertical Mixer Active: <strong>{modelName(mixerModelA)}</strong> ⇄ <strong>{modelName(mixerModelB)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenMixerModal}
              className="rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-white/30 cursor-pointer"
            >
              Change Models
            </button>
            <button
              type="button"
              onClick={onDisableMixer}
              className="rounded-lg bg-black/20 px-2 py-1 text-[11px] text-white/80 transition hover:bg-black/30 hover:text-white cursor-pointer"
              title="Exit Mixer Mode"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input container */}
      <div
        className="flex items-end gap-2 rounded-2xl border border-white/80 bg-white/85 p-2.5 shadow-lg shadow-slate-200/60 backdrop-blur-xl"
        style={{ boxShadow: '0 4px 24px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)' }}
      >
        <button
          type="button"
          title="Attach"
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
        >
          <IconPaperclip width={17} height={17} />
        </button>

        <textarea
          ref={ref}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
          }}
          placeholder={placeholder}
          className="scroll-quiet max-h-40 min-h-[24px] flex-1 resize-none bg-transparent py-1.5 text-[14px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          disabled={!draft.trim() || loading}
          onClick={send}
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-indigo-300/50 transition hover:opacity-90 disabled:opacity-35 cursor-pointer"
          style={{
            background: mixerMode
              ? 'linear-gradient(135deg, #f43f5e, #a855f7)'
              : 'linear-gradient(135deg, #4f46e5, #2563eb)',
          }}
        >
          {loading ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <IconSend width={15} height={15} />
          )}
        </button>
      </div>

      <p className="mt-2 text-center font-mono text-[10px] text-slate-400">
        Cypher-Shield · ML-KEM-768 · Groth16 BN254 · all attachments mount read-only to vfs://
      </p>
    </div>
  )
}

/* ─── Status bar ──────────────────────────────────────────── */
function StatusBar({
  model,
  mixerMode,
  mixerModelA,
  mixerModelB,
  onModelClick,
  onMixerClick,
  onMixerConfig,
}: {
  model: (typeof MODELS)[number]
  mixerMode: boolean
  mixerModelA: string
  mixerModelB: string
  onModelClick: () => void
  onMixerClick: () => void
  onMixerConfig: () => void
}) {
  return (
    <header
      className="z-30 flex shrink-0 items-center justify-between gap-4 border-b border-white/60 px-5 py-0 shadow-sm"
      style={{
        height: 52,
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      {/* Left: brand + lumina */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[12px] font-bold text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }}
          >
            Æ
          </div>
          <div>
            <div className="text-[12.5px] font-bold leading-none text-slate-800">Synapse OS</div>
            <div className="mt-0.5 font-mono text-[9px] text-slate-400 leading-none">v2.4 · SOVEREIGN MESH</div>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Lumina-Auth OK
        </span>

        {/* System pills */}
        <div className="hidden items-center gap-1.5 xl:flex">
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">🔑 tcap: 10s</span>
          <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600">🔒 ML-KEM-768</span>
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-600">⛓ Zenith #42</span>
        </div>
      </div>

      {/* Right: model + mixer + stats */}
      <div className="flex items-center gap-2">
        {/* xAI provider indicator */}
        <span className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[10px] text-emerald-600 lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          xAI · Grok-3
        </span>
        <span className="hidden font-mono text-[10.5px] text-slate-400 lg:block">
          CPU 21% · RAM 4.1G · VRAM 2.8G
        </span>

        {/* Model selector button */}
        <button
          type="button"
          onClick={onModelClick}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:shadow-md cursor-pointer"
        >
          <IconCpu width={13} height={13} className="text-cyan-500" />
          <span className="font-semibold">{model.name}</span>
          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600">
            {model.latency}ms
          </span>
          <IconChevronDown width={11} height={11} className="text-slate-400" />
        </button>

        {/* Model mixer toggle & config button */}
        {mixerMode ? (
          <div className="flex items-center rounded-xl border border-rose-200 bg-rose-500 text-white shadow-sm shadow-rose-200 overflow-hidden">
            <button
              type="button"
              onClick={onMixerConfig}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition hover:bg-rose-600 cursor-pointer"
              title="Configure Mixer Models"
            >
              <IconMixer width={13} height={13} />
              <span>Mixer: {modelName(mixerModelA)} ⇄ {modelName(mixerModelB)}</span>
            </button>
            <button
              type="button"
              onClick={onMixerClick}
              className="flex h-8 w-7 items-center justify-center border-l border-rose-400/50 hover:bg-rose-600 text-white/80 hover:text-white text-[12px] cursor-pointer"
              title="Turn off mixer"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onMixerClick}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-medium text-rose-500 transition hover:bg-rose-100 hover:shadow-md cursor-pointer"
          >
            <IconMixer width={13} height={13} />
            <span>Model Mixer</span>
          </button>
        )}
      </div>
    </header>
  )
}

/* ─── Main component ──────────────────────────────────────── */
export default function SynapseOS({
  activeModel,
  onModel,
  onAudit,
  onSignOut,
}: {
  activeModel: string
  onModel: (m: string) => void
  onAudit: () => void
  onSignOut: () => void
}) {
  const [view, setView] = useState<View>('workspace')
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [mixerModalOpen, setMixerModalOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [mixerMode, setMixerMode] = useState(false)
  const [mixerModelA, setMixerModelA] = useState('llama3-local')
  const [mixerModelB, setMixerModelB] = useState('qwen-local')
  const [sessionId, setSessionId] = useState<string>(() => uid())
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string>(() => new Date().toISOString())
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const model = MODELS.find((m) => m.id === activeModel) ?? MODELS[0]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-save active conversation to persistent history
  useEffect(() => {
    if (messages.length === 0) return
    const firstUser = messages.find((m) => m.role === 'user')
    const title = firstUser
      ? firstUser.content.slice(0, 52)
      : mixerMode
      ? `Mixer: ${modelName(mixerModelA)} ⇄ ${modelName(mixerModelB)}`
      : `Chat: ${modelName(activeModel)}`

    const serialized = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      model: m.model,
      streaming: m.streaming,
      error: m.error,
      ts: m.ts instanceof Date ? m.ts.toISOString() : new Date(m.ts).toISOString(),
      mixerResponses: m.mixerResponses?.map((r) => ({
        modelId: r.modelId,
        content: r.content,
        streaming: r.streaming,
        error: r.error,
      })),
    }))

    saveSession({
      id: sessionId,
      title,
      createdAt: sessionCreatedAt,
      updatedAt: new Date().toISOString(),
      mode: mixerMode ? 'mixer' : 'standard',
      modelA: mixerMode ? mixerModelA : activeModel,
      modelB: mixerMode ? mixerModelB : undefined,
      messages: serialized,
    })
  }, [messages, sessionId, sessionCreatedAt, mixerMode, mixerModelA, mixerModelB, activeModel])

  function startNewChat(mode: 'standard' | 'mixer' = 'standard') {
    const newId = uid()
    setSessionId(newId)
    setSessionCreatedAt(new Date().toISOString())
    setMessages([])
    setView('workspace')
    if (mode === 'mixer') {
      setMixerMode(true)
    } else {
      setMixerMode(false)
    }
  }

  function loadSession(session: ConversationSession) {
    setSessionId(session.id)
    setSessionCreatedAt(session.createdAt)
    setView('workspace')

    const loaded: ChatMsg[] = session.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      model: m.model,
      streaming: false,
      error: m.error ?? null,
      ts: new Date(m.ts),
      mixerResponses: m.mixerResponses?.map((r) => ({
        modelId: r.modelId,
        content: r.content,
        streaming: false,
        error: r.error ?? null,
      })),
    }))

    setMessages(loaded)

    if (session.mode === 'mixer') {
      setMixerMode(true)
      setMixerModelA(session.modelA)
      if (session.modelB) setMixerModelB(session.modelB)
    } else {
      setMixerMode(false)
      onModel(session.modelA)
    }
  }

  /* helpers for mutating nested streaming state */
  const patchMsg = useCallback((id: string, patch: Partial<ChatMsg>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }, [])

  const patchMixerResponse = useCallback(
    (msgId: string, modelId: string, patch: Partial<{ content: string; streaming: boolean; error: string | null }>) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== msgId) return m
          return {
            ...m,
            mixerResponses: (m.mixerResponses ?? []).map((r) =>
              r.modelId === modelId ? { ...r, ...patch } : r,
            ),
          }
        }),
      )
    },
    [],
  )

  async function handleSend(text: string) {
    if (loading) return
    setLoading(true)

    /* user message */
    const userMsg: ChatMsg = { id: uid(), role: 'user', content: text, model: activeModel, streaming: false, error: null, ts: new Date() }
    const history = messages.filter((m) => m.role === 'user' || m.role === 'assistant')
    const apiHistory: ApiMessage[] = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    if (mixerMode) {
      /* Mixer: two selected models in parallel with split vertical display */
      const mixerId = uid()
      const channelA = mixerModelA
      const channelB = mixerModelB

      const mixerMsg: ChatMsg = {
        id: mixerId,
        role: 'mixer',
        content: text,
        model: channelA,
        streaming: true,
        error: null,
        ts: new Date(),
        mixerResponses: [
          { modelId: channelA, content: '', streaming: true, error: null },
          { modelId: channelB, content: '', streaming: true, error: null },
        ],
      }
      setMessages((prev) => [...prev, userMsg, mixerMsg])

      const runModel = async (modelId: string) => {
        try {
          const gen = streamCompletion(
            [...apiHistory, { role: 'user', content: text }],
            modelId,
          )
          for await (const chunk of gen) {
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== mixerId) return m
                return {
                  ...m,
                  mixerResponses: (m.mixerResponses ?? []).map((r) =>
                    r.modelId === modelId ? { ...r, content: r.content + chunk } : r,
                  ),
                }
              }),
            )
          }
          patchMixerResponse(mixerId, modelId, { streaming: false })
        } catch (err) {
          patchMixerResponse(mixerId, modelId, {
            streaming: false,
            error: err instanceof Error ? err.message : 'Inference error',
          })
        }
      }

      await Promise.all([runModel(channelA), runModel(channelB)])
      patchMsg(mixerId, { streaming: false })
    } else {
      /* Single model */
      const aiId = uid()
      const aiMsg: ChatMsg = { id: aiId, role: 'assistant', content: '', model: activeModel, streaming: true, error: null, ts: new Date() }
      setMessages((prev) => [...prev, userMsg, aiMsg])

      try {
        const gen = streamCompletion(
          [...apiHistory, { role: 'user', content: text }],
          activeModel,
        )
        for await (const chunk of gen) {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiId ? { ...m, content: m.content + chunk } : m)),
          )
        }
        patchMsg(aiId, { streaming: false })
      } catch (err) {
        patchMsg(aiId, {
          streaming: false,
          error: err instanceof Error ? err.message : 'Request failed',
        })
      }
    }

    setLoading(false)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Background />

      <StatusBar
        model={model}
        mixerMode={mixerMode}
        mixerModelA={mixerModelA}
        mixerModelB={mixerModelB}
        onModelClick={() => setModelSelectorOpen(true)}
        onMixerClick={() => {
          if (!mixerMode) {
            setMixerModalOpen(true)
          } else {
            setMixerMode(false)
          }
        }}
        onMixerConfig={() => setMixerModalOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        {/* Nav rail */}
        <div className="flex shrink-0 items-start pl-3 pt-4">
          <NavRail
            view={view}
            activeModel={activeModel}
            activeModelName={model.name}
            onNewChat={() => startNewChat(mixerMode ? 'mixer' : 'standard')}
            onHistory={() => setHistoryOpen((o) => !o)}
            onModel={() => setModelSelectorOpen(true)}
            onForge={() => setView('forge')}
            onAudit={onAudit}
            onSignOut={onSignOut}
          />
        </div>

        {/* Content */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {view === 'forge' ? (
            <SynapseForge activeModel={activeModel} onClose={() => setView('workspace')} />
          ) : (
            <>
              {/* Chat / welcome */}
              <div className="scroll-quiet group flex-1 overflow-y-auto py-4">
                {messages.length === 0 ? (
                  <WelcomeHero
                    activeModel={activeModel}
                    onPrompt={(t) => handleSend(t)}
                    onOpenMixer={() => setMixerModalOpen(true)}
                  />
                ) : (
                  <div className="space-y-1">
                    {messages.map((msg) =>
                      msg.role === 'user' ? (
                        <UserBubble key={msg.id} msg={msg} />
                      ) : msg.role === 'mixer' ? (
                        <MixerBubble key={msg.id} msg={msg} />
                      ) : (
                        <AiBubble key={msg.id} msg={msg} />
                      ),
                    )}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <InputBar
                activeModel={activeModel}
                mixerMode={mixerMode}
                mixerModelA={mixerModelA}
                mixerModelB={mixerModelB}
                loading={loading}
                onSend={handleSend}
                onOpenMixerModal={() => setMixerModalOpen(true)}
                onDisableMixer={() => setMixerMode(false)}
              />
            </>
          )}
        </main>
      </div>

      {/* Overlays */}
      {modelSelectorOpen && (
        <ModelSelector
          activeModel={activeModel}
          onSelect={(id) => { onModel(id); setModelSelectorOpen(false) }}
          onClose={() => setModelSelectorOpen(false)}
          onOpenMixer={() => {
            setModelSelectorOpen(false)
            setMixerModalOpen(true)
          }}
        />
      )}

      {mixerModalOpen && (
        <ModelMixerModal
          isOpen={mixerModalOpen}
          onClose={() => setMixerModalOpen(false)}
          modelA={mixerModelA}
          modelB={mixerModelB}
          onSelectModelA={(id) => setMixerModelA(id)}
          onSelectModelB={(id) => setMixerModelB(id)}
          onStartMixer={() => {
            setMixerMode(true)
          }}
          onDisableMixer={() => {
            setMixerMode(false)
          }}
          isMixerActive={mixerMode}
        />
      )}

      {historyOpen && (
        <ConversationHistory
          onClose={() => setHistoryOpen(false)}
          onSelectSession={loadSession}
          onNewChat={startNewChat}
          currentSessionId={sessionId}
        />
      )}
    </div>
  )
}
