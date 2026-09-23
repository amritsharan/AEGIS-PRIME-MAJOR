export const TECH_MATRIX = [
  {
    component: 'Sandboxing Kernel',
    selectedTech: 'wasmtime-py / Wasmtime 21+',
    justification: 'Provides JIT-compiled WebAssembly execution with strict WASI capability controls and zero ambient OS access.'
  },
  {
    component: 'Local Inference Engine',
    selectedTech: 'AirLLM (Layer Streaming)',
    justification: 'Enables 70B parameter inference on 4 GB VRAM consumer hardware via sequential disk-to-GPU paging.'
  },
  {
    component: 'Symbolic Prover',
    selectedTech: 'z3-solver (Z3 SMT v4.13+)',
    justification: 'Industry-standard theorem prover for first-order logic and numeric constraint checking prior to token rendering.'
  },
  {
    component: 'Hardware Telemetry',
    selectedTech: 'py3nvml & psutil',
    justification: 'Non-blocking hardware telemetry streaming VRAM load and GPU temperature via WebSockets.'
  },
  {
    component: 'Asynchronous Bus',
    selectedTech: 'FastAPI / uvicorn',
    justification: 'High-concurrency ASGI server managing parallel model streams without thread locking.'
  },
  {
    component: 'Frontend Workstation',
    selectedTech: 'Next.js 15, Framer Motion',
    justification: 'Powers the vertical Mac-style dock, dual-pane layout, and live entropy heatmaps.'
  }
];

export const ARCH_COMPARISON = [
  {
    vector: 'Operating Authority',
    enterprise: 'Ambient host privileges; full inheritance of OS user rights.',
    local: 'Ambient system execution; unsandboxed local process.',
    synapse: 'Zero Ambient Authority: Sandboxed in Wasm SFI with vfs://.'
  },
  {
    vector: 'Access Governance',
    enterprise: 'Framework-level permission decorators (bypassable via IPI).',
    local: 'Static local process execution; unconstrained file access.',
    synapse: 'Capability Tokens: Cryptographically signed τcap with 30s TTL.'
  },
  {
    vector: 'Safety Enforcement',
    enterprise: 'Probabilistic LLM guardrails (vulnerable to jailbreaks).',
    local: 'Unfiltered raw token streaming.',
    synapse: 'Neuro-Symbolic Gate: Deterministic Z3 SMT formal proof verification.'
  },
  {
    vector: 'Hardware Threshold',
    enterprise: 'Enterprise GPU clusters ($10k+) for 70B parameter models.',
    local: 'Out-of-memory errors on consumer GPUs with large models.',
    synapse: 'AirLLM Layer Sharding: Runs 70B models within 4 GB consumer VRAM.'
  },
  {
    vector: 'Epistemic Transparency',
    enterprise: 'Black-box generations; no token-level uncertainty metrics.',
    local: 'Raw token outputs with opaque model probabilities.',
    synapse: 'EADC Heatmap: Real-time Shannon entropy (Ht) rendering.'
  },
  {
    vector: 'Process Containment',
    enterprise: 'Process persists post-compromise; mutable application logs.',
    local: 'Unchecked process failures; silent terminal logging.',
    synapse: 'Atomic Kill-Switch: SIGKILL with memory zeroing and blockchain receipts.'
  }
];
