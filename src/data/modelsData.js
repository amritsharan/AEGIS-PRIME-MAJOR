export const ALL_MODELS = [
  {
    id: 'synapse-os-free',
    name: 'SYNAPSE-OS FREE',
    fullName: 'SYNAPSE-OS FREE',
    type: 'Neural Process',
    latency: '34ms',
    isLocal: true,
    badge: 'CORE',
    color: '#f59e0b',
    description: 'Autonomous multi-file software engineering model for end-to-end application scaffolding.'
  },
  {
    id: 'llama-3-local',
    name: 'Llama-3 Local',
    fullName: 'Llama-3.2:1B (Ollama Local)',
    type: 'Local Ollama Process',
    latency: '14ms',
    isLocal: true,
    badge: 'OLLAMA',
    color: '#06b6d4',
    description: 'Hardware-accelerated local Ollama Llama-3.2 model running fully sovereign offline on your hardware.'
  },
  {
    id: 'qwen-local',
    name: 'Qwen 2.5 Local',
    fullName: 'Qwen2.5:0.5B (Ollama Local)',
    type: 'Local Ollama Process',
    latency: '12ms',
    isLocal: true,
    badge: 'OLLAMA',
    color: '#10b981',
    description: 'Downloaded ultra-lightweight Qwen 2.5 local model executing offline on your system.'
  },
  {
    id: 'mistral-local',
    name: 'Mistral Local',
    fullName: 'Mixtral-8x7B',
    type: 'Local Process',
    latency: '63ms',
    isLocal: true,
    badge: 'LOCAL',
    color: '#0ea5e9',
    description: 'Sparse mixture of experts model with fast local token generation.'
  },
  {
    id: 'gpt-4o-cloud',
    name: 'GPT-4o Cloud',
    fullName: 'GPT-4o-turbo-128k',
    type: 'Cloud Tunnel',
    latency: '142ms',
    isLocal: false,
    badge: 'CLOUD',
    color: '#8b5cf6',
    description: 'Kyber post-quantum encrypted cloud tunnel to OpenAI flagship reasoning model.'
  },
  {
    id: 'claude-cloud',
    name: 'Claude Cloud',
    fullName: 'Claude-3.5-Sonnet',
    type: 'Cloud Tunnel',
    latency: '158ms',
    isLocal: false,
    badge: 'CLOUD',
    color: '#f97316',
    description: 'High-capability analytical model with advanced code generation and safety provers.'
  },
  {
    id: 'qwen-cloud',
    name: 'Qwen Cloud',
    fullName: 'Qwen-2.5-72B Cloud',
    type: 'Cloud Tunnel',
    latency: '125ms',
    isLocal: false,
    badge: 'CLOUD',
    color: '#34d399',
    description: 'Multilingual frontier model with strong mathematical and coding reasoning.'
  },
  {
    id: 'kimi-cloud',
    name: 'Kimi Cloud',
    fullName: 'Kimi-K1.5',
    type: 'Cloud Tunnel',
    latency: '131ms',
    isLocal: false,
    badge: 'DEMO',
    color: '#3b82f6',
    description: 'Long-context reasoning engine with 200k token window retrieval.'
  },
  {
    id: 'grok-2-cloud',
    name: 'Grok-2 Cloud',
    fullName: 'Grok-2-1212',
    type: 'Cloud Tunnel',
    latency: '144ms',
    isLocal: false,
    badge: 'DEMO',
    color: '#ec4899',
    description: 'Real-time telemetry grounded model with deep logic synthesis capabilities.'
  },
  {
    id: 'gemini-flash',
    name: 'Gemini Flash',
    fullName: 'Gemini-Flash-1.5',
    type: 'Cloud Tunnel',
    latency: '118ms',
    isLocal: false,
    badge: 'DEMO',
    color: '#6366f1',
    description: 'Ultra high-speed multimodal inference engine optimized for real-time agentic workflows.'
  }
];

