export const AVAILABLE_MODELS = [
  { id: 'synapse-70b', name: 'Synapse-70B Local Sovereign (WASM SFI)', type: 'Local', speed: 'Fast', confidence: 0.95 },
  { id: 'deepreasoning-zk', name: 'DeepReasoning ZK-Prover (SMT Sidecar)', type: 'Symbolic', speed: 'Medium', confidence: 0.99 },
  { id: 'quantum-cloud', name: 'Quantum Tunnel Cloud (Kyber Encrypted)', type: 'Cloud', speed: 'Instant', confidence: 0.88 },
  { id: 'biochem-prover', name: 'BioChem Molecular Valency Prover', type: 'Specialized', speed: 'Fast', confidence: 0.97 }
];

export const PAST_CHATS = [
  {
    id: 'chat-01',
    title: 'Biochemical Ethanol Synthesis',
    timestamp: '2 hours ago',
    model1: 'synapse-70b',
    model2: 'biochem-prover',
    messages: [
      { sender: 'user', text: 'Synthesize Ethanol (C2H5OH) molecular structure verifying Carbon valency rules.' },
      { 
        sender: 'assistant', 
        text: 'Ethanol (C2H5OH) synthesized safely. Carbon C1-C2 single bond verified (Degree <= 4). Z3 SMT prover status: unsat (Valid mathematical proof).',
        model1Name: 'Synapse-70B',
        model2Name: 'BioChem Prover',
        synthesizedConfidence: '98.4%',
        entropy: 0.18
      }
    ]
  },
  {
    id: 'chat-02',
    title: 'Quantum Telemetry Variance Audit',
    timestamp: 'Yesterday',
    model1: 'synapse-70b',
    model2: 'quantum-cloud',
    messages: [
      { sender: 'user', text: 'Analyze phase variance entangled with speculative noise vector.' },
      { 
        sender: 'assistant', 
        text: 'Telemetry analyzed. High Shannon entropy detected (Ht = 1.35). Automated secondary consensus query initiated.',
        model1Name: 'Synapse-70B',
        model2Name: 'Quantum Cloud',
        synthesizedConfidence: '82.1%',
        entropy: 1.35
      }
    ]
  },
  {
    id: 'chat-03',
    title: 'Enterprise POSIX Security Verification',
    timestamp: '3 days ago',
    model1: 'synapse-70b',
    model2: 'deepreasoning-zk',
    messages: [
      { sender: 'user', text: 'Verify host filesystem isolation under WASI sandbox.' },
      { 
        sender: 'assistant', 
        text: 'Host OS privileges revoked. Ambient authority zeroed. Mounted ephemeral vfs:// with Lumina-Auth 30s TTL token.',
        model1Name: 'Synapse-70B',
        model2Name: 'DeepReasoning ZK',
        synthesizedConfidence: '99.1%',
        entropy: 0.09
      }
    ]
  }
];

export const EBOOKS = [
  {
    id: 'ebook-01',
    title: 'Synapse-OS Layer 2 Architectural Specification',
    author: 'Technical Systems Architecture Working Group',
    pages: 14,
    category: 'Specification Paper',
    description: 'Capability-Based Agentic Microkernel with Neuro-Symbolic Logic Verification and Edge Inference for Sovereign Intelligence Meshes.',
    content: `Synapse-OS isolates agentic workflows within WebAssembly (Wasm) Software-based Fault Isolation (SFI) microkernels governed by cryptographic Capability-Based Security (CBS). It eliminates ambient authority by mounting strictly ephemeral in-memory virtual filesystems (vfs://) tied to short-lived Capability Tokens (τcap). To enable sovereign edge deployment on consumer hardware without compromising model scale, Synapse-OS integrates layer-wise disk-to-VRAM sequential streaming (AirLLM), bounding active GPU allocation to under 4 GB for 70B parameter models.`
  },
  {
    id: 'ebook-02',
    title: 'Zero-Knowledge Cryptography & WASI Sandboxing',
    author: 'Aegis Security Research',
    pages: 28,
    category: 'Security Handbook',
    description: 'Formal guide on implementing zk-SNARK / zk-STARK proof verification sidecars and WASI capability isolation.',
    content: `Software-based Fault Isolation (SFI) using Wasmtime execution engine enforces strict WASI capability controls. System calls such as socket(), fork(), and unconstrained open() are omitted from the guest import table. Access to external resources requires an unforgeable, kernel-signed capability token τcap minted upon Lumina-Auth verification.`
  },
  {
    id: 'ebook-03',
    title: 'Neuro-Symbolic Logic Verification & Z3 SMT Provers',
    author: 'Formal Systems Lab',
    pages: 19,
    category: 'Formal Verification',
    description: 'How first-order logical axioms prevent neural hallucinations in biochemical and legal automation.',
    content: `The Logic-Shield acts as a deterministic verification gate. Stochastic token sequences are translated into declarative propositions and evaluated against hard-coded domain axioms prior to rendering. Solve(Φoutput ∧ ¬Adomain) outputs unsat for mathematically sound tokens, or sat when an invariant violation counterexample is synthesized.`
  }
];

export const PROJECTS = [
  { id: 'proj-01', name: 'Aegis Sovereign Intelligence Mesh', status: 'Active', updated: 'Today' },
  { id: 'proj-02', name: 'BioChem Valency Sandbox', status: 'Verified', updated: '2 days ago' },
  { id: 'proj-03', name: 'Financial Integrity Sentinel', status: 'Development', updated: '5 days ago' }
];
