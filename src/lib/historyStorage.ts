export interface StoredMessage {
  id: string
  role: 'user' | 'assistant' | 'mixer'
  content: string
  model: string
  streaming?: boolean
  error?: string | null
  ts: string
  mixerResponses?: Array<{
    modelId: string
    content: string
    streaming: boolean
    error: string | null
  }>
}

export interface ConversationSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  mode: 'standard' | 'mixer'
  modelA: string
  modelB?: string
  messages: StoredMessage[]
}

const STORAGE_KEY = 'synapse_conversations_v2'

const SEED_SESSIONS: ConversationSession[] = [
  {
    id: 'seed-mixer-1',
    title: 'Synthesize Ethanol Molecular Structure & Valency',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    mode: 'mixer',
    modelA: 'llama3-local',
    modelB: 'qwen-local',
    messages: [
      {
        id: 'sm1-u1',
        role: 'user',
        content: 'Synthesize the ethanol molecular structure and verify C1-C2 bonds under Carbon valency rules using Z3 prover methodology.',
        model: 'llama3-local',
        streaming: false,
        error: null,
        ts: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'sm1-m1',
        role: 'mixer',
        content: 'Synthesize the ethanol molecular structure and verify C1-C2 bonds under Carbon valency rules using Z3 prover methodology.',
        model: 'llama3-local',
        streaming: false,
        error: null,
        ts: new Date(Date.now() - 3600000 * 2 + 3000).toISOString(),
        mixerResponses: [
          {
            modelId: 'llama3-local',
            streaming: false,
            error: null,
            content: `### Ethanol (C₂H₅OH) Synthesis & Z3 Prover Analysis

Ethanol consists of two sp³ hybridized carbon atoms, one hydroxyl group (-OH), and five hydrogen atoms:

\`\`\`smt2
; Z3 SMT-LIB2 Valency Verification
(declare-sort Atom)
(declare-fun valency (Atom) Int)
(declare-const C1 Atom)
(declare-const C2 Atom)
(declare-const O Atom)

(assert (= (valency C1) 4))
(assert (= (valency C2) 4))
(assert (= (valency O) 2))

(check-sat) ; Returns sat: C1-C2 single covalent bond satisfied
\`\`\`

**Structural Formula:**
\`\`\`
      H   H
      |   |
  H - C - C - O - H
      |   |
      H   H
\`\`\`
All carbon centers maintain exactly 4 valence bonds under octet stability rules.`,
          },
          {
            modelId: 'qwen-local',
            streaming: false,
            error: null,
            content: `### Dual Consensus Formulation: Ethanol Topology

**1. Molecular Geometry:**
- Formula: \`CH₃-CH₂-OH\`
- Bond Angles: ~109.5° (Tetrahedral around C1, C2) and ~104.5° (Bent around O)

**2. Bond Order Matrix:**
\`\`\`python
bond_matrix = {
    ("C1", "C2"): 1.0,  # Single sigma bond (154 pm)
    ("C2", "O"): 1.0,   # Carbon-Oxygen sigma bond (143 pm)
    ("O", "H"): 1.0,    # Hydroxyl bond (96 pm)
}
\`\`\`
Constraint satisfaction verified: Zero formal charges, no dangling valence electrons.`,
          },
        ],
      },
    ],
  },
  {
    id: 'seed-mixer-2',
    title: 'Compare Llama-3 Local vs Grok-3 Frontier Cloud',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    mode: 'mixer',
    modelA: 'llama3-local',
    modelB: 'grok-cloud',
    messages: [
      {
        id: 'sm2-u1',
        role: 'user',
        content: 'Compare local edge quantized inference versus cloud frontier models for zero-trust microservice architectures.',
        model: 'llama3-local',
        streaming: false,
        error: null,
        ts: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
      {
        id: 'sm2-m1',
        role: 'mixer',
        content: 'Compare local edge quantized inference versus cloud frontier models for zero-trust microservice architectures.',
        model: 'llama3-local',
        streaming: false,
        error: null,
        ts: new Date(Date.now() - 3600000 * 6 + 4000).toISOString(),
        mixerResponses: [
          {
            modelId: 'llama3-local',
            streaming: false,
            error: null,
            content: `**Local Edge Quantization (Ollama / Llama-3):**
- **Zero Cloud Egress:** All tokens process within local RAM/VRAM.
- **Latency:** Deterministic ~18ms per token.
- **Security:** Strict air-gap compatibility; no telemetry leaks.`,
          },
          {
            modelId: 'grok-cloud',
            streaming: false,
            error: null,
            content: `**Frontier Cloud Model (xAI Grok-3):**
- **Reasoning Depth:** Superior multi-step architectural synthesis.
- **Context Window:** Up to 128k+ token memory buffer.
- **Throughput:** High parallel token throughput via cloud tensor clusters.`,
          },
        ],
      },
    ],
  },
  {
    id: 'seed-standard-1',
    title: 'WASI Sandbox Isolation Audit',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    mode: 'standard',
    modelA: 'llama3-local',
    messages: [
      {
        id: 'ss1-u1',
        role: 'user',
        content: 'Audit WASI filesystem isolation: verify zero ambient authority and ephemeral vfs:// memory mount constraints.',
        model: 'llama3-local',
        streaming: false,
        error: null,
        ts: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: 'ss1-a1',
        role: 'assistant',
        content: `### WASI Filesystem Isolation Audit Report

1. **Ambient Authority:** All host syscalls (\`open\`, \`read\`, \`write\`) are intercepted. Descriptors require explicit pre-opening via capability-based directory handles.
2. **Virtual Mount (\`vfs://\`):** Memory-backed in-RAM tmpfs with zero host path visibility.
3. **Verdict:** Pass (Zero ambient authority verified).`,
        model: 'llama3-local',
        streaming: false,
        error: null,
        ts: new Date(Date.now() - 3600000 * 12 + 2000).toISOString(),
      },
    ],
  },
]

export function getStoredSessions(): ConversationSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SESSIONS))
      return SEED_SESSIONS
    }
    const parsed = JSON.parse(raw) as ConversationSession[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_SESSIONS
  } catch {
    return SEED_SESSIONS
  }
}

export function saveSession(session: ConversationSession): void {
  try {
    const sessions = getStoredSessions()
    const index = sessions.findIndex((s) => s.id === session.id)
    if (index >= 0) {
      sessions[index] = { ...session, updatedAt: new Date().toISOString() }
    } else {
      sessions.unshift({ ...session, updatedAt: new Date().toISOString() })
    }
    // Keep max 50 sessions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 50)))
  } catch (err) {
    console.warn('Failed to save session to localStorage:', err)
  }
}

export function deleteSession(id: string): ConversationSession[] {
  try {
    const sessions = getStoredSessions().filter((s) => s.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    return sessions
  } catch {
    return []
  }
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
}