export const DEFAULT_STANDARD_CHATS = [
  {
    id: 'std-chat-01',
    title: 'WASI Sandbox Isolation Audit',
    timestamp: '1 hour ago',
    modelId: 'llama-3-local',
    modelName: 'Llama-3 Local',
    messages: [
      { sender: 'user', text: 'Verify host filesystem isolation under WASI sandbox and Lumina-Auth.' },
      {
        sender: 'assistant',
        text: 'Host OS privileges verified revoked. Ambient authority zeroed. Mounted ephemeral vfs:// with Lumina-Auth 30s TTL token. Sandboxed execution completed under 87ms.',
        modelName: 'Llama-3 Local',
        confidence: '99.4%'
      }
    ]
  },
  {
    id: 'std-chat-02',
    title: 'FastAPI Microservice Scaffolding',
    timestamp: 'Yesterday',
    modelId: 'claude-cloud',
    modelName: 'Claude Cloud',
    messages: [
      { sender: 'user', text: 'Generate zero-trust FastAPI middleware with PQC header verification.' },
      {
        sender: 'assistant',
        text: 'Middleware generated with Kyber-1024 decapsulation routine and constant-time token verification. Zero external dependency leaks.',
        modelName: 'Claude Cloud',
        confidence: '99.1%'
      }
    ]
  }
];

export const DEFAULT_MIXER_CHATS = [
  {
    id: 'mix-chat-01',
    title: 'Biochemical Ethanol Synthesis',
    timestamp: '2 hours ago',
    model1: 'llama-3-local',
    model2: 'gpt-4o-cloud',
    messages: [
      { sender: 'user', text: 'Synthesize Ethanol (C2H5OH) molecular structure verifying Carbon valency rules.' },
      {
        sender: 'assistant',
        text: 'Ethanol (C2H5OH) synthesized safely. Carbon C1-C2 single bond verified (Degree <= 4). Z3 SMT prover status: unsat (Valid mathematical proof). Dual consensus alignment achieved.',
        model1Name: 'Llama-3 Local',
        model2Name: 'GPT-4o Cloud',
        synthesizedConfidence: '98.4%',
        entropy: 0.18
      }
    ]
  },
  {
    id: 'mix-chat-02',
    title: 'Quantum Telemetry Variance Audit',
    timestamp: 'Yesterday',
    model1: 'llama-3-local',
    model2: 'claude-cloud',
    messages: [
      { sender: 'user', text: 'Analyze phase variance entangled with speculative noise vector.' },
      {
        sender: 'assistant',
        text: 'Telemetry analyzed across Llama-3 and Claude. Shannon entropy (Ht = 0.22) bounded by consensus gate. All invariants verified.',
        model1Name: 'Llama-3 Local',
        model2Name: 'Claude Cloud',
        synthesizedConfidence: '97.2%',
        entropy: 0.22
      }
    ]
  }
];

