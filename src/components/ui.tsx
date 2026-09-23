import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (p: IconProps) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
})

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const IconSend = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
)
export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
export const IconForge = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    <path d="M12 4v2M12 18v2M4 12H2M22 12h-2M6.34 6.34 4.93 4.93M19.07 19.07l-1.41-1.41M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
)
export const IconLedger = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 4h11l3 3v13H5zM9 9h6M9 13h6M9 17h4" />
  </svg>
)
export const IconPower = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v8M7.5 7a7 7 0 1 0 9 0" />
  </svg>
)
export const IconPaperclip = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
)
export const IconKey = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="3.2" />
    <path d="M10.3 10.3L20 20M17 17l2-2M14 14l2-2" />
  </svg>
)
export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l7 3v5c0 4.4-3 8.3-7 10-4-1.7-7-5.6-7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)
export const IconExternal = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 5h5v5M19 5l-8 8M11 5H6v13h13v-5" />
  </svg>
)
export const IconChevron = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)
export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)
export const IconFolder = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
)
export const IconFile = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
    <path d="M13 3v6h6" />
  </svg>
)
export const IconDownload = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" />
  </svg>
)
export const IconSliders = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h10M18 8h2M4 16h4M12 16h8" />
    <circle cx="16" cy="8" r="2" />
    <circle cx="10" cy="16" r="2" />
  </svg>
)
export const IconHistory = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5M12 7v5l4 2" />
  </svg>
)
export const IconCpu = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
  </svg>
)
export const IconHammer = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
    <path d="M17.64 15L22 10.64" />
    <path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
  </svg>
)
export const IconFlask = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 3h6M8.5 3v7.5L4 20h16l-4.5-9.5V3" />
    <path d="M6 14h12" />
  </svg>
)
export const IconGrid = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)
export const IconNetwork = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
    <path d="M12 7v4M12 11l-5 6M12 11l5 6" />
  </svg>
)
export const IconSparkles = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l1.2 5.4L18 9l-4.8 1.6L12 21l-1.2-10.4L6 9l4.8-1.6L12 3z" />
    <path d="M5 3l.6 2.4L8 6l-2.4.6L5 9l-.6-2.4L2 6l2.4-.6L5 3z" />
    <path d="M19 13l.6 2.4L22 16l-2.4.6L19 19l-.6-2.4L16 16l2.4-.6L19 13z" />
  </svg>
)
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
)
export const IconArrow = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)
export const IconMixer = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8" cy="6" r="2" />
    <path d="M8 8v12" />
    <circle cx="16" cy="14" r="2" />
    <path d="M16 4v8M16 16v4" />
  </svg>
)
export const IconCloud = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
)
export const IconAtom = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2C6.5 2 2 6.7 2 12.5S6.5 23 12 23s10-4.7 10-10.5S17.5 2 12 2z" />
    <path d="M2 12.5c3-3.8 7-6 10-6s7 2.2 10 6" />
  </svg>
)
export const IconBinary = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="4" height="7" rx="1" />
    <rect x="3" y="14" width="4" height="7" rx="1" />
    <path d="M10 4h4M10 8h4M10 12h1M15 3v3M15 8v1M10 15h4M10 19h4" />
    <rect x="14" y="14" width="4" height="7" rx="1" />
    <path d="M10 12h1" />
  </svg>
)
export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)
export const IconLayers = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
)
export const IconDatabase = (p: IconProps) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)
export const IconCode = (p: IconProps) => (
  <svg {...base(p)}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

/* ─── Badge ──────────────────────────────────────────────── */

type Tone = 'emerald' | 'indigo' | 'coral' | 'ruby' | 'neutral' | 'cyan' | 'amber' | 'purple' | 'orange'

const toneStyles: Record<Tone, string> = {
  emerald: 'bg-[var(--color-emerald-soft)] text-[var(--color-emerald)]',
  indigo: 'bg-[var(--color-indigo-soft)] text-[var(--color-indigo)]',
  coral: 'bg-[var(--color-coral-soft)] text-[var(--color-coral)]',
  ruby: 'bg-[var(--color-ruby-soft)] text-[var(--color-ruby)]',
  neutral: 'bg-[var(--color-surface-2)] text-[var(--color-slate)]',
  cyan: 'bg-[var(--color-cyan-soft)] text-[var(--color-cyan)]',
  amber: 'bg-[var(--color-amber-soft)] text-[var(--color-amber)]',
  purple: 'bg-[var(--color-purple-soft)] text-[var(--color-purple)]',
  orange: 'bg-[var(--color-orange-soft)] text-[var(--color-orange)]',
}

export function Badge({
  tone = 'neutral',
  children,
  dot,
  className = '',
}: {
  tone?: Tone
  children: ReactNode
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none tracking-tight ${toneStyles[tone]} ${className}`}
    >
      {dot && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'currentColor' }} />
      )}
      {children}
    </span>
  )
}

/* ─── Icon button ────────────────────────────────────────── */

export function IconButton({
  children,
  label,
  tone = 'neutral',
  onClick,
  active,
}: {
  children: ReactNode
  label: string
  tone?: 'neutral' | 'ruby'
  onClick?: () => void
  active?: boolean
}) {
  const ruby = tone === 'ruby'
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
        ruby
          ? 'border-[var(--color-ruby)]/40 text-[var(--color-ruby)] hover:bg-[var(--color-ruby-soft)]'
          : active
            ? 'border-[var(--color-indigo)]/30 bg-[var(--color-indigo-soft)] text-[var(--color-indigo)]'
            : 'border-[var(--color-hairline)] text-[var(--color-slate)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]'
      }`}
    >
      {children}
    </button>
  )
}

/* ─── Drawer ─────────────────────────────────────────────── */

export function Drawer({
  open,
  onClose,
  width = 460,
  children,
}: {
  open: boolean
  onClose: () => void
  width?: number
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-[var(--color-ink)]/15 backdrop-blur-sm"
      />
      <aside
        style={{ width: `min(${width}px, 100%)` }}
        className="animate-slide-in relative flex h-full flex-col border-l border-white/50 bg-white/90 shadow-[0_10px_40px_-12px_rgba(17,24,39,0.25)] backdrop-blur-2xl"
      >
        {children}
      </aside>
    </div>
  )
}
