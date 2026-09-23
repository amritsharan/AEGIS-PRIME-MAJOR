import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_MODELS } from '../data/modelsData';
import { 
  ShieldCheck, 
  Cpu, 
  Cloud, 
  X, 
  Check
} from 'lucide-react';

export default function ModelSelectorDrawer({ 
  isOpen, 
  onClose, 
  activeModelId, 
  onSelectModel,
  onOpenMixer
}) {
  const activeModel = ALL_MODELS.find(m => m.id === activeModelId) || ALL_MODELS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40"
          />

          {/* Sliding Model Selector Drawer */}
          <motion.aside
            initial={{ x: -380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -380, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed left-20 sm:left-24 top-4 bottom-4 w-84 sm:w-92 z-50 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-2xl shadow-slate-900/15 flex flex-col overflow-hidden text-slate-800"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-sm tracking-wider text-cyan-700 uppercase">
                  MODEL SELECTOR
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 font-semibold">
                  IDLE
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Lumina-Auth Security Card (Image 1 top card) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold font-mono text-xs flex items-center gap-1.5">
                      <span>Lumina-Auth</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-800 font-mono">ZK</span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-700 mt-0.5">
                      [01/0100 0011 1101 10]
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>OK</span>
                </div>
              </div>

              {/* Active Node Card (Image 1 second card) */}
              <div className="p-3.5 rounded-2xl bg-cyan-50/80 border border-cyan-300 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-800 font-bold">
                    ACTIVE NODE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200 font-semibold">
                    {activeModel.type}
                  </span>
                </div>
                <div className="font-bold font-mono text-slate-900 text-sm">
                  {activeModel.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                  <span>{activeModel.fullName}</span>
                  <span>•</span>
                  <span className="text-cyan-700 font-bold">{activeModel.latency}</span>
                </div>
              </div>

              {/* Section Divider: MODELS */}
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  MODELS
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* 8 Model List Cards */}
              <div className="space-y-2">
                {ALL_MODELS.map((model) => {
                  const isSelected = activeModelId === model.id;
                  const isLocal = model.isLocal;

                  return (
                    <motion.button
                      key={model.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        onSelectModel(model.id);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-cyan-50/90 border-cyan-400 text-cyan-950 shadow-sm ring-1 ring-cyan-400/40'
                          : 'bg-slate-50/80 border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          isSelected 
                            ? 'bg-cyan-100 text-cyan-700 border-cyan-300' 
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}>
                          {isLocal ? (
                            <Cpu className="w-4 h-4" />
                          ) : (
                            <Cloud className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{model.name}</span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-cyan-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mt-0.5">
                            <span className="font-semibold text-slate-700">{model.fullName}</span>
                            <span>•</span>
                            <span className="text-slate-400 uppercase">{model.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold border ${
                          isSelected 
                            ? 'bg-cyan-100 text-cyan-800 border-cyan-300' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {model.latency}
                        </span>

                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected 
                            ? 'border-cyan-600 bg-cyan-600 text-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Fusion Footer Link */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="text-[11px] font-mono text-slate-500">
                Want to combine 2 models?
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenMixer) onOpenMixer();
                }}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-mono font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-xs"
              >
                Launch Fusion Mixer ➔
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
