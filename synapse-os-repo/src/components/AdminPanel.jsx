import React, { useState } from 'react';
import ConsensusMixer from './ConsensusMixer';
import KillSwitchPipeline from './KillSwitchPipeline';
import CapabilitySandbox from './CapabilitySandbox';
import HoneyDataGridSection from './HoneyDataGridSection';
import { 
  ShieldCheck, 
  Lock, 
  Sliders, 
  Skull, 
  ArrowLeft,
  Radio
} from 'lucide-react';

export default function AdminPanel({ onSwitchToUserUI }) {
  const [adminTab, setAdminTab] = useState('encryption-zk'); // 'encryption-zk' | 'honey-grid' | 'mixer-tech' | 'kill-switch'
  const zkProof = {
    protocol: 'zk-SNARK (Groth16 / PLONK)',
    curve: 'BLS12-381',
    hash: '0x7a8f9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    status: 'VALID'
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans pl-16 sm:pl-22">
      {/* Admin Panel Header */}
      <header className="bg-white/90 backdrop-blur-xl px-6 py-4 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToUserUI}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-2 text-xs font-mono font-medium border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-600" />
            <span>Back to User Workspace</span>
          </button>

          <div>
            <h1 className="text-sm sm:text-base font-bold font-mono text-slate-900 flex items-center gap-2">
              ADMINISTRATIVE TECHNICAL TRANSPARENCY PANEL
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-100 text-violet-800 border border-violet-200 font-mono">
                SYSTEM MECHANICS & ENCRYPTION
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-mono hidden sm:block">
              Backend logic visualization: Zero-Knowledge ZK proofs, Cypher Honey-Data Grid, WASM SFI sandboxing & consensus
            </p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 font-mono text-xs">
          <button
            onClick={() => setAdminTab('encryption-zk')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              adminTab === 'encryption-zk' 
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Encryption & ZK</span>
          </button>

          <button
            onClick={() => setAdminTab('honey-grid')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              adminTab === 'honey-grid' 
                ? 'bg-white text-cyan-700 font-bold shadow-xs border border-cyan-200' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            <span>Honey-Data Grid</span>
          </button>

          <button
            onClick={() => setAdminTab('mixer-tech')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              adminTab === 'mixer-tech' 
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Model Mixer Tech</span>
          </button>

          <button
            onClick={() => setAdminTab('kill-switch')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              adminTab === 'kill-switch' 
                ? 'bg-white text-rose-700 font-bold shadow-xs border border-rose-200' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-rose-600" />
            <span>Kill-Switch Purge</span>
          </button>
        </div>
      </header>

      {/* Main Admin View Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* TAB 1: ZK Algorithm & Encryption Processes */}
        {adminTab === 'encryption-zk' && (
          <div className="space-y-6">
            {/* ZK Proof Visualizer Banner */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-mono text-slate-900">
                    ZERO-KNOWLEDGE (ZK) ALGORITHM PROOF GENERATOR & ENCRYPTION
                  </h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
                  ZK-SNARK ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-slate-500 font-semibold">Proof Protocol:</div>
                  <div className="text-cyan-700 font-bold text-sm">{zkProof.protocol}</div>
                  <div className="text-[10px] text-slate-400">Elliptic Curve: {zkProof.curve}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-slate-500 font-semibold">Post-Quantum Encryption:</div>
                  <div className="text-blue-700 font-bold text-sm">CRYSTALS-Kyber 1024</div>
                  <div className="text-[10px] text-slate-400">Tunnel: Post-Quantum Encrypted</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-slate-500 font-semibold">Verification Status:</div>
                  <div className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    PROVED & VALIDATED
                  </div>
                  <div className="text-[10px] text-slate-400">Zero Leakage Guaranteed</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 break-all">
                <span className="text-amber-700 font-bold">ZK Proof Commitment Hash: </span>
                {zkProof.hash}
              </div>
            </div>

            {/* WASM Sandbox Inspection Component */}
            <CapabilitySandbox capabilityTtl={28} />
          </div>
        )}

        {/* TAB: Connected Cypher-Shield Honey-Data Grid */}
        {adminTab === 'honey-grid' && (
          <HoneyDataGridSection />
        )}

        {/* TAB 2: Model Mixer Technical Breakdown (Option 5) */}
        {adminTab === 'mixer-tech' && (
          <ConsensusMixer />
        )}

        {/* TAB 3: Atomic OS Kill-Switch Purge */}
        {adminTab === 'kill-switch' && (
          <KillSwitchPipeline
            systemState="SECURE"
            setSystemState={() => {}}
            killReason="ADMIN_TEST_ACTUATION: Manual Emergency Purge"
            onResetSystem={() => {}}
          />
        )}
      </main>
    </div>
  );
}
