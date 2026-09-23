import React, { useState, useEffect } from 'react';
import { PRESET_SCENARIOS } from '../data/presetScenarios';
import { 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  Flame, 
  Terminal, 
  Cpu, 
  BrainCircuit, 
  Key, 
  Zap 
} from 'lucide-react';

export default function WorkstationPane({ 
  systemState, 
  setSystemState, 
  capabilityTtl, 
  onTriggerKillSwitch 
}) {
  const [selectedPresetId, setSelectedPresetId] = useState('biochemical-safe');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedTokens, setStreamedTokens] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [smtStatus, setSmtStatus] = useState('unsat'); // 'unsat' (valid) | 'sat' (violation) | 'trap'
  const [gammaScore, setGammaScore] = useState(0.92);
  const [consensusAlert, setConsensusAlert] = useState(false);

  const activePreset = PRESET_SCENARIOS.find(p => p.id === selectedPresetId) || PRESET_SCENARIOS[0];

  // Reset stream when preset changes
  useEffect(() => {
    setStreamedTokens([]);
    setCurrentStepIndex(0);
    setSmtStatus('unsat');
    setGammaScore(0.95);
    setConsensusAlert(false);
  }, [selectedPresetId]);

  // Streaming logic
  useEffect(() => {
    let timer;
    if (isStreaming && currentStepIndex < activePreset.tokens.length) {
      timer = setTimeout(() => {
        const nextToken = activePreset.tokens[currentStepIndex];
        setStreamedTokens(prev => [...prev, nextToken]);
        setCurrentStepIndex(prev => prev + 1);

        // Update Gamma Score based on rolling average entropy
        const allEntropy = [...streamedTokens, nextToken].map(t => t.entropy);
        const avgEntropy = allEntropy.reduce((a, b) => a + b, 0) / allEntropy.length;
        const newGamma = Math.max(0, 1 - (avgEntropy / 2.0));
        setGammaScore(newGamma);

        if (newGamma < 0.70) {
          setConsensusAlert(true);
        }

        // Check if token triggers SMT violation or WASI trap
        if (nextToken.entropy > 1.4 && activePreset.expectedStatus === 'sat') {
          setSmtStatus('sat');
          setIsStreaming(false);
          onTriggerKillSwitch(activePreset.killSwitchReason || 'Z3 SMT Proof Invariant Violation: Degree(C) = 5');
        } else if (activePreset.expectedStatus === 'trap' && nextToken.text.includes('/etc/shadow')) {
          setSmtStatus('trap');
          setIsStreaming(false);
          onTriggerKillSwitch(activePreset.killSwitchReason || 'WASI_TRAP: Unauthorized path traversal /etc/shadow');
        }
      }, 350);
    } else if (currentStepIndex >= activePreset.tokens.length) {
      setIsStreaming(false);
    }
    return () => clearTimeout(timer);
  }, [isStreaming, currentStepIndex, activePreset, streamedTokens, onTriggerKillSwitch]);

  const handleStartStream = () => {
    if (systemState === 'KILLED') return;
    setStreamedTokens([]);
    setCurrentStepIndex(0);
    setSmtStatus('unsat');
    setConsensusAlert(false);
    setSystemState('STREAMING');
    setIsStreaming(true);
  };

  const handleStopStream = () => {
    setIsStreaming(false);
    setSystemState('SECURE');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* LEFT PANE: Ingress Prompt & Capability Control Console */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              INGRESS PROMPT CONSOLE
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
              vfs://
            </span>
          </div>

          {/* Preset Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 font-mono mb-1.5 block">
              Preset Execution Scenarios:
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-mono focus:border-cyan-400 focus:outline-none"
              disabled={isStreaming}
            >
              {PRESET_SCENARIOS.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5 font-sans leading-relaxed">
              {activePreset.description}
            </p>
          </div>

          {/* Capability Token & Domain Rules */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <div className="text-slate-400 text-[10px] mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-400" />
                Lumina-Auth Token τcap
              </div>
              <div className="text-amber-300 truncate font-semibold">
                Sign_Kkernel(Agent_01)
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                TTL: {capabilityTtl}s • {activePreset.capabilityRequired}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <div className="text-slate-400 text-[10px] mb-1 flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-emerald-400" />
                Active Domain Axioms
              </div>
              <div className="text-emerald-300 font-semibold truncate">
                {activePreset.domain}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Z3 SMT Solver Sidecar
              </div>
            </div>
          </div>

          {/* Prompt Area */}
          <div>
            <label className="text-xs font-semibold text-slate-300 font-mono mb-1.5 block">
              Prompt Context (Subject to Indirect Prompt Injection Check):
            </label>
            <textarea
              rows={3}
              value={customPrompt || activePreset.name}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-400 focus:outline-none resize-none"
              placeholder="Enter context or select preset..."
              disabled={isStreaming}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleStartStream}
              disabled={isStreaming || systemState === 'KILLED'}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              EXECUTE AGENT STREAM
            </button>

            <button
              onClick={handleStopStream}
              disabled={!isStreaming}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1 disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4" />
              Halt
            </button>

            <button
              onClick={() => onTriggerKillSwitch('MANUAL_OPERATOR_OVERRIDE: Atomic Kill-Switch Actuated')}
              className="py-2.5 px-3 rounded-xl bg-red-950/80 border border-red-800 hover:bg-red-900 text-red-300 font-mono text-xs flex items-center gap-1"
              title="Force Immediate OS SIGKILL & Memory Zero Fill"
            >
              <AlertOctagon className="w-4 h-4 text-red-400" />
              SIGKILL
            </button>
          </div>
        </div>

        {/* Operational Specs Card */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 text-xs font-mono space-y-2">
          <div className="text-slate-400 font-bold flex items-center justify-between">
            <span>MICROKERNEL ISOLATION SPECS</span>
            <span className="text-cyan-400">WASMTIME WASI</span>
          </div>
          <div className="text-slate-400 text-[11px] space-y-1">
            <p>• Ambient Host Privileges: <strong className="text-emerald-400">REMOVEO / ZERO</strong></p>
            <p>• Filesystem Access: <strong className="text-emerald-400">Ephemeral vfs:// Only</strong></p>
            <p>• Token Verification: <strong className="text-amber-400">τcap Signed (30s TTL)</strong></p>
            <p>• Hardware Paging: <strong className="text-violet-400">AirLLM Layer-Wise ≤ 4 GB</strong></p>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Dual-Stream Mixer Render & Live Entropy Heatmap */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col h-full min-h-[460px]">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-magenta-400" />
              <h2 className="text-sm font-bold font-mono text-white">
                DUAL-STREAM MIXER RENDER & EADC HEATMAP
              </h2>
            </div>

            {/* SMT Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Z3 Logic-Shield:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                smtStatus === 'unsat'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
              }`}>
                {smtStatus.toUpperCase()} ({smtStatus === 'unsat' ? 'Valid Proof' : 'Invariant Breach!'})
              </span>
            </div>
          </div>

          {/* Cognitive Confidence Index (Gamma Score Gauge) */}
          <div className="my-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Cognitive Confidence Index (Γ):
              </span>
              <span className={`font-bold ${
                gammaScore >= 0.8 ? 'text-emerald-400' : gammaScore >= 0.7 ? 'text-amber-400' : 'text-rose-400 font-extrabold'
              }`}>
                Γ = {gammaScore.toFixed(3)}
              </span>
            </div>

            {/* Gauge Bar */}
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  gammaScore >= 0.8 ? 'bg-emerald-400' : gammaScore >= 0.7 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, gammaScore * 100)}%` }}
              />
            </div>

            {/* Alert Banner when Gamma < 0.70 */}
            {consensusAlert && (
              <div className="mt-2.5 p-2 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[11px] font-mono flex items-center gap-2 animate-bounce">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>[Γ &lt; 0.70 ALERT] Epistemic uncertainty detected. Automated secondary model consensus initiated!</span>
              </div>
            )}
          </div>

          {/* Legend for Shannon Entropy Ht */}
          <div className="flex items-center gap-3 text-[11px] font-mono mb-3 text-slate-400 flex-wrap">
            <span>Entropy Legend (Ht):</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
              Ht ≤ 0.5 (Deterministic)
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
              0.5 &lt; Ht ≤ 1.0 (Divergence)
            </span>
            <span className="px-2 py-0.5 rounded bg-magenta-950/80 text-magenta-300 border border-magenta-500/60 shadow-sm shadow-magenta-500/30">
              Ht &gt; 1.0 (Magenta Heatmap)
            </span>
          </div>

          {/* Token Render Output Window */}
          <div className="flex-1 p-4 rounded-xl bg-slate-950 border border-slate-800/90 font-mono text-sm leading-relaxed overflow-y-auto max-h-[300px]">
            {streamedTokens.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs py-12">
                <Zap className="w-8 h-8 text-slate-700 mb-2" />
                <span>Ready to stream tokens... Select preset and click "EXECUTE AGENT STREAM"</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {streamedTokens.map((token, idx) => {
                  let badgeStyle = "entropy-low";
                  if (token.entropy > 1.0) badgeStyle = "entropy-high";
                  else if (token.entropy > 0.5) badgeStyle = "entropy-mid";

                  return (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-md text-xs font-semibold font-mono transition-all duration-200 ${badgeStyle}`}
                      title={`Token: "${token.text}" | Ht: ${token.entropy.toFixed(2)}`}
                    >
                      {token.text}
                      <sub className="ml-1 text-[9px] opacity-75">{token.entropy.toFixed(2)}</sub>
                    </span>
                  );
                })}
                {isStreaming && (
                  <span className="w-2.5 h-4 bg-cyan-400 animate-pulse rounded-sm inline-block ml-1" />
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Tokens Rendered: {streamedTokens.length} / {activePreset.tokens.length}</span>
            <span className="flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              AirLLM Dual-Stream Buffer Validated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
