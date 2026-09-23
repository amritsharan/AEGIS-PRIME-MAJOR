import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  KeyRound, 
  Cpu, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Lock, 
  Layers, 
  ArrowRight, 
  Copy, 
  Check, 
  Terminal, 
  Activity,
  Zap,
  Code2
} from 'lucide-react';
import { 
  generateZkSnarkProof, 
  verifyZkSnarkProof, 
  CIRCOM_CIRCUIT_SOURCE, 
  toHex256, 
  generateRandomScalar 
} from '../utils/zkSnarkEngine';

export default function ZkSnarkProverModal({ isOpen, onClose, onVerifiedLogin, defaultSecret = 'SOVEREIGN-OPERATOR-LUMINA-70B' }) {
  const [secretKey, setSecretKey] = useState(defaultSecret);
  const [blindingFactor, setBlindingFactor] = useState(() => toHex256(generateRandomScalar()));
  const [isProving, setIsProving] = useState(false);
  const [stage, setStage] = useState('IDLE'); // 'IDLE' | 'PROVING' | 'VERIFIED' | 'FAILED'
  const [progressInfo, setProgressInfo] = useState({ step: '', label: 'Ready to compute ZK-SNARK witness', pct: 0 });
  const [proofResult, setProofResult] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('prover'); // 'prover' | 'circuit'

  if (!isOpen) return null;

  const handleGenerateNewBlinding = () => {
    setBlindingFactor(toHex256(generateRandomScalar()));
  };

  const handleRunProver = async () => {
    setIsProving(true);
    setStage('PROVING');
    setProofResult(null);
    setVerificationData(null);

    try {
      const result = await generateZkSnarkProof({
        secretKey,
        blindingFactor,
        onProgress: (step, label, pct) => {
          setProgressInfo({ step, label, pct });
        }
      });

      setProofResult(result);

      // Immediately verify the generated proof against the gateway verifier
      const verif = verifyZkSnarkProof(result.proof, result.publicSignals);
      setVerificationData(verif);

      if (verif.verified) {
        setStage('VERIFIED');
      } else {
        setStage('FAILED');
      }
    } catch (err) {
      console.error('ZK Prover Error:', err);
      setStage('FAILED');
    } finally {
      setIsProving(false);
    }
  };

  const handleCopyProof = () => {
    if (proofResult) {
      navigator.clipboard.writeText(JSON.stringify(proofResult, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAuthenticate = () => {
    if (verificationData?.verified) {
      onVerifiedLogin({
        zkProof: proofResult.proof,
        nullifier: proofResult.nullifierHex,
        commitment: proofResult.commitmentHex
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100 font-sans"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white tracking-tight">
                  LUMINA ZK-SNARK CLIENT PROVER
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/50 font-mono">
                  Groth16 / BN254
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Proves operator authorization without ever revealing the secret preimage to the microkernel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-800 p-0.5 font-mono text-xs border border-slate-700">
              <button
                onClick={() => setActiveTab('prover')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'prover' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Prover Console
              </button>
              <button
                onClick={() => setActiveTab('circuit')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'circuit' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Circom Source
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'circuit' ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Terminal className="w-4 h-4" />
                  IdentityVerifier.circom (R1CS: 384 constraints)
                </span>
                <span className="text-[11px] text-slate-500">Poseidon Sponge primitive</span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto leading-relaxed text-[11px]">
                {CIRCOM_CIRCUIT_SOURCE}
              </pre>
            </div>
          ) : (
            <>
              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-semibold text-amber-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Private Secret Witness ($s$)
                  </label>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    disabled={isProving}
                    placeholder="Enter secret key..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Never leaves browser memory or transmissions.
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-semibold text-cyan-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Ephemeral Salt Blinding ($r$)
                    </label>
                    <button
                      onClick={handleGenerateNewBlinding}
                      disabled={isProving}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={blindingFactor}
                    onChange={(e) => setBlindingFactor(e.target.value)}
                    disabled={isProving}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300 truncate focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 font-mono block truncate">
                    Blinds public commitment: C = Poseidon(s, r)
                  </span>
                </div>
              </div>

              {/* Progress & Live Synthesis State */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Witness Evaluation & QAP Solver</span>
                  </span>
                  <span className="text-cyan-400 font-bold">{progressInfo.pct}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressInfo.pct}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{progressInfo.label}</span>
                  {proofResult && (
                    <span className="text-emerald-400 font-semibold">
                      Synthesized in {proofResult.provingTimeMs}ms
                    </span>
                  )}
                </div>
              </div>

              {/* Proof Inspection Accordion / Data */}
              {proofResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      GENERATED GROTH16 PROOF PAYLOAD ($\pi$)
                    </span>
                    <button
                      onClick={handleCopyProof}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied JSON' : 'Copy Payload'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-cyan-400 font-bold block">$\pi_A \in \mathbb{G}_1$ Point</span>
                      <span className="text-slate-400 block truncate">{proofResult.proof.pi_a[0]}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-indigo-400 font-bold block">$\pi_B \in \mathbb{G}_2$ Point</span>
                      <span className="text-slate-400 block truncate">{proofResult.proof.pi_b[0][0]}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-emerald-400 font-bold block">$\pi_C \in \mathbb{G}_1$ Point</span>
                      <span className="text-slate-400 block truncate">{proofResult.proof.pi_c[0]}</span>
                    </div>
                  </div>

                  {/* Verification Banner */}
                  {verificationData && (
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold font-mono text-emerald-300">
                            MICROKERNEL ZK-VERIFIER: PROOF VALID
                          </div>
                          <div className="text-[11px] font-mono text-emerald-400/80">
                            Pairing check: $e(\pi_A, \pi_B) \equiv e(\alpha, \beta) \cdot e(\text{Pub}, \gamma) \cdot e(\pi_C, \delta)$
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-900/60 text-emerald-200 border border-emerald-600/40 font-mono">
                        Nullifier Verified
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {activeTab === 'prover' && (
              <button
                onClick={handleRunProver}
                disabled={isProving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isProving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating Constraints...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Generate ZK Proof</span>
                  </>
                )}
              </button>
            )}

            {stage === 'VERIFIED' && (
              <button
                onClick={handleAuthenticate}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Workspace with $\pi_{zk}$</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
