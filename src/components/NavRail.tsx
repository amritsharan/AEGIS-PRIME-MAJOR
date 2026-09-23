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
  view: 'workspace' | 'forge'
  activeModel: string
  activeModelName: string
  onNewChat: () => void
  onHistory: () => void
  onModel: () => void
  onForge: () => void
  onAudit: () => void
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
      id: 'security',
      icon: <IconShield width={18} height={18} />,
      label: 'Security',
      badge: 'ZK',
      badgeTone: 'emerald',
      sub: 'Lumina-Auth · ZK proofs',
    },
    {
      id: 'science',
      icon: <IconFlask width={18} height={18} />,
      label: 'Science Mode',
      sub: 'Molecular synthesis tools',
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
      sub: 'Node topology view',
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

        <div className="my-1 h-px w-8 bg-[var(--color-hairline)]" />

        {items.map((item) => {
          const isActive =
            (item.id === 'forge' && view === 'forge') ||
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
