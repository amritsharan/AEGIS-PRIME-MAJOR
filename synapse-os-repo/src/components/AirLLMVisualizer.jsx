import React, { useState, useEffect } from 'react';
import { Layers, HardDrive, Cpu, ArrowRight, Play, Pause, RefreshCw, Zap } from 'lucide-react';

export default function AirLLMVisualizer({ vramUsage }) {
  const [currentLayer, setCurrentLayer] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const totalLayers = 80;

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentLayer(prev => (prev >= totalLayers ? 1 : prev + 1));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalLayers]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold font-mono text-white">
              AIRLLM LAYER-WISE SEQUENTIAL INFERENCE PIPELINE
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Sequential disk-to-VRAM model paging bounds active GPU allocation to ≤ 4.0 GB for 70B parameter models on edge hardware.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-violet-900/40"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause Paging' : 'Resume Paging'}
          </button>
        </div>
      </div>

      {/* Pipeline Visualizer Diagram (Figure 2 in Paper) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            LIVE SEQUENTIAL FORWARD PASS (LOOP i = 1...80)
          </h3>
          <span className="text-xs font-mono text-violet-300 bg-violet-950/80 px-3 py-1 rounded-full border border-violet-800/50">
            Active Layer: <strong className="text-white">L{currentLayer} / L{totalLayers}</strong>
          </span>
        </div>

        {/* Pipeline Diagram Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center relative">
          {/* Step 1: NVMe SSD Storage */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono space-y-2">
            <HardDrive className="w-8 h-8 text-blue-400 mx-auto" />
            <div className="text-xs font-bold text-slate-200">NVMe SSD Storage</div>
            <div className="text-[10px] text-slate-400">Sharded Model Weights</div>
            <div className="text-[11px] font-semibold text-blue-300 bg-blue-950/60 py-1 rounded border border-blue-900">
              ≈ 140 GB (70B Model)
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center text-slate-600">
            <ArrowRight className="w-6 h-6 text-violet-400 animate-pulse" />
            <span className="text-[10px] font-mono text-violet-300 mt-1">DMA Transfer</span>
          </div>

          {/* Step 2: Layer Streaming Loader */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono space-y-2 relative overflow-hidden">
            <RefreshCw className="w-8 h-8 text-violet-400 mx-auto animate-spin" />
            <div className="text-xs font-bold text-slate-200">Streaming Loader</div>
            <div className="text-[10px] text-slate-400">Async Pre-fetch Block</div>
            <div className="text-[11px] font-semibold text-violet-300 bg-violet-950/60 py-1 rounded border border-violet-900">
              Pre-fetch L<sub>{currentLayer < totalLayers ? currentLayer + 1 : 1}</sub>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center text-slate-600">
            <ArrowRight className="w-6 h-6 text-violet-400 animate-pulse" />
            <span className="text-[10px] font-mono text-violet-300 mt-1">Load L<sub>i</sub></span>
          </div>

          {/* Step 3: Consumer GPU VRAM */}
          <div className="p-4 rounded-xl bg-violet-950/50 border border-violet-500/40 text-center font-mono space-y-2 shadow-lg shadow-violet-900/30">
            <Cpu className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
            <div className="text-xs font-bold text-white">Consumer GPU VRAM</div>
            <div className="text-[10px] text-violet-200">Forward Pass Execution</div>
            <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 py-1 rounded border border-emerald-800">
              VRAM Peak: {vramUsage.toFixed(1)} GB ≤ 4 GB
            </div>
          </div>
        </div>

        {/* Layer Eviction Notification */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Immediate Layer Eviction: Flush VRAM Allocation for Layer L<sub>{currentLayer > 1 ? currentLayer - 1 : totalLayers}</sub></span>
          <span className="text-emerald-400 font-bold">KV-Cache &lt; 0.4 GB</span>
        </div>
      </div>

      {/* Mathematical Execution Formulation Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold font-mono text-cyan-400">
          MATHEMATICAL EXECUTION FORMULATION (SECTIONS 3.2.1)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-amber-300 font-bold">Standard Unsharded Inference:</div>
            <div className="bg-slate-900 p-2.5 rounded text-center text-slate-300">
              W<sub>total</sub> = ∑<sub>i=1</sub><sup>N</sup> W<sub>i</sub> &nbsp;&implies;&nbsp; VRAM ≥ 140 GB
            </div>
            <p className="text-[11px] text-slate-400">
              Requires multi-GPU enterprise nodes (&gt; $10,000).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold">Synapse-OS AirLLM Bounded Formulation:</div>
            <div className="bg-slate-900 p-2.5 rounded text-center text-emerald-300">
              VRAM<sub>peak</sub> = max<sub>i</sub> |W<sub>i</sub><sup>quant</sup>| + KV_Cache ≈ 3.7 GB
            </div>
            <p className="text-[11px] text-slate-400">
              Runs 70B parameter models natively on consumer GPU hardware.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
