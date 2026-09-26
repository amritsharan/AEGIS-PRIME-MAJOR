import React, { useState, useEffect } from 'react';
import { Macaroon } from '../utils/macaroonEngine';
import { Shield, Key, Plus, CheckCircle, AlertTriangle, Clock, Folder, Lock, RefreshCw, Copy, Check } from 'lucide-react';

export default function MacaroonInspector() {
  const [rootSecret, setRootSecret] = useState('aegis-microkernel-master-key-0x99a');
  const [tokenIdentifier, setTokenIdentifier] = useState('agent-session-wasm-701');
  const [currentMacaroon, setCurrentMacaroon] = useState(null);
  const [serializedToken, setSerializedToken] = useState('');
  const [copied, setCopied] = useState(false);

  // New caveat form state
  const [caveatType, setCaveatType] = useState('ttl');
  const [ttlSeconds, setTtlSeconds] = useState(60);
  const [pathPrefix, setPathPrefix] = useState('/sandbox/workspace/');
  const [permission, setPermission] = useState('READ_ONLY');

  // Verification test state
  const [testPath, setTestPath] = useState('/sandbox/workspace/agent_task.py');
  const [testOp, setTestOp] = useState('READ');
  const [verifyResult, setVerifyResult] = useState(null);

  // Initialize root token on mount
  useEffect(() => {
    handleMintRoot();
  }, []);

  const handleMintRoot = async () => {
    try {
      const m = await Macaroon.mint('synapse-os://microkernel-gate', tokenIdentifier, rootSecret);
      setCurrentMacaroon(m);
      setSerializedToken(m.serialize());
      setVerifyResult(null);
    } catch (err) {
      console.error('Failed to mint macaroon:', err);
    }
  };

  const handleAddCaveat = async () => {
    if (!currentMacaroon) return;
    let caveatText = '';
    if (caveatType === 'ttl') {
      const expireTime = Math.floor(Date.now() / 1000) + Number(ttlSeconds);
      caveatText = `time_before < ${expireTime}`;
    } else if (caveatType === 'path') {
      caveatText = `path_prefix = ${pathPrefix}`;
    } else if (caveatType === 'permission') {
      caveatText = `max_permission = ${permission}`;
    }

    const attenuated = await currentMacaroon.addCaveat(caveatText);
    setCurrentMacaroon(attenuated);
    setSerializedToken(attenuated.serialize());
    setVerifyResult(null);
  };

  const handleVerify = async () => {
    if (!currentMacaroon) return;
    const res = await currentMacaroon.verify(rootSecret, {
      targetPath: testPath,
      requestedOp: testOp
    });
    setVerifyResult(res);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(serializedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Dynamic Capability Attenuation (Macaroon Engine)
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  HMAC-SHA256 Chained
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sub-delegate capability tokens offline with first-party caveats without contacting the root microkernel.
              </p>
            </div>
          </div>
          <button
            onClick={handleMintRoot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-Mint Root
          </button>
        </div>
      </div>

      {/* Grid: Token Hierarchy & Attenuation Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Live Macaroon Chain */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Active Token Attenuation Chain
          </h4>

          {currentMacaroon && (
            <div className="space-y-3">
              {/* Root Identity */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs">
                <div className="text-slate-500 text-[10px]">ROOT IDENTIFIER</div>
                <div className="text-emerald-400 font-bold">{currentMacaroon.identifier}</div>
                <div className="text-slate-500 text-[10px] mt-1">LOCATION</div>
                <div className="text-slate-300">{currentMacaroon.location}</div>
              </div>

              {/* Caveats list */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Chained Caveats ({currentMacaroon.caveats.length})</span>
                  {currentMacaroon.caveats.length === 0 && (
                    <span className="text-[10px] text-amber-400">Unattenuated (Full Root Scope)</span>
                  )}
                </div>

                {currentMacaroon.caveats.map((c, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-cyan-500/20 p-2.5 rounded-lg flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-cyan-200">{c}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">σ_{idx + 1}</span>
                  </div>
                ))}
              </div>

              {/* Current Chained Signature */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs">
                <div className="text-slate-500 text-[10px]">CURRENT ATTENUATED SIGNATURE (σ_tail)</div>
                <div className="text-cyan-400 truncate text-[11px]">{currentMacaroon.signatureHex}</div>
              </div>

              {/* Serialized token */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Base64 Capability Token</span>
                  <button onClick={handleCopy} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]">
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <input
                  readOnly
                  value={serializedToken}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-400 truncate"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Attenuate Token & Verify Context */}
        <div className="space-y-6">
          {/* Attenuate Form */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Append Offline Caveat
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Caveat Restriction Type</label>
                <select
                  value={caveatType}
                  onChange={(e) => setCaveatType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                >
                  <option value="ttl">⏱️ Time-To-Live (TTL Expiration)</option>
                  <option value="path">📁 Virtual File Path Prefix</option>
                  <option value="permission">🔒 Operation Constraint</option>
                </select>
              </div>

              {caveatType === 'ttl' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valid Duration (Seconds from now)</label>
                  <input
                    type="number"
                    value={ttlSeconds}
                    onChange={(e) => setTtlSeconds(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
              )}

              {caveatType === 'path' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Allowed Sub-Path Prefix</label>
                  <input
                    type="text"
                    value={pathPrefix}
                    onChange={(e) => setPathPrefix(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
              )}

              {caveatType === 'permission' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max Permitted Operation</label>
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="READ_ONLY">READ_ONLY (Block Write / Execute / Delete)</option>
                    <option value="SANDBOX_EXECUTE">SANDBOX_EXECUTE (Wasm SFI Only)</option>
                  </select>
                </div>
              )}

              <button
                onClick={handleAddCaveat}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Attenuate & Sign Caveat
              </button>
            </div>
          </div>

          {/* Test Offline Context Verification */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Verify Capability Against Execution Context
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Resource Path</label>
                <input
                  type="text"
                  value={testPath}
                  onChange={(e) => setTestPath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Attempted Operation</label>
                <select
                  value={testOp}
                  onChange={(e) => setTestOp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                >
                  <option value="READ">READ</option>
                  <option value="WRITE">WRITE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="EXECUTE">EXECUTE</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleVerify}
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Run Microkernel Capability Check
            </button>

            {verifyResult && (
              <div className={`p-3 rounded-lg border font-mono text-xs ${verifyResult.valid ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'}`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {verifyResult.valid ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  {verifyResult.valid ? 'CAPABILITY PERMISSION GRANTED' : 'ACCESS DENIED / INSUFFICIENT CAPABILITY'}
                </div>
                {verifyResult.reason && <div className="text-[11px] opacity-90">{verifyResult.reason}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
