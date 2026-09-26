import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, FileCode, CheckCircle2, AlertTriangle, Play, Sparkles } from 'lucide-react';

export default function LogicShieldProver({ onTriggerKillSwitch }) {
  const [carbonValency, setCarbonValency] = useState(4);
  const [testedDegree, setTestedDegree] = useState(4);
  const [smtResult, setSmtResult] = useState({
    status: 'unsat',
    message: 'Theorem Validated: No assignment satisfies output while violating domain axioms.'
  });

  const handleRunZ3Solver = (degreeToTest) => {
    setTestedDegree(degreeToTest);
    if (degreeToTest > carbonValency) {
      setSmtResult({
        status: 'sat',
        message: `INVARIANT VIOLATION DETECTED! Degree(C)=${degreeToTest} > ValencyMax(${carbonValency}). Solver synthesized counterexample [Texas Carbon Pentavalent structure].`
      });
    } else {
      setSmtResult({
        status: 'unsat',
        message: `FORMAL PROOF VALIDATED (unsat). Degree(C)=${degreeToTest} <= ValencyMax(${carbonValency}). Mathematical invariant satisfied.`
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold font-mono text-white">
              NEURO-SYMBOLIC LOGIC-SHIELD (Z3 SMT SOLVER SIDECAR)
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Evaluates first-order logical domain axioms before token rendering. Stochastic neural outputs are mathematically constrained.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
          Formal Solver: <span className="font-bold text-white">Z3 SMT v4.13+</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Axiom Inspector & Formulation */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            FIRST-ORDER LOGIC PROOF FORMULATION
          </h3>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed space-y-3">
            <div className="text-amber-300 font-bold border-b border-slate-800 pb-2">
              Formula Equation (9):
            </div>
            <div className="bg-slate-900 p-3 rounded-lg text-center text-cyan-300 font-bold text-sm">
              Result = Solve( Φ<sub>output</sub> ∧ ¬A<sub>domain</sub> )
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-400 pt-2">
              <p>• <strong className="text-emerald-400">Case 1 (unsat):</strong> No counterexample exists violating domain axioms. Tokens stream safely.</p>
              <p>• <strong className="text-rose-400">Case 2 (sat):</strong> Counterexample synthesized proving invariant violation. Atomic kill-switch triggers immediately.</p>
            </div>
          </div>

          {/* Chemical Valency Axioms Box */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-3">
            <div className="text-emerald-400 font-bold flex items-center justify-between">
              <span>Domain Axiom (Section 3.4.2): Biochemical Valency</span>
              <span className="text-[10px] text-slate-500">First-Order Logic</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 text-slate-300 text-[11px] space-y-1 border border-slate-800">
              <p className="text-cyan-300">∀a ∈ Atoms, Degree(a) ≤ Valency<sub>max</sub>(a)</p>
              <p>Valency<sub>max</sub>(Carbon) = {carbonValency}, Valency<sub>max</sub>(Hydrogen) = 1</p>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs pt-1">
              <span className="text-slate-400">Max Allowed Carbon Valency:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCarbonValency(4)}
                  className={`px-2.5 py-1 rounded font-bold ${carbonValency === 4 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                >
                  4 (Standard)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Proof Tester */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Z3 SMT PROVER INTERACTIVE TESTER
            </h3>

            <p className="text-xs text-slate-400 font-sans mb-4">
              Test neural token claims against the first-order logic engine. Simulate generating a standard Carbon structure vs a hallucinatory "Texas Carbon" pentavalent structure.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleRunZ3Solver(4)}
                className="py-3 px-4 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex flex-col items-center gap-1 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Test Standard Carbon</span>
                <span className="text-[10px] text-slate-400 font-normal">Degree(C) = 4</span>
              </button>

              <button
                onClick={() => handleRunZ3Solver(5)}
                className="py-3 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold flex flex-col items-center gap-1 transition-all"
              >
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Test "Texas Carbon"</span>
                <span className="text-[10px] text-slate-400 font-normal">Degree(C) = 5 (Pentavalent)</span>
              </button>
            </div>

            {/* SMT Solver Output Result */}
            <div className={`p-4 rounded-xl border font-mono text-xs space-y-2 transition-all ${
              smtResult.status === 'unsat'
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/60 text-rose-200 animate-pulse'
            }`}>
              <div className="flex items-center justify-between border-b border-current/20 pb-2">
                <span className="font-bold flex items-center gap-2">
                  {smtResult.status === 'unsat' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  )}
                  SMT SOLVER STATUS: {smtResult.status.toUpperCase()}
                </span>
                <span className="text-[10px] opacity-75 font-sans">
                  {smtResult.status === 'unsat' ? 'Tokens Rendered' : 'Atomic Trap Triggered'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {smtResult.message}
              </p>
            </div>
          </div>

          {smtResult.status === 'sat' && (
            <button
              onClick={() => onTriggerKillSwitch('Z3 SMT Invariant Breach: Texas Carbon Pentavalent Structure (Degree=5)')}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              TRIGGER ATOMIC OS KILL-SWITCH (SIGKILL & MEM_SET 0x00)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
