import { useState } from 'react'
import {
  IconHistory,
  IconPlus,
  IconCpu,
  IconShield,
  IconFlask,
  IconHammer,
  IconGrid,
  IconNetwork,
} from './ui'

export type ModelId = string

type Props = {
  view: 'workspace' | 'forge' | 'neo4j-graph' | 'admin-panel' | 'matrix'
  activeModel: string
  activeModelName: string
  onNewChat: () => void
  onHistory: () => void
  onModel: () => void
  onForge: () => void
  onAudit: () => void
  onMeshFlow?: () => void
  onNeo4jGraph?: () => void
  onAdminPanel?: () => void
  onMatrix?: () => void
  onSignOut: () => void
}

function IcoLogout() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function NavRail({
  view,
  activeModelName,
  onNewChat,
  onHistory,
  onModel,
  onForge,
  onAudit,
  onMeshFlow,
  onNeo4jGraph,
  onAdminPanel,
  onMatrix,
  onSignOut,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  type NavItem = {
    id: string
    icon: React.ReactNode
    label: string
    badge?: string
    badgeTone?: string
    sub: string
    onClick?: () => void
  }

  const items: NavItem[] = [
    {
      id: 'history',
      icon: <IconHistory width={18} height={18} />,
      label: 'History',
      sub: 'Recent conversations',
      onClick: onHistory,
    },
    {
      id: 'kernel',
      icon: <IconCpu width={18} height={18} />,
      label: 'Main Model',
      badge: activeModelName.split(' ')[0],
      badgeTone: 'cyan',
      sub: activeModelName,
      onClick: onModel,
    },
    {
      id: 'neo4j-graph',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      ),
      label: 'Neo4j Motion Graph',
      badge: 'Mesh',
      badgeTone: 'cyan',
      sub: 'Neural Invariant Proof Graph',
      onClick: onNeo4jGraph,
    },
    {
      id: 'admin-panel',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      label: 'Admin Transparency',
      badge: 'Z3',
      badgeTone: 'purple',
      sub: 'LogicShield, WASI SFI, Decoy Grid',
      onClick: onAdminPanel,
    },
    {
      id: 'matrix',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      ),
      label: 'Comparison Matrix',
      badge: 'Bench',
      badgeTone: 'amber',
      sub: '7 Architectural Comparison Vectors',
      onClick: onMatrix,
    },
    {
      id: 'security',
      icon: <IconShield width={18} height={18} />,
      label: 'Security & PQC',
      badge: 'Flow',
      badgeTone: 'emerald',
      sub: 'Cypher & Zenith Mesh Flow',
      onClick: onMeshFlow,
    },
    {
      id: 'forge',
      icon: <IconHammer width={18} height={18} />,
      label: 'Synapse Forge',
      badge: 'Build',
      badgeTone: 'amber',
      sub: 'Agentic Build Studio v2.0',
      onClick: onForge,
    },
    {
      id: 'audit',
      icon: <IconGrid width={18} height={18} />,
      label: 'Audit Ledger',
      badge: 'Chain',
      badgeTone: 'purple',
      sub: 'Zenith-Mesh blockchain',
      onClick: onAudit,
    },
    {
      id: 'network',
      icon: <IconNetwork width={18} height={18} />,
      label: 'Mesh Network',
      sub: 'Node topology & flow',
      onClick: onMeshFlow,
    },
  ]

  const badgeColors: Record<string, string> = {
    cyan: '#0891b2',
    emerald: '#059669',
    amber: '#d97706',
    purple: '#7c3aed',
    orange: '#ea580c',
  }

  return (
    <aside className="relative z-20 flex flex-col items-center gap-1.5 py-4">
      <div className="glass flex flex-col items-center gap-1.5 rounded-2xl px-2.5 py-3 shadow-xl shadow-black/5">
        {/* New chat button */}
        <div
          className="relative"
          onMouseEnter={() => setHovered('new')}
          onMouseLeave={() => setHovered(null)}
        >
          <button
            type="button"
            onClick={onNewChat}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg shadow-blue-500/40 transition hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            <IconPlus width={20} height={20} />
          </button>
          {hovered === 'new' && (
            <Tooltip label="New Conversation" sub="Start a new chat session" />
          )}
        </div>

        {items.map((item) => {
          const isActive =
            (item.id === 'forge' && view === 'forge') ||
            (item.id === 'neo4j-graph' && view === 'neo4j-graph') ||
            (item.id === 'admin-panel' && view === 'admin-panel') ||
            (item.id === 'matrix' && view === 'matrix') ||
            (item.id === 'history' && view === 'workspace')

          const isScience = item.id === 'science'

          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <button
                type="button"
                onClick={item.onClick}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 ${
                  isActive
                    ? 'bg-[var(--color-indigo-soft)] text-[var(--color-indigo)] shadow-sm'
                    : isScience
                      ? 'text-rose-500 hover:bg-rose-50'
                      : 'text-[var(--color-slate)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]'
                }`}
              >
                {item.icon}
              </button>

              {hovered === item.id && (
                <Tooltip
                  label={item.label}
                  badge={item.badge}
                  badgeColor={item.badgeTone ? badgeColors[item.badgeTone] : undefined}
                  sub={item.sub}
                />
              )}
            </div>
          )
        })}

        {/* Divider before signout */}
        <div className="my-1 h-px w-8 bg-[var(--color-hairline)]" />

        {/* Sign out */}
        <div
          className="relative"
          onMouseEnter={() => setHovered('signout')}
          onMouseLeave={() => setHovered(null)}
        >
          <button
            type="button"
            onClick={onSignOut}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-slate)] transition-all hover:scale-105 hover:bg-red-50 hover:text-red-500 active:scale-95"
          >
            <IcoLogout />
          </button>
          {hovered === 'signout' && (
            <Tooltip label="Sign Out" sub="End session & lock workstation" badgeColor="#ef4444" />
          )}
        </div>
      </div>
    </aside>
  )
}

function Tooltip({
  label,
  badge,
  badgeColor,
  sub,
}: {
  label: string
  badge?: string
  badgeColor?: string
  sub: string
}) {
  return (
    <div className="animate-slide-up pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap">
      <div
        className="rounded-xl px-3.5 py-2.5 shadow-xl"
        style={{ background: '#1a1f2e', minWidth: '180px' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-white">{label}</span>
          {badge && badgeColor && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ background: badgeColor }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-white/55">{sub}</p>
        {/* Arrow */}
        <div
          className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 h-3 w-3 rotate-45 rounded-sm"
          style={{ background: '#1a1f2e' }}
        />
      </div>
    </div>
  )
}
