import React, { useState } from 'react'
import {
  ShieldCheck,
  Lock,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  Layers,
  X,
  Cpu
} from 'lucide-react'
import { scansApi } from '../api/client'

interface ZkAuditComplianceModalProps {
  scanId: string
  merkleRoot: string
  isOpen: boolean
  onClose: () => void
}

export default function ZkAuditComplianceModal({
  scanId,
  merkleRoot,
  isOpen,
  onClose,
}: ZkAuditComplianceModalProps) {
  const [loading, setLoading] = useState(false)
  const [proofData, setProofData] = useState<any | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)
  const [showCircom, setShowCircom] = useState(false)

  if (!isOpen) return null

  const handleGenerateProof = async () => {
    setLoading(true)
    setVerifyResult(null)
    try {
      const res = await scansApi.generateZkComplianceProof(scanId)
      setProofData(res)
    } catch (e) {
      console.error('Failed to generate ZK compliance proof:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyProof = async () => {
    if (!proofData) return
    setVerifying(true)
    try {
      const res = await scansApi.verifyZkComplianceProof(scanId, proofData)
      setVerifyResult(res)
    } catch (e) {
      console.error('Failed to verify ZK proof:', e)
    } finally {
      setVerifying(false)
    }
  }

  const handleCopyProof = () => {
    if (!proofData) return
    navigator.clipboard.writeText(JSON.stringify(proofData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                ZK-Proof of Audit Compliance
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Groth16 / BN254
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Mathematically prove 100% policy compliance over the Merkle Root without exposing private tool execution arguments or target endpoints.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Top Banner Guarantees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[11px] font-mono mb-1">CANONICAL MERKLE ROOT</div>
              <div className="text-cyan-400 font-mono text-xs truncate" title={merkleRoot}>
                {merkleRoot}
              </div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[11px] font-mono mb-1">PRIVACY PRESERVATION</div>
              <div className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> 100% Zero-Knowledge
              </div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[11px] font-mono mb-1">CIRCUIT CONSTRAINT SYSTEM</div>
              <div className="text-purple-400 font-mono text-xs">
                R1CS 512 Constraints
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          {!proofData && (
            <div className="text-center py-8 space-y-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 p-6">
              <ShieldCheck className="w-12 h-12 text-cyan-400 mx-auto opacity-80" />
              <div>
                <h4 className="font-bold text-white text-base">Generate Verifiable Compliance Proof</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Synthesizes elliptic curve points (πA, πB, πC) certifying all agent events in this scan adhered to security boundaries.
                </p>
              </div>
              <button
                onClick={handleGenerateProof}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                {loading ? 'Synthesizing Witness & Groth16 Proof...' : 'Synthesize ZK-Proof (Groth16)'}
              </button>
            </div>
          )}

          {/* Proof Explorer */}
          {proofData && (
            <div className="space-y-6">
              {/* Proof Details Cards */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Groth16 Zero-Knowledge Proof Generated
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCircom(!showCircom)}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                    >
                      <FileCode className="w-3 h-3" /> {showCircom ? 'Hide Circuit' : 'View Circom'}
                    </button>
                    <button
                      onClick={handleCopyProof}
                      className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy Proof JSON'}
                    </button>
                  </div>
                </div>

                {showCircom && (
                  <pre className="p-3 bg-slate-900 rounded-lg text-[11px] text-slate-300 overflow-x-auto max-h-48 leading-relaxed border border-slate-800">
                    {proofData.circom_circuit_source}
                  </pre>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <div className="text-slate-500 text-[10px]">PUBLIC SIGNALS [0..2]</div>
                    <div className="text-cyan-300 text-[11px] truncate">
                      R_Merkle: {proofData.public_signals[0]}
                    </div>
                    <div className="text-purple-300 text-[11px] truncate">
                      Max_Sev: {proofData.public_signals[1]}
                    </div>
                    <div className="text-emerald-300 text-[11px] truncate">
                      Policy_Bit: {proofData.public_signals[2]} (CERTIFIED)
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[10px]">GROTH16 CURVE POINTS (πA, πC)</div>
                    <div className="text-slate-300 text-[11px] truncate">
                      πA: {proofData.proof.pi_a[0]}
                    </div>
                    <div className="text-slate-300 text-[11px] truncate">
                      πC: {proofData.proof.pi_c[0]}
                    </div>
                    <div className="text-slate-400 text-[10px] mt-1">
                      Proving Time: {proofData.proving_time_ms} ms
                    </div>
                  </div>
                </div>
              </div>

              {/* Public Verifier Action */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-white text-xs">Run Independent Bilinear Pairing Verification</h5>
                  <p className="text-[11px] text-slate-400">
                    Calculates e(πA, πB) == e(α, β) · e(Pub, γ) · e(πC, δ) against the canonical Merkle root.
                  </p>
                </div>
                <button
                  onClick={handleVerifyProof}
                  disabled={verifying}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0"
                >
                  {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {verifying ? 'Verifying...' : 'Verify Cryptographic Pairing'}
                </button>
              </div>

              {verifyResult && (
                <div className={`p-4 rounded-xl border font-mono text-xs ${verifyResult.valid ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'}`}>
                  <div className="font-bold text-sm flex items-center gap-2 mb-1">
                    {verifyResult.valid ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                    {verifyResult.valid ? 'AUDIT COMPLIANCE MATHEMATICALLY PROVED' : 'VERIFICATION FAILED'}
                  </div>
                  <div className="text-[11px] opacity-90">{verifyResult.pairing_check || verifyResult.reason}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Status: {verifyResult.audit_status}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
