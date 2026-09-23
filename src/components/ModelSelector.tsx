import { IconClose, IconCpu, IconShield, IconCloud, IconCheck } from './ui'

export const MODELS = [
  { id: 'synapse-free', name: 'SYNAPSE-OS FREE', detail: 'NEURAL PROCESS · OMNIROUTE', latency: 28, type: 'local', online: true },
  { id: 'llama3-local', name: 'Llama-3 Local', detail: 'Llama-3.2-1B · LOCAL OLLAMA', latency: 18, type: 'local', online: true },
  { id: 'qwen-local', name: 'Qwen-2.5 Local', detail: 'Qwen-2.5-0.5B · LOCAL OLLAMA', latency: 12, type: 'local', online: true },
  { id: 'smollm-local', name: 'SmolLM-2 Local', detail: 'SmolLM-2-360M · LOCAL OLLAMA', latency: 9, type: 'local', online: true },
  { id: 'grok-cloud', name: 'Grok-3 Cloud', detail: 'xAI Grok · CLOUD TUNNEL', latency: 45, type: 'cloud', online: true },
  { id: 'mistral-local', name: 'Mistral Local', detail: 'Mixtral-8x7B · LOCAL PROCESS', latency: 63, type: 'local' },
  { id: 'gpt4o-cloud', name: 'GPT-4o Cloud', detail: 'GPT-4o-turbo-128k · CLOUD TUNNEL', latency: 142, type: 'cloud' },
  { id: 'claude-cloud', name: 'Claude Cloud', detail: 'Claude-3.5-Sonnet · CLOUD TUNNEL', latency: 158, type: 'cloud' },
  { id: 'qwen-cloud', name: 'Qwen Cloud', detail: 'Qwen-2.5-72B · CLOUD TUNNEL', latency: 125, type: 'cloud' },
  { id: 'kimi-cloud', name: 'Kimi Cloud', detail: 'Kimi-K2 · CLOUD TUNNEL', latency: 131, type: 'cloud' },
] as const

export type ModelDef = (typeof MODELS)[number]

export default function ModelSelector({
  activeModel,
  onSelect,
  onClose,
  onOpenMixer,
}: {
  activeModel: string
  onSelect: (id: string) => void
  onClose: () => void
  onOpenMixer?: () => void
}) {
  const active = MODELS.find((m) => m.id === activeModel) ?? MODELS[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="animate-fade-in absolute inset-0 bg-[var(--color-ink)]/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-scale-in glass-strong relative w-[420px] max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-hairline)] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] font-semibold tracking-widest text-[var(--color-ink)]">
              MODEL SELECTOR
            </span>
            <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-slate)]">
              IDLE
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-slate)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          >
            <IconClose width={14} height={14} />
          </button>
        </div>

        <div className="scroll-quiet max-h-[calc(90vh-130px)] overflow-y-auto px-5 py-4 space-y-3">
          {/* Lumina-Auth status */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--color-emerald)]/30 bg-[var(--color-emerald-soft)] px-4 py-3">
            <div className="flex items-center gap-3">
              <IconShield width={16} height={16} className="text-[var(--color-emerald)]" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[var(--color-ink)]">Lumina-Auth</span>
                  <span className="rounded-full bg-[var(--color-emerald)] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                    ZK
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[var(--color-slate)]">
                  [01/0100 0011 1101 10]
                </span>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-emerald)] px-2.5 py-1 text-[11px] font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              OK
            </span>
          </div>

          {/* Active node */}
          <div className="rounded-xl border-2 border-[#06b6d4]/40 bg-[var(--color-cyan-soft)] px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold tracking-widest text-[var(--color-cyan)]">
                ACTIVE NODE
              </span>
              <span className="rounded-full bg-[var(--color-cyan)] px-2.5 py-0.5 font-mono text-[10px] text-white">
                Local Process
              </span>
            </div>
            <div className="text-[16px] font-bold text-[var(--color-ink)]">{active.name}</div>
            <div className="font-mono text-[11px] text-[var(--color-slate)]">
              {active.detail} ·{' '}
              <span className="text-[var(--color-cyan)]">{active.latency}ms</span>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-[var(--color-hairline)]" />
            <span className="font-mono text-[10px] font-semibold tracking-widest text-[var(--color-slate)]">
              MODELS
            </span>
            <span className="h-px flex-1 bg-[var(--color-hairline)]" />
          </div>

          {/* Model list */}
          <div className="space-y-2">
            {MODELS.map((m) => {
              const isSelected = m.id === activeModel
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelect(m.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm ${
                    isSelected
                      ? 'border-[#06b6d4]/50 bg-[var(--color-cyan-soft)] shadow-sm'
                      : 'border-[var(--color-hairline)] bg-white/60 hover:border-[var(--color-stroke)]'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isSelected
                        ? 'bg-[var(--color-cyan)] text-white'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-slate)]'
                    }`}
                  >
                    {m.type === 'cloud' ? (
                      <IconCloud width={14} height={14} />
                    ) : (
                      <IconCpu width={14} height={14} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[var(--color-ink)]">{m.name}</span>
                      {'online' in m && m.online && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-emerald)]" />
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[var(--color-slate)]">{m.detail}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-mono-ink)]">
                      {m.latency}ms
                    </span>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? 'border-[var(--color-cyan)] bg-[var(--color-cyan)] text-white'
                          : 'border-[var(--color-stroke)]'
                      }`}
                    >
                      {isSelected && <IconCheck width={10} height={10} />}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-hairline)] px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--color-slate)]">Want to combine 2 models?</span>
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenMixer?.()
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:opacity-90 cursor-pointer"
            >
              Launch Fusion Mixer →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
