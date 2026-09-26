import React, { useState } from 'react';
import { FolderLock, KeyRound, ShieldAlert, FileText, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import HoneyDataGridSection from './HoneyDataGridSection';

export default function CapabilitySandbox({ capabilityTtl }) {
  const [selectedFile, setSelectedFile] = useState('vfs://mem/session_01/agent_context.json');
  const [tokenDetails, setTokenDetails] = useState({
    agentUuid: 'agent-uuid-8f92a10b',
    perms: 'READ_ONLY | EXECUTE_WASM',
    uriTarget: 'vfs://mem/session_01/*',
    tExp: `${capabilityTtl}s remaining`,
    signature: '0x3f8a91b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f'
  });

  const vfsFiles = [
    { path: 'vfs://mem/session_01/agent_context.json', size: '2.4 KB', access: 'ALLOWED (τcap verified)' },
    { path: 'vfs://mem/session_01/scratchpad.txt', size: '512 B', access: 'ALLOWED (τcap verified)' },
    { path: 'vfs://mem/bio/valency_axioms.smt2', size: '1.8 KB', access: 'ALLOWED (Read)' },
    { path: 'C:/Windows/System32/cmd.exe', size: 'N/A', access: 'REVOKED (No Ambient Authority)' },
    { path: '/etc/shadow', size: 'N/A', access: 'TRAPPED (Host Filesystem Blocked)' }
  ];

  const wasiTraps = [
    { syscall: 'socket()', status: 'OMITTED FROM LINKER IMPORT TABLE', severity: 'CRITICAL' },
    { syscall: 'fork()', status: 'OMITTED FROM LINKER IMPORT TABLE', severity: 'CRITICAL' },
    { syscall: 'open() [Unconstrained]', status: 'REPLACED BY EPHEMERAL vfs:// MOUNT', severity: 'HIGH' },
    { syscall: 'execve()', status: 'REVOKED (Software Fault Isolation)', severity: 'CRITICAL' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderLock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-mono text-white">
              WASM SFI SANDBOX & CAPABILITY SECURITY INSPECTOR
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Revokes ambient host operating system privileges. Mounts strictly ephemeral in-memory virtual filesystems (vfs://) bound to Lumina-Auth Capability Tokens.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono text-xs flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Capability Token τcap: Active</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capability Token Formulation & Details */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            LUMINA-AUTH CAPABILITY TOKEN FORMULATION
          </h3>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
            <div className="text-amber-300 font-bold border-b border-slate-800 pb-2">
              Formula Equation (1):
            </div>
            <div className="bg-slate-900 p-3 rounded-lg text-center text-amber-300 font-bold text-xs">
              τ<sub>cap</sub> = Sign<sub>K<sub>kernel</sub></sub>( Agent<sub>UUID</sub> ∥ Perms ∥ URI<sub>target</sub> ∥ T<sub>exp</sub> )
            </div>
            <p className="text-[11px] text-slate-400">
              Enforces strict temporal bounds (T<sub>exp</sub> - T<sub>issue</sub> ≤ 30s). Invocations targeting unauthorized URIs trigger runtime WASI traps.
            </p>
          </div>

          {/* Token Fields Details */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 font-mono text-xs space-y-2.5">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Agent UUID:</span>
              <span className="text-cyan-300">{tokenDetails.agentUuid}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Permissions:</span>
              <span className="text-emerald-400">{tokenDetails.perms}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Target URI Bound:</span>
              <span className="text-amber-300">{tokenDetails.uriTarget}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>TTL Expiration Countdown:</span>
              <span className="text-rose-400 font-bold">{capabilityTtl} seconds remaining</span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 break-all">
              Kernel Signature: {tokenDetails.signature}
            </div>
          </div>
        </div>

        {/* Ephemeral VFS Explorer & WASI Trap Logs */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-cyan-400" />
              IN-MEMORY VIRTUAL FILESYSTEM (vfs://)
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {vfsFiles.map((file, idx) => {
                const isBlocked = file.access.includes('REVOKED') || file.access.includes('TRAPPED');
                return (
                  <div
                    key={idx}
                    onClick={() => !isBlocked && setSelectedFile(file.path)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isBlocked
                        ? 'bg-rose-950/30 border-rose-800/40 text-rose-300 opacity-80'
                        : selectedFile === file.path
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {isBlocked ? (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate">{file.path}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isBlocked ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {file.access}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

              {/* WASI Linker Trap Table */}
          <div className="pt-3 border-t border-slate-800/80">
            <h4 className="text-xs font-bold font-mono text-slate-300 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              WASI LINKER IMPORT TABLE SYSTEM CALL TRAPS
            </h4>

            <div className="space-y-1.5 font-mono text-[11px]">
              {wasiTraps.map((trap, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-400">
                  <span className="font-bold text-slate-200">{trap.syscall}</span>
                  <span className="text-rose-400 text-[10px]">{trap.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Connected Cypher-Shield Honey-Data Deception Grid Section */}
      <div className="pt-4 border-t border-slate-800">
        <HoneyDataGridSection />
      </div>
    </div>
  );
}