export const FORGE_TEMPLATES = [
  {
    id: 'secure-login',
    title: 'Secure Login Portal',
    desc: 'OAuth2 + JWT + PQC Auth',
    category: 'Security',
    icon: 'ShieldCheck',
    color: '#06b6d4',
    prompt: 'Build me a secure login portal with OAuth2, JWT authentication, and Post-Quantum Kyber-1024 encryption headers.',
    files: [
      {
        name: 'auth_service.py',
        lang: 'python',
        code: `from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
import hmac, hashlib, time

app = FastAPI(title="Synapse PQC Auth Microservice")

class TokenPayload(BaseModel):
    user_id: str
    tau_cap: str
    exp: int

@app.post("/auth/login")
async def authenticate_session(credentials: dict):
    # Lumina-Auth Zero-Knowledge validation
    zk_token = credentials.get("zk_token")
    if not zk_token or len(zk_token) < 32:
        raise HTTPException(status_code=401, detail="Invalid ZK Proof token")
    
    ephemeral_ttl = int(time.time()) + 1800
    return {
        "status": "AUTHENTICATED",
        "tau_cap": "0x7a8f...b4c5",
        "cipher": "CRYSTALS-Kyber-1024",
        "expires_at": ephemeral_ttl
    }`
      },
      {
        name: 'LoginView.tsx',
        lang: 'typescript',
        code: `import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export default function LoginPortal() {
  const [zkStatus, setZkStatus] = useState('READY');

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4 text-cyan-600">
        <ShieldCheck className="w-5 h-5" />
        <h2 className="font-bold font-mono">PQC Lumina Auth Gate</h2>
      </div>
      <input 
        type="password" 
        placeholder="Enter Sovereign Token (τcap)..." 
        className="w-full p-3 rounded-xl border border-slate-200 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      <button className="w-full py-3 rounded-xl bg-cyan-600 text-white font-bold flex items-center justify-center gap-2">
        <span>Verify & Unlock</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}`
      }
    ]
  },
  {
    id: 'rest-api',
    title: 'REST API Backend',
    desc: 'FastAPI + PostgreSQL',
    category: 'Backend',
    icon: 'Server',
    color: '#3b82f6',
    prompt: 'Build me a REST API backend with FastAPI, PostgreSQL async connection pooling, and WASI sandbox validation.',
    files: [
      {
        name: 'main.py',
        lang: 'python',
        code: `from fastapi import FastAPI, Query
from typing import List

app = FastAPI(title="Synapse Agentic REST API")

@app.get("/api/v1/telemetry")
async def get_telemetry(limit: int = Query(default=10, le=100)):
    return {
        "engine": "Synapse-OS L2",
        "active_workers": 4,
        "shannon_entropy": 0.14,
        "status": "OPTIMAL"
    }`
      }
    ]
  },
  {
    id: 'ai-chat-interface',
    title: 'AI Chat Interface',
    desc: 'Multi-model streaming UI',
    category: 'Frontend',
    icon: 'Bot',
    color: '#ec4899',
    prompt: 'Build me a reactive AI Chat interface with dual-model consensus streaming and Markdown rendering.',
    files: [
      {
        name: 'ChatStream.jsx',
        lang: 'javascript',
        code: `import React, { useState } from 'react';

export default function ChatStream() {
  const [messages, setMessages] = useState([]);
  return (
    <div className="h-full flex flex-col p-4 bg-slate-50">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className="p-3 rounded-2xl bg-white shadow-xs">{m.text}</div>
        ))}
      </div>
    </div>
  );
}`
      }
    ]
  },
  {
    id: 'blockchain-dash',
    title: 'Blockchain Dashboard',
    desc: 'Real-time ledger monitor',
    category: 'Web3',
    icon: 'Coins',
    color: '#f59e0b',
    prompt: 'Build me a real-time blockchain ledger monitor tracking ZK-Rollup batches and block finality.',
    files: [
      {
        name: 'LedgerMonitor.tsx',
        lang: 'typescript',
        code: `export interface BlockHeader {
  number: number;
  hash: string;
  zkProofHash: string;
  gasUsed: string;
}`
      }
    ]
  },
  {
    id: 'microservice-auth',
    title: 'Microservice Auth',
    desc: 'Zero-trust architecture',
    category: 'Cloud',
    icon: 'Network',
    color: '#10b981',
    prompt: 'Build me a zero-trust microservice authentication proxy verifying ephemeral capability tokens.',
    files: [
      {
        name: 'proxy.go',
        lang: 'go',
        code: `package main

import "fmt"

func main() {
    fmt.Println("Synapse Zero-Trust Auth Proxy initialized.")
}`
      }
    ]
  },
  {
    id: 'realtime-dash',
    title: 'Real-time Dashboard',
    desc: 'WebSocket + React',
    category: 'Frontend',
    icon: 'Code',
    color: '#eab308',
    prompt: 'Build me a real-time WebSocket dashboard for live agent telemetry and memory paging throughput.',
    files: [
      {
        name: 'LiveMetrics.tsx',
        lang: 'typescript',
        code: `export const useTelemetrySocket = () => {
  // WebSocket live telemetry hook
};`
      }
    ]
  },
  {
    id: 'pqc-crypto',
    title: 'PQC Crypto Module',
    desc: 'Post-quantum encryption',
    category: 'Crypto',
    icon: 'Lock',
    color: '#8b5cf6',
    prompt: 'Build me a Post-Quantum Cryptography module implementing CRYSTALS-Kyber and Dilithium verification.',
    files: [
      {
        name: 'kyber.rs',
        lang: 'rust',
        code: `// CRYSTALS-Kyber 1024 Key Encapsulation Mechanism
pub struct KyberKeys {
    pub pk: [u8; 1568],
    pub sk: [u8; 3168],
}`
      }
    ]
  },
  {
    id: 'edge-cdn',
    title: 'Edge CDN API',
    desc: 'Distributed caching layer',
    category: 'Infra',
    icon: 'Layers',
    color: '#0284c7',
    prompt: 'Build me a distributed edge caching layer with LRU eviction and memory bounds under 4GB.',
    files: [
      {
        name: 'edge_cache.py',
        lang: 'python',
        code: `class EdgeCache:
    def __init__(self, max_mb=4096):
        self.max_mb = max_mb`
      }
    ]
  }
];
