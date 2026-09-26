import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Sparkles, 
  RefreshCw, 
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Cpu,
  GitMerge,
  Zap,
  Layers,
  Search,
  Activity,
  ChevronRight
} from 'lucide-react';
import { ALL_MODELS } from '../data/modelsData';

export default function Neo4jMotionGraphView({ 
  onBack, 
  fusionPair = ['llama-3-local', 'gpt-4o-cloud'],
  onOpenFusionModal,
  onNavigateToMixer
}) {
  const [selectedNodeId, setSelectedNodeId] = useState('ensemble-core');
  const [isSimulating, setIsSimulating] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'models' | 'verifiers' | 'security'

  const model1Obj = ALL_MODELS.find(m => m.id === fusionPair[0]) || ALL_MODELS[1];
  const model2Obj = ALL_MODELS.find(m => m.id === fusionPair[1]) || ALL_MODELS[3];

  // Graph nodes representing Neo4j / Knowledge Graph model fusion
  const nodes = [
    { 
      id: 'model-a', 
      label: 'Model A (Primary)', 
      sub: model1Obj.name, 
      type: 'model', 
      category: 'models',
      x: 120, 
      y: 110, 
      color: '#06b6d4', 
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.5)',
      description: 'Primary sovereign edge neural model executing inside WASM-SFI isolation. Streams raw token weights through memory-paged ring buffers.',
      invariants: ['WASM Linear Memory <= 4GB', 'Capability Scope: vfs://ephemeral', 'AirLLM Layer Paging: Active'],
      upstream: [],
      downstream: ['ensemble-core']
    },
    { 
      id: 'model-b', 
      label: 'Model B (Secondary)', 
      sub: model2Obj.name, 
      type: 'model', 
      category: 'models',
      x: 120, 
      y: 310, 
      color: '#8b5cf6', 
      bg: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.5)',
      description: 'Secondary domain-specific analytical model providing cross-domain axiomatic proofs and semantic complement tokens.',
      invariants: ['Post-Quantum Kyber-768 Tunnel', 'Axiom Verification Degree: n=256', 'PQC AEAD ChaCha20-Poly1305'],
      upstream: [],
      downstream: ['ensemble-core']
    },
    { 
      id: 'ensemble-core', 
      label: 'Neo4j Consensus Mixer', 
      sub: 'Graph Fusion Gate', 
      type: 'core', 
      category: 'verifiers',
      x: 360, 
      y: 210, 
      color: '#3b82f6', 
      bg: 'rgba(59, 130, 246, 0.16)',
      border: 'rgba(59, 130, 246, 0.6)',
      description: 'Central Neo4j Graph Neural Router. Computes semantic vector alignment, eliminates hallucinations, and synthesizes multi-agent consensus weights.',
      invariants: ['Cross-Entropy Bound: Ht <= 0.22', 'Dual Model Invariant Agreement >= 96.5%', 'Directed Cypher Proof Edge: Verified'],
      upstream: ['model-a', 'model-b'],
      downstream: ['z3-verifier', 'wasi-sandbox']
    },
    { 
      id: 'z3-verifier', 
      label: 'Z3 SMT Invariant Gate', 
      sub: 'unsat verified (Degree <= 4)', 
      type: 'verifier', 
      category: 'verifiers',
      x: 600, 
      y: 110, 
      color: '#10b981', 
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.5)',
      description: 'Zero-hallucination formal first-order logic verifier. Enforces mathematical invariants and rejects any unproven token synthesis.',
      invariants: ['SMT Solver: Z3 C++ WASM bindings', 'Logic Form: QF_UF (Quantifier-Free Uninterpreted Functions)', 'Proof Result: unsat (Theorem Holds)'],
      upstream: ['ensemble-core'],
      downstream: ['unified-output']
    },
    { 
      id: 'wasi-sandbox', 
      label: 'WASI Isolation Sandbox', 
      sub: 'τcap token verified', 
      type: 'security', 
      category: 'security',
      x: 600, 
      y: 310, 
      color: '#f59e0b', 
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.5)',
      description: 'Capability-based virtual filesystem isolation layer. Prevents unauthorized system calls, directory traversal, and host memory access.',
      invariants: ['Lumina Auth τcap TTL: 300s', 'Sandbox Memory Bounds: Strict 64MB SFI Heap', 'Host OS Escape Resistance: 100%'],
      upstream: ['ensemble-core'],
      downstream: ['unified-output']
    },
    { 
      id: 'unified-output', 
      label: 'Synthesized Solution Node', 
      sub: 'Confidence: 99.4% | Ht: 0.14', 
      type: 'output', 
      category: 'verifiers',
      x: 820, 
      y: 210, 
      color: '#0284c7', 
      bg: 'rgba(2, 132, 199, 0.16)',
      border: 'rgba(2, 132, 199, 0.6)',
      description: 'Final verified unified response deliverable to the user, accompanied by cryptographic Proof-of-Agency audit receipt.',
      invariants: ['Zenith-Mesh Substrate Receipt: #3902', 'Cryptographic Hash: 0x8f2a...c901', 'Invariant Confidence: 99.4%'],
      upstream: ['z3-verifier', 'wasi-sandbox'],
      downstream: []
    }
  ];

  // Graph edges with animated flow
  const edges = [
    { from: 'model-a', to: 'ensemble-core', label: 'WASM Stream', color: '#06b6d4', weight: '3.4 GB/s' },
    { from: 'model-b', to: 'ensemble-core', label: 'Domain Axioms', color: '#8b5cf6', weight: 'PQC Tunnel' },
    { from: 'ensemble-core', to: 'z3-verifier', label: 'SMT Solver', color: '#10b981', weight: 'Z3 Invariants' },
    { from: 'ensemble-core', to: 'wasi-sandbox', label: 'Auth Token', color: '#f59e0b', weight: 'τcap 300s' },
    { from: 'z3-verifier', to: 'unified-output', label: 'Proof Pass', color: '#0284c7', weight: 'unsat valid' },
    { from: 'wasi-sandbox', to: 'unified-output', label: 'Safe I/O', color: '#0284c7', weight: 'Isolated VFS' }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[2];
  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <div className="flex-1 overflow-y-auto pl-16 sm:pl-22 p-4 sm:p-8 bg-slate-50/60 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ========================================================================= */}
        {/* TOP HEADER BANNER                                                         */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-mono font-semibold"
                  title="Return to Model Mixer / Workspace"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-600" />
                  <span>Workspace</span>
                </button>
              )}
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold font-mono text-slate-900 flex items-center gap-2">
                  NEO4J MOTION GRAPH & NEURAL KNOWLEDGE MESH
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Directed Mesh
                  </span>
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-sans pl-1">
              Interactive relationship nodes between dual models, Z3 formal SMT verifier, WASI sandbox, and synthesized solution node.
            </p>
          </div>

          {/* Header Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 border shadow-xs ${
                isSimulating 
                  ? 'bg-cyan-50 text-cyan-700 border-cyan-300 font-bold' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-cyan-600' : ''}`} />
              <span>{isSimulating ? 'Simulation Active' : 'Simulation Paused'}</span>
            </button>

            {onOpenFusionModal && (
              <button
                onClick={onOpenFusionModal}
                className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-800 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <GitMerge className="w-3.5 h-3.5 text-pink-600" />
                <span>Configure Fused Models</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATS & METRICS TOP RIBBON                                                */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Invariant Entities</div>
              <div className="text-sm font-bold text-slate-900 font-mono">6 Nodes Verified</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 border border-violet-200">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Directed Proof Edges</div>
              <div className="text-sm font-bold text-slate-900 font-mono">6 Directed Paths</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Z3 SMT Invariant Gate</div>
              <div className="text-sm font-bold text-emerald-700 font-mono">unsat (Pass Degree &lt;= 4)</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">WASI Capability Scope</div>
              <div className="text-sm font-bold text-amber-700 font-mono">τcap 300s Verified</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN GRAPH CANVAS & NODE INSPECTOR DUAL LAYOUT                            */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLS: SVG GRAPH VISUALIZER CANVAS */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col justify-between overflow-hidden relative">
            
            {/* Filter Pills */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400 mr-1">Filter:</span>
                {[
                  { id: 'all', label: 'All Entities' },
                  { id: 'models', label: 'Dual Models' },
                  { id: 'verifiers', label: 'SMT & Consensus' },
                  { id: 'security', label: 'WASI Sandbox' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      filterType === t.id
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono text-cyan-700 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                Click node to inspect mechanics
              </span>
            </div>

            {/* SVG Motion Canvas */}
            <div className="py-4 select-none overflow-x-auto flex items-center justify-center">
              <svg 
                viewBox="0 0 940 420" 
                className="w-full h-80 sm:h-96 drop-shadow-xs"
              >
                <defs>
                  <linearGradient id="edgeGradA" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="edgeGradB" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="meshGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Render Directed Proof Edges */}
                {edges.map((edge, idx) => {
                  const fromNode = getNode(edge.from);
                  const toNode = getNode(edge.to);
                  if (!fromNode || !toNode) return null;

                  const isEdgeActive = filterType === 'all' || 
                    (filterType === fromNode.category || filterType === toNode.category);

                  const midX = (fromNode.x + toNode.x) / 2;
                  const midY = (fromNode.y + toNode.y) / 2;

                  return (
                    <g key={idx} opacity={isEdgeActive ? 1 : 0.25} className="transition-opacity duration-300">
                      {/* Base edge dashed line */}
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={edge.color}
                        strokeWidth="2.5"
                        strokeOpacity="0.45"
                        strokeDasharray="5 5"
                      />

                      {/* Animated traveling energy pulse beam */}
                      {isSimulating && isEdgeActive && (
                        <motion.circle
                          r="4.5"
                          fill={edge.color}
                          filter="url(#meshGlow)"
                          initial={{ cx: fromNode.x, cy: fromNode.y }}
                          animate={{
                            cx: [fromNode.x, toNode.x],
                            cy: [fromNode.y, toNode.y]
                          }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: idx * 0.4
                          }}
                        />
                      )}

                      {/* Edge Label Badge */}
                      <rect
                        x={midX - 38}
                        y={midY - 11}
                        width="76"
                        height="22"
                        rx="11"
                        fill="#ffffff"
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                        className="shadow-xs"
                      />
                      <text
                        x={midX}
                        y={midY + 3.5}
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-slate-700 font-bold"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}

                {/* Render Graph Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isFiltered = filterType === 'all' || filterType === node.category;

                  return (
                    <motion.g
                      key={node.id}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="cursor-pointer"
                      opacity={isFiltered ? 1 : 0.3}
                    >
                      {/* Outer glow ring */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="42"
                        fill={node.bg}
                        stroke={isSelected ? '#0284c7' : node.border}
                        strokeWidth={isSelected ? '3' : '1.5'}
                        filter={isSelected ? 'url(#meshGlow)' : undefined}
                      />

                      {/* Inner white circle base */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="28"
                        fill="#ffffff"
                        stroke={node.color}
                        strokeWidth="2"
                      />

                      {/* Center Core Dot */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="8"
                        fill={node.color}
                      />

                      {/* Primary Node Label below */}
                      <text
                        x={node.x}
                        y={node.y + 58}
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-slate-900 tracking-tight"
                      >
                        {node.label}
                      </text>
                      
                      {/* Secondary subtext below */}
                      <text
                        x={node.x}
                        y={node.y + 72}
                        textAnchor="middle"
                        className="text-[9.5px] font-mono fill-slate-500 font-medium"
                      >
                        {node.sub}
                      </text>
                    </motion.g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Canvas Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
              <span className="flex items-center gap-1.5 text-slate-600">
                <GitMerge className="w-3.5 h-3.5 text-cyan-600" />
                <span>Topology: Model A ({model1Obj.name}) ⟷ Model B ({model2Obj.name})</span>
              </span>
              <span className="text-emerald-700 font-semibold">Invariant State: SMT UNSAT (PASS)</span>
            </div>
          </div>

          {/* RIGHT 1 COL: INTERACTIVE NODE RELATIONSHIP MECHANICS INSPECTOR */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              
              {/* Inspector Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <h3 className="font-bold text-sm text-slate-900 font-mono">
                    ENTITY INSPECTOR
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold uppercase">
                  {selectedNode.type}
                </span>
              </div>

              {/* Node Title & Sub */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-xs font-bold text-slate-900">{selectedNode.label}</div>
                <div className="text-[11px] font-mono text-cyan-700 font-semibold">{selectedNode.sub}</div>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed font-sans">
                  {selectedNode.description}
                </p>
              </div>

              {/* Invariants & Formal Bounds */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enforced Invariants & Axioms</span>
                </div>
                <div className="space-y-1.5">
                  {selectedNode.invariants.map((inv, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] font-mono text-emerald-900 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{inv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Directed Connections */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-800 font-mono">Directed Topology Connections</div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  {/* Upstream */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Upstream</span>
                    <span className="font-bold text-slate-700">
                      {selectedNode.upstream.length > 0 ? selectedNode.upstream.join(', ') : 'Root Source'}
                    </span>
                  </div>
                  
                  {/* Downstream */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Downstream</span>
                    <span className="font-bold text-cyan-700">
                      {selectedNode.downstream.length > 0 ? selectedNode.downstream.join(', ') : 'Terminal Node'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions inside Inspector */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {onNavigateToMixer && (
                <button
                  onClick={onNavigateToMixer}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-mono text-xs font-bold transition-all shadow-md shadow-pink-500/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize in Model Mixer</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
