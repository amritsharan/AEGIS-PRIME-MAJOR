import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  RefreshCw
} from 'lucide-react';

export default function Neo4jGraphVisualizer({ 
  model1 = 'Synapse-70B Local Sovereign (WASM SFI)', 
  model2 = 'BioChem Molecular Valency Prover',
  isExpanded = false,
  onToggleExpand
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSimulating, setIsSimulating] = useState(true);

  // Graph nodes representing Neo4j / Knowledge Graph model fusion
  const nodes = [
    { 
      id: 'model-a', 
      label: 'Model A (Primary)', 
      sub: model1.split(' ')[0] || 'Synapse-70B', 
      type: 'model', 
      x: 90, 
      y: 90, 
      color: '#06b6d4', 
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.4)',
      details: '70B Wasm-SFI sandboxed edge model streaming via AirLLM memory paging.'
    },
    { 
      id: 'model-b', 
      label: 'Model B (Secondary)', 
      sub: model2.split(' ')[0] || 'BioChem-Prover', 
      type: 'model', 
      x: 90, 
      y: 270, 
      color: '#8b5cf6', 
      bg: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.4)',
      details: 'Domain-specific valency & axiomatic prover sidecar for strict mathematical validation.'
    },
    { 
      id: 'ensemble-core', 
      label: 'Neo4j Consensus Mixer', 
      sub: 'Graph Fusion Gate', 
      type: 'core', 
      x: 270, 
      y: 180, 
      color: '#3b82f6', 
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.5)',
      details: 'Graph-based token synthesis & semantic alignment engine connecting cross-model axioms.'
    },
    { 
      id: 'z3-verifier', 
      label: 'Z3 SMT Invariant Gate', 
      sub: 'unsat verified (Degree <= 4)', 
      type: 'verifier', 
      x: 440, 
      y: 100, 
      color: '#10b981', 
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.4)',
      details: 'Zero-hallucination formal proof engine. Validates token constraints against invariant rules.'
    },
    { 
      id: 'wasi-sandbox', 
      label: 'WASI Isolation Sandbox', 
      sub: 'τcap token verified', 
      type: 'security', 
      x: 440, 
      y: 260, 
      color: '#f59e0b', 
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.4)',
      details: 'Capability-based virtual filesystem isolation preventing host OS exposure.'
    },
    { 
      id: 'unified-output', 
      label: 'Synthesized Solution Node', 
      sub: 'Confidence: 98.4% | Ht: 0.18', 
      type: 'output', 
      x: 610, 
      y: 180, 
      color: '#0284c7', 
      bg: 'rgba(2, 132, 199, 0.15)',
      border: 'rgba(2, 132, 199, 0.5)',
      details: 'Unified, mathematically sound multi-agent output delivered with formal cryptographic proof.'
    }
  ];

  // Graph edges with animated flow
  const edges = [
    { from: 'model-a', to: 'ensemble-core', label: 'WASM Stream', color: '#06b6d4' },
    { from: 'model-b', to: 'ensemble-core', label: 'Domain Axioms', color: '#8b5cf6' },
    { from: 'ensemble-core', to: 'z3-verifier', label: 'SMT Solver', color: '#10b981' },
    { from: 'ensemble-core', to: 'wasi-sandbox', label: 'Auth Token', color: '#f59e0b' },
    { from: 'z3-verifier', to: 'unified-output', label: 'Proof Pass', color: '#0284c7' },
    { from: 'wasi-sandbox', to: 'unified-output', label: 'Safe I/O', color: '#0284c7' }
  ];

  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <div className={`relative rounded-3xl overflow-hidden transition-all duration-300 border ${
      isExpanded 
        ? 'w-full bg-white/95 shadow-xl border-cyan-200' 
        : 'w-full bg-slate-50/80 shadow-sm border-slate-200/80 hover:border-cyan-300'
    }`}>
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 border border-cyan-200">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-slate-800 tracking-wide uppercase">
                Neo4j Knowledge Graph & Neural Motion Mesh
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Directed Graph
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive relationship nodes between dual models, Z3 formal verifier, and sandbox
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 border ${
              isSimulating 
                ? 'bg-cyan-50 text-cyan-700 border-cyan-200' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Active Pulse' : 'Paused'}</span>
          </button>

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              title={isExpanded ? 'Collapse Graph' : 'Expand Full Graph'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Area with Framer Motion Graphics */}
      <div className="relative p-2 sm:p-4 overflow-x-auto select-none">
        <svg 
          viewBox="0 0 720 360" 
          className="w-full h-64 sm:h-76 drop-shadow-xs"
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
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Graph Edges */}
          {edges.map((edge, idx) => {
            const fromNode = getNode(edge.from);
            const toNode = getNode(edge.to);
            if (!fromNode || !toNode) return null;

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            return (
              <g key={idx}>
                {/* Edge line */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={edge.color}
                  strokeWidth="2"
                  strokeOpacity="0.4"
                  strokeDasharray="4 4"
                />

                {/* Animated traveling energy pulse beam */}
                {isSimulating && (
                  <motion.circle
                    r="3.5"
                    fill={edge.color}
                    filter="url(#glow)"
                    initial={{ cx: fromNode.x, cy: fromNode.y }}
                    animate={{
                      cx: [fromNode.x, toNode.x],
                      cy: [fromNode.y, toNode.y]
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: idx * 0.35
                    }}
                  />
                )}

                {/* Edge Label Badge */}
                <rect
                  x={midX - 32}
                  y={midY - 9}
                  width="64"
                  height="18"
                  rx="9"
                  fill="#ffffff"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={midY + 3.5}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-500 font-semibold"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Render Graph Nodes with Framer Motion */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <motion.g
                key={node.id}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer"
              >
                {/* Node halo/glow */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="36"
                  fill={node.bg}
                  stroke={isSelected ? '#0284c7' : node.border}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  filter={isSelected ? 'url(#glow)' : undefined}
                />

                {/* Inner decorative circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  fill="#ffffff"
                  stroke={node.color}
                  strokeWidth="1.5"
                />

                {/* Center Icon Indicator */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="6"
                  fill={node.color}
                />

                {/* Node text label below */}
                <text
                  x={node.x}
                  y={node.y + 48}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-slate-800 tracking-tight"
                >
                  {node.label}
                </text>
                <text
                  x={node.x}
                  y={node.y + 60}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-500"
                >
                  {node.sub}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Selected Node Details Popover */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-lg flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0" 
                  style={{ backgroundColor: selectedNode.color }} 
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{selectedNode.label}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                      Type: {selectedNode.type}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    {selectedNode.details}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer info note */}
      <div className="px-5 py-2.5 bg-slate-50/90 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          <span>Neo4j Graph Topology: 6 Verified Invariant Entities, 6 Directed Proof Edges</span>
        </span>
        <span className="text-cyan-700 font-medium">Click any node to inspect relationship mechanics</span>
      </div>
    </div>
  );
}
