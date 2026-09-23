import React, { useState, useEffect } from 'react';
import { Skull, AlertTriangle, ShieldX, RefreshCw, CheckCircle2, Lock, FileCode } from 'lucide-react';

export default function KillSwitchPipeline({ 
  systemState, 
  setSystemState, 
  killReason, 
  onResetSystem 
}) {
  const [purgeStep, setPurgeStep] = useState(0); // 0: Idle/Triggered, 1: SIGKILL, 2: 0x00 Zero-fill, 3: Zenith-Mesh SHA3-256
  const [memoryGrid, setMemoryGrid] = useState(
    Array.from({ length: 32 }, () => Math.floor(Math.random() * 255).toString(16).padStart(2, '0'))
  );
  const [forensicHash, setForensicHash] = useState('');

  const handleSimulatePurge = () => {
    setSystemState('KILLED');
    setPurgeStep(1);

    setTimeout(() => {
      setPurgeStep(2);
      // Zero-fill memory grid step by step
      let counter = 0;
      const interval = setInterval(() => {
        setMemoryGrid(prev => {
          const nextGrid = [...prev];
          for (let i = 0; i < 4; i++) {
            if (counter * 4 + i < nextGrid.length) {
              nextGrid[counter * 4 + i] = '00';
            }
          }
          return nextGrid;
        });
        counter++;
        if (counter >= 8) {
          clearInterval(interval);
          setPurgeStep(3);
          setForensicHash('0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e');
        }
      }, 120);
    }, 800);
  };

  useEffect(() => {
    if (systemState === 'KILLED' && purgeStep === 0) {
      handleSimulatePurge();
    }
  }, [systemState]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-800/60 bg-rose-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Skull className="w-6 h-6 text-rose-500 animate-pulse" />
            <h2 className="text-lg font-bold font-mono text-white">
              ATOMIC KILL-SWITCH EXECUTION PIPELINE (SECTION 3.6)
            </h2>
          </div>
          <p className="text-xs text-rose-300/80 font-mono">
            Uncatchable kernel termination upon WASM boundary trap or Z3 SMT logic invariant breach. Immediately zero-fills linear memory pages.
          </p>
        </div>

        <button
          onClick={handleSimulatePurge}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-900/50"
        >
          <AlertTriangle className="w-4 h-4" />
          ACTUATE ATOMIC SIGKILL & MEM_SET(0x00)
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step-by-Step 3-Phase Execution Pipeline */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
            <ShieldX className="w-4 h-4 text-cyan-400" />
            3-PHASE EMERGENCY SHUTDOWN SEQUENCE
          </h3>

          {/* Reason Alert */}
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 font-mono text-xs">
            <div className="font-bold flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Trap Reason / Triggering Vector:
            </div>
            <div className="text-[11px] text-rose-200">
              {killReason || 'WASI_TRAP: Host filesystem traversal violation detected in vfs:// Sandbox'}
            </div>
          </div>

          {/* 3 Steps */}
          <div className="space-y-3 font-mono text-xs">
            {/* Phase 1 */}
            <div className={`p-4 rounded-xl border transition-all ${
              purgeStep >= 1 ? 'bg-rose-950/50 border-rose-500/60 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>Phase 1: Signal Dispatch (SIGKILL Signal 9)</span>
                {purgeStep >= 1 && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Dispatches uncatchable SIGKILL to the guest WebAssembly thread pool. Immediate execution freeze.
              </p>
            </div>

            {/* Phase 2 */}
            <div className={`p-4 rounded-xl border transition-all ${
              purgeStep >= 2 ? 'bg-amber-950/50 border-amber-500/60 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>Phase 2: Linear Memory Purge [MEM_SET(0x00)]</span>
                {purgeStep >= 2 && <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />}
              </div>
              <div className="bg-slate-900 p-2 rounded text-[11px] mt-1.5 text-center text-amber-300">
                memset_s(WasmLinearMemory.ptr, 0, WasmLinearMemory.size)
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Allocated WebAssembly linear memory pages are overwritten via explicit zero-fill. Prevents heap residual secrets leak.
              </p>
            </div>

            {/* Phase 3 */}
            <div className={`p-4 rounded-xl border transition-all ${
              purgeStep >= 3 ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>Phase 3: Forensic Ledger Anchor (Zenith-Mesh)</span>
                {purgeStep >= 3 && <Lock className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 break-all">
                τviolation = SHA3-256(SessionID ∥ TrapCode ∥ Tepoch)
              </div>
            </div>
          </div>

          {/* Reset System Button */}
          {systemState === 'KILLED' && (
            <button
              onClick={() => {
                setPurgeStep(0);
                setMemoryGrid(Array.from({ length: 32 }, () => Math.floor(Math.random() * 255).toString(16).padStart(2, '0')));
                onResetSystem();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              RE-INITIALIZE WASMTIME MICROKERNEL (RESET SYSTEM)
            </button>
          )}
        </div>

        {/* Linear Memory Grid Visualizer */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            WASM LINEAR MEMORY PAGE GRID (0x00 PURGE)
          </h3>

          <p className="text-xs text-slate-400 font-sans">
            Real-time visual memory grid. When SIGKILL is issued, all heap byte offsets are zeroed out via explicit <code className="text-cyan-300">MEM_SET(0x00)</code>.
          </p>

          <div className="grid grid-cols-4 gap-2.5 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-center">
            {memoryGrid.map((byte, idx) => (
              <div
                key={idx}
                className={`py-2 px-1 rounded-lg border transition-all duration-300 font-bold ${
                  byte === '00'
                    ? 'bg-slate-900 border-slate-800 text-emerald-400 scale-95 opacity-60'
                    : 'bg-rose-950/60 border-rose-600 text-rose-200 animate-pulse'
                }`}
              >
                0x{byte}
              </div>
            ))}
          </div>

          {/* Forensic Hash Display */}
          {forensicHash && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] space-y-1">
              <div className="text-emerald-400 font-bold">Zenith-Mesh Forensic Receipt:</div>
              <div className="text-slate-400 break-all">{forensicHash}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
