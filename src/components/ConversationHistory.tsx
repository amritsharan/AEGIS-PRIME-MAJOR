import { useState, useEffect } from 'react'
import { IconClose } from './ui'
import {
  getStoredSessions,
  deleteSession,
  type ConversationSession,
} from '../lib/historyStorage'
import { MODELS } from './ModelSelector'

type Tab = 'standard' | 'mixer'

function IcoClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IcoChevron() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IcoSearch() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IcoPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IcoChat() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IcoFlask() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 9l-5.5 9.5A2 2 0 0 0 6 21h12a2 2 0 0 0 1.5-2.5L14 9" />
    </svg>
  )
}

function IcoTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function modelName(id: string) {
  return MODELS.find((m) => m.id === id)?.name ?? id
}

function formatRelativeTime(iso: string) {
  try {
    const diffMs = Date.now() - new Date(iso).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'Just now'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(iso).toLocaleDateString()
  } catch {
    return 'Recently'
  }
}

export default function ConversationHistory({
  onClose,
  onSelectSession,
  onNewChat,
  currentSessionId,
  userInitials = 'OP',
}: {
  onClose: () => void
  onSelectSession: (session: ConversationSession) => void
  onNewChat: (mode: 'standard' | 'mixer') => void
  currentSessionId?: string
  userInitials?: string
}) {
  const [tab, setTab] = useState<Tab>('standard')
  const [query, setQuery] = useState('')
  const [sessions, setSessions] = useState<ConversationSession[]>([])

  useEffect(() => {
    setSessions(getStoredSessions())
  }, [])

  const standardSessions = sessions.filter((i) => i.mode === 'standard')
  const mixerSessions = sessions.filter((i) => i.mode === 'mixer')

  const currentTabList = tab === 'standard' ? standardSessions : mixerSessions
  const filtered = currentTabList.filter((i) =>
    i.title.toLowerCase().includes(query.toLowerCase()) ||
    modelName(i.modelA).toLowerCase().includes(query.toLowerCase()) ||
    (i.modelB && modelName(i.modelB).toLowerCase().includes(query.toLowerCase()))
  )

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const remaining = deleteSession(id)
    setSessions(remaining)
  }

  function handleSelect(session: ConversationSession) {
    onSelectSession(session)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]" />

      {/* Floating panel anchored near the nav rail */}
      <div
        className="animate-scale-in relative z-50 overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-2xl shadow-indigo-900/15 backdrop-blur-xl"
        style={{
          marginLeft: '84px',
          marginTop: '60px',
          width: '380px',
          maxHeight: 'calc(100vh - 84px)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 shrink-0 bg-white/60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <IcoClock />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold text-slate-900">Conversation Archives</div>
            <div className="text-[11px] text-slate-400">Isolated Standard &amp; Model Mixer History</div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <IconClose width={14} height={14} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setTab('standard')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-semibold transition cursor-pointer ${
              tab === 'standard'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <IcoChat /> Standard ({standardSessions.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('mixer')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-semibold transition cursor-pointer ${
              tab === 'mixer'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-300'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <IcoFlask /> Model Mixer ({mixerSessions.length})
          </button>
        </div>

        {/* ── CTA: Start new chat for current tab ── */}
        <div className="px-5 py-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onNewChat(tab)
              onClose()
            }}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl text-[12.5px] font-semibold text-white shadow-md shadow-indigo-300/40 transition hover:opacity-90 cursor-pointer"
            style={{
              background:
                tab === 'standard'
                  ? 'linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)'
                  : 'linear-gradient(90deg, #f43f5e 0%, #a855f7 100%)',
            }}
          >
            <IcoPlus />
            Start New {tab === 'standard' ? 'Standard' : 'Model Mixer'} Chat
          </button>
        </div>

        {/* ── Search ── */}
        <div className="px-5 py-2 shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-1.5">
            <IcoSearch />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${tab} archives…`}
              className="flex-1 bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Section label ── */}
        <div className="flex items-center justify-between px-5 py-1.5 shrink-0">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {tab === 'standard' ? 'Single Architecture Logs' : 'Split-Vertical Dual Consensus Logs'}
          </span>
          <span className="font-mono text-[10.5px] text-slate-400">{filtered.length} saved</span>
        </div>

        {/* ── List ── */}
        <div className="scroll-quiet flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[12px] text-slate-400">
              No {tab} conversations recorded yet
            </div>
          ) : (
            filtered.map((item) => {
              const isCurrent = item.id === currentSessionId
              const isMixer = item.mode === 'mixer'
              const nameA = modelName(item.modelA)
              const nameB = item.modelB ? modelName(item.modelB) : ''

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`group relative flex w-full cursor-pointer items-start justify-between rounded-xl p-3 text-left transition ${
                    isCurrent
                      ? 'border border-indigo-200 bg-indigo-50/70 shadow-xs'
                      : 'border border-transparent hover:border-slate-200/70 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold text-slate-800">
                        {item.title}
                      </span>
                      {isCurrent && (
                        <span className="rounded bg-indigo-100 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-indigo-700 shrink-0">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-mono">{formatRelativeTime(item.updatedAt)}</span>
                      <span>·</span>

                      {isMixer ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-rose-600 border border-rose-200/60">
                          {nameA} ⇄ {nameB}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-600 border border-indigo-200/60">
                          {nameA}
                        </span>
                      )}

                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.messages.length} msg{item.messages.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      type="button"
                      title="Delete conversation"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <IcoTrash />
                    </button>
                    <span className="text-slate-300 group-hover:text-slate-600 transition">
                      <IcoChevron />
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-xs"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #4f46e5)' }}
            >
              {userInitials.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[12px] font-semibold text-slate-800 leading-none">Sovereign Operator</div>
              <div className="mt-0.5 font-mono text-[10px] text-slate-400 leading-none">Local SQLite / Encrypted vfs</div>
            </div>
          </div>

          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-600 border border-emerald-200/60">
            ● Encrypted
          </span>
        </div>
      </div>
    </div>
  )
}
