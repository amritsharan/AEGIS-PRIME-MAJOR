import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_MODELS } from '../data/modelsData';
import { 
  GitMerge, 
  X, 
  Cpu, 
  Cloud, 
  Check, 
  AlertTriangle, 
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function SynapseFusionModal({ 
  isOpen, 
  onClose, 
  selectedPair = ['llama-3-local', 'gpt-4o-cloud'], 
  onApplyPair 
}) {
  const [currentSelected, setCurrentSelected] = useState(selectedPair);

  useEffect(() => {
    if (selectedPair && selectedPair.length === 2) {
      setCurrentSelected(selectedPair);
    }
  }, [selectedPair]);

  if (!isOpen) return null;

  const handleToggle = (id) => {
    if (currentSelected.includes(id)) {
      if (currentSelected.length > 1) {
        setCurrentSelected(currentSelected.filter(item => item !== id));
      }
    } else {
      if (currentSelected.length < 2) {
        setCurrentSelected([...currentSelected, id]);
      } else {
        // Replace second model if 2 are already selected
        setCurrentSelected([currentSelected[0], id]);
      }
    }
  };

  const handleSave = () => {
    if (currentSelected.length === 2) {
      onApplyPair(currentSelected);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col text-slate-800"
        >
          {/* Header matching Image 2 */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-50 text-pink-600 border border-pink-200">
                <GitMerge className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold font-mono tracking-wide text-slate-900 flex items-center gap-2">
                  SYNAPSE FUSION MIXER
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Multi-Model Consensus Synthesis Engine
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Instruction & Selection Counter */}
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-pink-700 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-pink-600" />
              SELECT EXACTLY 2 MODELS TO FUSE
            </span>

            <span className={`text-xs font-mono px-3 py-1 rounded-full font-bold border ${
              currentSelected.length === 2 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              {currentSelected.length} / 2 selected
            </span>
          </div>

          {/* 8 Model Grid in 2 Columns matching Image 2 */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[58vh] overflow-y-auto">
            {ALL_MODELS.map((model) => {
              const isSelected = currentSelected.includes(model.id);

              return (
                <motion.div
                  key={model.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleToggle(model.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-50/90 border-cyan-400 ring-2 ring-cyan-400/30 text-cyan-950 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox square matching Image 2 */}
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-600 text-white'
                        : 'bg-white border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Icon */}
                    <div className={`p-1.5 rounded-lg ${
                      model.isLocal 
                        ? 'bg-cyan-100 text-cyan-700' 
                        : 'bg-violet-100 text-violet-700'
                    }`}>
                      {model.isLocal ? <Cpu className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {model.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {model.fullName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      {model.badge}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-800 font-semibold">
                      {model.latency}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Warning Banner matching Image 2 */}
          <div className="px-6 py-3 bg-amber-50/90 border-t border-b border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900 font-sans">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              No external API keys configured – will use sovereign local demo synthesis. Add keys via the Settings icon in TopNav.
            </span>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 bg-slate-50/90 flex items-center justify-between">
            <div className="text-xs font-mono text-slate-500">
              {currentSelected.length === 2 ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Ready to fuse 2 selected models
                </span>
              ) : (
                <span className="text-amber-700">Please select exactly 2 models</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={currentSelected.length !== 2}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs transition-all shadow-xs disabled:opacity-40"
              >
                Apply Fusion Pair
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
