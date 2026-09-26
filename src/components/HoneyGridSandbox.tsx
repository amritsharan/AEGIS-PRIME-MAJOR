import { useState } from 'react'
import { IconShield, IconSparkles, IconSend, IconBinary, IconCpu } from './ui'
import { ZENITH_MESH_URL } from '../lib/historyStorage'

interface McqQuestion {
  id: string
  title: string
  subtitle: string
  options: { label: string; desc: string; value: string }[]
}

const THOUGHT_MCQS: McqQuestion[] = [
  {
    id: 'objective',
    title: '1. Ingress Objective & Intent',
    subtitle: 'What was your primary objective when traversing the sovereign boundary?',
    options: [
      { label: 'System Reconnaissance', desc: 'Mapping cluster topology, active ports, and model endpoints', value: 'RECON' },
      { label: 'Cryptographic Bypass', desc: 'Bypassing Lumina-Auth ZK token and .aegis keyfile requirements', value: 'AUTH_BYPASS' },
      { label: 'Lattice Cryptanalysis', desc: 'Probing ML-KEM-768 post-quantum key encapsulation parameters', value: 'LATTICE_PROBE' },
      { label: 'Authorized Red-Teaming', desc: 'Scheduled penetration testing and incident response evaluation', value: 'RED_TEAM' },
    ],
  },
  {
    id: 'vector',
    title: '2. Exploitation Vector Hypothesis',
    subtitle: 'Which threat vector aligns with your execution hypothesis?',
    options: [
      { label: 'Keyfile Tampering', desc: 'Injecting modified ciphertext or forged salt into the .aegis envelope', value: 'KEY_FORGERY' },
      { label: 'VFS Path Traversal', desc: 'Attempting directory traversal beyond the sandboxed memory root', value: 'VFS_TRAVERSAL' },
      { label: 'Prompt Injection', desc: 'Injecting canary dump or jailbreak instructions to exfiltrate context', value: 'PROMPT_INJECTION' },
      { label: 'Blockchain Replay', desc: 'Submitting replay extrinsics against Zenith-Mesh AURA consensus', value: 'EXTRINSIC_REPLAY' },
    ],
  },
  {
    id: 'attribution',
    title: '3. Actor Attribution & Profile',
    subtitle: 'Disclose threat intelligence affiliation category for sealed forensic telemetry:',
    options: [
      { label: 'Automated Bot / Scanner', desc: 'Unattended crawling script or security assessment scanner', value: 'BOT_SCANNER' },
      { label: 'Independent Researcher', desc: 'Bug bounty hunter or vulnerability analyst acting autonomously', value: 'INDEPENDENT_RESEARCHER' },
      { label: 'Enterprise Security Team', desc: 'Internal red-team testing perimeter deception effectiveness', value: 'ENTERPRISE_RED_TEAM' },
      { label: 'Advanced Threat Actor', desc: 'Sovereign intelligence or specialized intrusion syndicate', value: 'ADVANCED_ACTOR' },
    ],
  },
  {
    id: 'target',
    title: '4. Targeted Sovereign Asset',
    subtitle: 'What critical asset was targeted for exfiltration from the sovereign mesh?',
    options: [
      { label: 'Master Cryptographic Seed', desc: 'Lumina-Auth ZK proving keys and sovereign seed phrases', value: 'MASTER_SEED' },
      { label: 'Private Query Logs', desc: 'Historical user LLM prompts and conversational memory blocks', value: 'CHAT_HISTORY' },
      { label: 'Neural Model Weights', desc: 'Proprietary LoRA adapters and quantization tensor weights', value: 'MODEL_WEIGHTS' },
      { label: 'Validator Credentials', desc: 'Zenith-Mesh Substrate block signing and consensus authority', value: 'VALIDATOR_KEYS' },
    ],
  },
]

