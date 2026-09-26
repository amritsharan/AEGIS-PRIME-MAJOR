import React, { useState } from 'react';
import { Sliders, ShieldCheck, Cpu, Cloud, Sparkles, Zap } from 'lucide-react';

export default function ConsensusMixer() {
  const [localWeight, setLocalWeight] = useState(0.75);
  const [cloudWeight, setCloudWeight] = useState(0.25);
  const [symbolicWeight, setSymbolicWeight] = useState(0.85);

  const localGamma = 0.94;
  const cloudGamma = 0.88;
  const symbolicGamma = 0.99;

  // Synthesized consensus score equation (12)
  const synthesizedScore = (
    (localWeight * localGamma) + 
    (cloudWeight * cloudGamma) + 
    (symbolicWeight * symbolicGamma)
  ) / (localWeight + cloudWeight + symbolicWeight);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold font-mono text-white">
              WEIGHTED CONSENSUS MIXER ENGINE
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Runs parallel inference across isolated local models and post-quantum encrypted cloud tunnels. Weights models by historical reliability & real-time cognitive confidence scores (Γk).
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300 font-mono text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Mixer Mode: Active</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consensus Formulation & Synthesis Equation */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            CONSENSUS MATHEMATICAL FORMULATION (SECTION 3.5.1)
          </h3>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
            <div className="text-amber-300 font-bold border-b border-slate-800 pb-2">
              Formula Equation (12):
            </div>
            <div className="bg-slate-900 p-3 rounded-lg text-center text-cyan-300 font-bold text-sm">
              Y* = Synthesize( ∑<sub>k=1</sub><sup>K</sup> w<sub>k</sub> · Γ<sub>k</sub> · M<sub>k</sub>(x) )
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Local sovereign models receive higher weightings (w<sub>local</sub> &gt; w<sub>cloud</sub>) for sensitive inputs, while high-reasoning cloud models are weighted for complex code synthesis.
            </p>
          </div>

          {/* Synthesized Output Result Gauge */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono space-y-2">
            <div className="text-slate-400 text-xs">Synthesized Consensus Confidence Score (Y*):</div>
            <div className="text-2xl font-bold text-emerald-400">
              Y* = {(synthesizedScore * 100).toFixed(1)}%
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${synthesizedScore * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interactive Model Sliders */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            ENSEMBLE MODEL WEIGHT CONTROLS (wk)
          </h3>

          <div className="space-y-4 font-mono text-xs">
            {/* Model 1: Local Sovereign Model */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-bold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  M1: Local Sovereign Model (AirLLM 70B)
                </span>
                <span className="text-emerald-400 font-bold">w1 = {localWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={localWeight}
                onChange={(e) => setLocalWeight(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Cognitive Confidence: Γ1 = {localGamma}</span>
                <span>AirLLM WASM SFI</span>
              </div>
            </div>

            {/* Model 2: Post-Quantum Encrypted Cloud Model */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-bold flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  M2: Post-Quantum Cloud Tunnel Model
                </span>
                <span className="text-blue-400 font-bold">w2 = {cloudWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={cloudWeight}
                onChange={(e) => setCloudWeight(parseFloat(e.target.value))}
                className="w-full accent-blue-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Cognitive Confidence: Γ2 = {cloudGamma}</span>
                <span>Kyber Post-Quantum Encryption</span>
              </div>
            </div>

            {/* Model 3: DeepReasoning Symbolic Sidecar */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  M3: DeepReasoning Symbolic Sidecar
                </span>
                <span className="text-violet-400 font-bold">w3 = {symbolicWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={symbolicWeight}
                onChange={(e) => setSymbolicWeight(parseFloat(e.target.value))}
                className="w-full accent-violet-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Cognitive Confidence: Γ3 = {symbolicGamma}</span>
                <span>Z3 SMT Invariant Verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
