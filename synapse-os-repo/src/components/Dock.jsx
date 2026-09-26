import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Plus, 
  Cpu, 
  ShieldCheck, 
  FlaskConical, 
  Hammer, 
  Table2, 
  Network,
  Shield,
  Layers,
  Bot,
  LogOut
} from 'lucide-react';

export default function Dock({ 
  activeView, 
  onSelectView, 
  onToggleHistory, 
  onNewChat, 
  onOpenModelSelector,
  onToggleGraph,
  isGraphOpen,
  isHistoryOpen,
  isModelSelectorOpen,
  activeModelName,
  onLogoutRequest
}) {
  const [cypherBackendOnline, setCypherBackendOnline] = useState(true);
  const [zenithBackendOnline, setZenithBackendOnline] = useState(true);
  const [agentBackendOnline, setAgentBackendOnline] = useState(true);

  useEffect(() => {
    const probeBackends = async () => {
      try {
        const cRes = await fetch('/cypher/docs', { method: 'HEAD' }).catch(() => null);
        if (cRes && (cRes.ok || cRes.status === 200 || cRes.status === 404)) {
          setCypherBackendOnline(true);
        } else {
          // Fallback probe
          const direct = await fetch('http://127.0.0.1:9200/', { mode: 'no-cors' }).catch(() => null);
          setCypherBackendOnline(!!direct);
        }
      } catch {
        setCypherBackendOnline(true);
      }

      try {
        const zRes = await fetch('http://127.0.0.1:9944/', { mode: 'no-cors' }).catch(() => null);
        setZenithBackendOnline(!!zRes);
      } catch {
        setZenithBackendOnline(true);
      }

      try {
        const aRes = await fetch('http://127.0.0.1:8000/health', { mode: 'no-cors' }).catch(() => null);
        setAgentBackendOnline(!!aRes);
      } catch {
        setAgentBackendOnline(true);
      }
    };

    probeBackends();
    const interval = setInterval(probeBackends, 4000);
    return () => clearInterval(interval);
  }, []);
  const dockItems = [
    {
      id: 'history',
      label: 'Chat History',
      description: 'Standard & Fusion Archives',
      icon: History,
      color: 'text-slate-700',
      activeColor: 'text-cyan-600',
      badge: 'Archive',
      onClick: onToggleHistory,
      isActive: isHistoryOpen
    },
    {
      id: 'new-chat',
      label: 'New Chat',
      description: 'Start fresh Gemini-style query',
      icon: Plus,
      color: 'text-white',
      activeColor: 'text-white',
      isGlowing: true,
      badge: 'Gemini',
      onClick: onNewChat,
      isActive: activeView === 'new-chat' && !isHistoryOpen && !isModelSelectorOpen
    },
    {
      id: 'main-model',
      label: 'Main Model',
      description: activeModelName || 'Select Sovereign Model',
      icon: Cpu,
      color: 'text-slate-700',
      activeColor: 'text-cyan-600',
      badge: activeModelName?.split(' ')[0] || 'Llama-3',
      onClick: onOpenModelSelector,
      isActive: isModelSelectorOpen
    },
    {
      id: 'admin-panel',
      label: 'Admin Panel',
      description: 'ZK-Prover & WASM SFI Transparency',
      icon: ShieldCheck,
      color: 'text-slate-700',
      activeColor: 'text-violet-600',
      badge: 'Security',
      onClick: () => onSelectView('admin-panel'),
      isActive: activeView === 'admin-panel'
    },
    {
      id: 'model-mixer',
      label: 'Model Mixer',
      description: 'Dual Model Synthesis Workspace',
      icon: FlaskConical,
      color: 'text-slate-700',
      activeColor: 'text-pink-600',
      badge: 'Flask',
      onClick: () => onSelectView('model-mixer'),
      isActive: activeView === 'model-mixer'
    },
    {
      id: 'forge',
      label: 'Synapse Forge',
      description: 'Agentic Build Studio v2.0',
      icon: Hammer,
      color: 'text-slate-700',
      activeColor: 'text-amber-600',
      badge: 'Build',
      onClick: () => onSelectView('forge'),
      isActive: activeView === 'forge'
    },
    {
      id: 'matrix',
      label: 'Comparison Matrix',
      description: 'Option 7 Architectural Benchmarks',
      icon: Table2,
      color: 'text-slate-700',
      activeColor: 'text-blue-600',
      badge: 'Specs',
      onClick: () => onSelectView('matrix'),
      isActive: activeView === 'matrix'
    },
    {
      id: 'neo4j-graph',
      label: 'Neo4j Motion Graph',
      description: 'Interactive Neural Knowledge Graph & Motion Mesh',
      icon: Network,
      color: 'text-slate-700',
      activeColor: 'text-emerald-600',
      badge: 'Graph',
      onClick: () => onSelectView('neo4j-graph'),
      isActive: activeView === 'neo4j-graph'
    },
    {
      id: 'cypher-shield',
      label: cypherBackendOnline ? 'Cypher-Shield' : 'Cypher-Shield UI',
      description: cypherBackendOnline 
        ? 'PQC Lattice Engine (Backend :9200 Active)' 
        : 'Post-Quantum Encapsulation UI (Port 5175)',
      icon: Shield,
      color: 'text-slate-700',
      activeColor: 'text-cyan-600',
      badge: cypherBackendOnline ? 'PQC:9200 Active' : 'Port 5175',
      onClick: () => window.open('http://localhost:5175', '_blank'),
      isActive: false
    },
    {
      id: 'zenith-mesh',
      label: zenithBackendOnline ? 'Zenith-Mesh' : 'Zenith-Mesh UI',
      description: zenithBackendOnline 
        ? 'Substrate PoA Node (Backend :9944 Active)' 
        : 'Substrate Proof-of-Agency UI (Port 5176)',
      icon: Layers,
      color: 'text-slate-700',
      activeColor: 'text-emerald-600',
      badge: zenithBackendOnline ? 'Mesh:9944 Active' : 'Port 5176',
      onClick: () => window.open('http://localhost:5176', '_blank'),
      isActive: false
    },
    {
      id: 'autonomous-agent',
      label: agentBackendOnline ? 'Autonomous Agent' : 'Autonomous Agent UI',
      description: agentBackendOnline 
        ? 'QuantumShield AI Security Scanner (Backend :8000 Active)' 
        : 'Autonomous Security Platform (Port 3000)',
      icon: Bot,
      color: 'text-slate-700',
      activeColor: 'text-purple-600',
      badge: agentBackendOnline ? 'Agent:8000 Active' : 'Port 3000',
      onClick: () => window.open('http://localhost:3000', '_blank'),
      isActive: false
    },
    {
      id: 'logout',
      label: 'Logout',
      description: 'End Sovereign Session & Lock Microkernel',
      icon: LogOut,
      color: 'text-rose-500 hover:text-rose-600',
      activeColor: 'text-rose-600',
      badge: 'Exit',
      onClick: onLogoutRequest,
      isActive: false
    }
  ];

  return (
    <aside className="fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center">
      <motion.nav 
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="flex flex-col items-center gap-2 p-2 sm:p-2.5 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-900/10"
      >
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;
          const isGlowing = item.isGlowing;

          return (
            <div key={item.id} className="relative group">
              <motion.button
                whileHover={{ scale: 1.14 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={item.onClick}
                className={`relative p-2.5 sm:p-3 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isGlowing
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/35 ring-2 ring-cyan-300/70 hover:shadow-cyan-500/50'
                    : isActive
                    ? 'bg-cyan-50 text-cyan-600 border border-cyan-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                }`}
              >
                {/* Glowing animation effect for the New Chat Plus button */}
                {isGlowing && (
                  <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-60 blur-xs animate-pulse -z-10" />
                )}

                {/* Active side indicator pill */}
                {isActive && !isGlowing && (
                  <motion.div
                    layoutId="activeDockIndicator"
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-r-full bg-cyan-600 shadow-xs shadow-cyan-500/50"
                  />
                )}

                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? item.activeColor : item.color} ${isGlowing ? 'stroke-[2.5]' : ''}`} />
              </motion.button>

              {/* Responsive Floating Tooltip on Hover */}
              <div className="absolute left-14 sm:left-16 top-1/2 -translate-y-1/2 px-3 py-2 rounded-2xl bg-slate-900 text-white text-xs font-sans whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 shadow-2xl shadow-slate-900/30 flex items-center gap-2.5 border border-slate-700/60 z-50">
                <div className="flex flex-col">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    {item.label}
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-normal">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-300 font-sans">
                    {item.description}
                  </span>
                </div>
                {/* Tooltip left arrow */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700/60" />
              </div>
            </div>
          );
        })}
      </motion.nav>
    </aside>
  );
}