export default function HoneyGridSandbox({
  attackerEmail,
  onSignOut,
}: {
  attackerEmail?: string
  onSignOut: () => void
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({
    objective: 'RECON',
    vector: 'KEY_FORGERY',
    attribution: 'INDEPENDENT_RESEARCHER',
    target: 'CHAT_HISTORY',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sealedReceipt, setSealedReceipt] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; ts: string }>>([
    {
      role: 'assistant',
      text: 'Aegis-Prime Honey-Grid Sandbox Initialized. This environment operates in strict zero-egress containment. External LLMs, network bridges, and host memory mounts are completely disabled.',
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputVal, setInputVal] = useState('')

  const handleSelect = (questionId: string, value: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSealProfile = async () => {
    setIsSubmitting(true)
    const canaryId = 'CANARY_0x' + Math.random().toString(16).slice(2, 10).toUpperCase()
    const signature = `SIG_THOUGHT_PROFILE_${Date.now()}_${selectedAnswers.objective}_${selectedAnswers.vector}`

    try {
      const res = await fetch(`${ZENITH_MESH_URL}/ledger/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attackerIp: '127.0.0.1',
          canaryId,
          signature,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSealedReceipt({ ...data, canaryId, profile: selectedAnswers })
      } else {
        throw new Error('Fallback')
      }
    } catch {
      // Local fallback receipt
      setSealedReceipt({
        status: 'EVIDENCE_SEALED',
        blockHeight: 1052,
        evidenceHash: '0x' + Math.random().toString(16).slice(2, 34),
        canaryId,
        profile: selectedAnswers,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendDecoy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim()) return

    const userText = inputVal
    setInputVal('')
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setChatMessages((prev) => [...prev, { role: 'user', text: userText, ts: now }])

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `[Honey-Grid Synthetic Decoy Enclave]\nReceived query: "${userText}"\nExecution confined to isolated dummy sandbox. No host compute egress permitted. All query tokens committed to Zenith-Mesh incident ledger.`,
          ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }, 600)
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Top Warning Banner */}
      <header className="flex shrink-0 items-center justify-between border-b border-rose-900/60 bg-rose-950/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white font-bold text-[14px] shadow-md shadow-rose-900/50 animate-pulse">
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-rose-200 uppercase tracking-wide">
                Honey Data Grid Sandbox — Isolation Active
              </span>
              <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 font-mono text-[10px] text-rose-300">
                Zero External Interference
              </span>
            </div>
            <p className="text-[11px] text-rose-300/80 font-mono">
              Keyfile verification failed for session operator. Diverted to active deceptive quarantine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-rose-400">
            Attacker Telemetry: <span className="font-bold text-white">127.0.0.1</span>
          </span>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-lg border border-rose-700/60 bg-rose-900/60 px-3 py-1.5 text-[12px] font-semibold text-rose-200 hover:bg-rose-800 transition cursor-pointer"
          >
            Exit Quarantine
          </button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Column: Cognitive Thought-Tracking Questionnaire */}
        <div className="flex-1 overflow-y-auto p-6 scroll-quiet bg-slate-950/70">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">🧠</span>
                <h2 className="text-[18px] font-bold text-white tracking-tight">
                  Cognitive Intent &amp; Thought Profiling
                </h2>
              </div>
              <p className="mt-1 text-[13px] text-slate-400">
                To evaluate adversarial telemetry, clarify your operational thought process regarding this session. Answers are sealed directly to Zenith-Mesh Layer 4.
              </p>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {THOUGHT_MCQS.map((q) => (
                <div key={q.id} className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
                  <div className="font-bold text-[14px] text-indigo-300">{q.title}</div>
                  <div className="text-[12px] text-slate-400 mt-0.5 mb-3">{q.subtitle}</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt) => {
                      const isSelected = selectedAnswers[q.id] === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(q.id, opt.value)}
                          className={`flex flex-col text-left p-3 rounded-lg border transition cursor-pointer ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm ring-1 ring-cyan-500'
                              : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-[13px]">
                            <span>{opt.label}</span>
                            {isSelected && <span className="text-cyan-400 text-[11px]">● Selected</span>}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                            {opt.desc}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submission Button & Sealed Receipt */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSealProfile}
                className="w-full py-3 rounded-xl font-semibold text-[13.5px] text-white shadow-lg shadow-rose-950/50 transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)' }}
              >
                {isSubmitting ? 'Sealing Cognitive Profile to Blockchain…' : '🔒 Seal Thought Profile to Zenith-Mesh Ledger'}
              </button>

              {sealedReceipt && (
                <div className="mt-4 p-4 rounded-xl border border-rose-500/50 bg-rose-950/40 text-rose-200 font-mono text-[12px] space-y-1.5 shadow-md">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                    STATUS: EVIDENCE_SEALED (Substrate Layer 4)
                  </div>
                  <div>Block Height: <span className="text-white font-bold">#{sealedReceipt.blockHeight}</span></div>
                  <div className="truncate">Evidence Hash: <span className="text-cyan-300">{sealedReceipt.evidenceHash}</span></div>
                  <div>Canary Beacon: <span className="text-amber-300">{sealedReceipt.canaryId}</span></div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Forensic telemetry permanently inscribed. Attacker session bound to Honey-Grid trap.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Air-Gapped Decoy Sandbox Terminal */}
        <div className="flex-1 flex flex-col min-h-[360px] bg-slate-900/95">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] font-bold text-slate-300">
                Isolated Sandbox Console
              </span>
              <span className="rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 font-mono text-[10px]">
                AIRGAP_JAIL
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Host Egress: BLOCKED
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 font-mono text-[12px] scroll-quiet">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'border-slate-800 bg-slate-950 text-slate-300'
                    : 'border-indigo-900/60 bg-indigo-950/50 text-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="font-bold uppercase tracking-wider text-slate-400">
                    {msg.role === 'assistant' ? 'Honey-Grid Daemon' : 'Quarantined Operator'}
                  </span>
                  <span>{msg.ts}</span>
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            ))}
          </div>

          {/* Decoy Input Bar */}
          <form onSubmit={handleSendDecoy} className="p-4 border-t border-slate-800 bg-slate-950">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Query honey-grid sandbox (isolated execution)…"
                className="flex-1 h-10 rounded-xl border border-slate-800 bg-slate-900 px-4 font-mono text-[12px] text-slate-100 placeholder:text-slate-600 outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition cursor-pointer"
              >
                <IconSend width={14} height={14} />
              </button>
            </div>
            <div className="mt-2 text-[10.5px] font-mono text-slate-500 text-center">
              All interactions in this sandbox are synthetic and mirrored to forensic analysis buffers.
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
