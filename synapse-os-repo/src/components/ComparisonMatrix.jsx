import React, { useState } from 'react';
import { TECH_MATRIX, ARCH_COMPARISON } from '../data/matrixData';
import { Table2, Search, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ComparisonMatrix({ onBack }) {
  const [activeMatrixTab, setActiveMatrixTab] = useState('arch'); // 'arch' | 'tech'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArch = ARCH_COMPARISON.filter(item => 
    item.vector.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.synapse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTech = TECH_MATRIX.filter(item =>
    item.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.selectedTech.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto pl-16 sm:pl-22 p-4 sm:p-8 bg-slate-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <Table2 className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-mono text-slate-900">
                SYNAPSE-OS ARCHITECTURAL COMPARISON & TECH STACK
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Formal technical matrix contrasting Synapse-OS Option 7 against LangGraph, CrewAI, Ollama, and LM Studio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Selector Buttons */}
            <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 flex items-center font-mono text-xs">
              <button
                onClick={() => setActiveMatrixTab('arch')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeMatrixTab === 'arch'
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Table 2: Arch Comparison
              </button>
              <button
                onClick={() => setActiveMatrixTab('tech')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeMatrixTab === 'tech'
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Table 1: Tech Matrix
              </button>
            </div>
          </div>
        </div>

        {/* Search Input Filter */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter matrix rows or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none w-full placeholder-slate-400 font-sans"
          />
        </div>

        {/* TABLE 2: ARCHITECTURAL COMPARISON */}
        {activeMatrixTab === 'arch' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-bold">Comparison Vector</th>
                    <th className="p-4 font-bold text-cyan-700 bg-cyan-50/50">Synapse-OS (Option 7)</th>
                    <th className="p-4 font-bold">LangGraph / AutoGen</th>
                    <th className="p-4 font-bold">CrewAI</th>
                    <th className="p-4 font-bold">Ollama / LM Studio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArch.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold font-mono text-slate-900">{row.vector}</td>
                      <td className="p-4 text-cyan-900 font-medium bg-cyan-50/30">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                          <span>{row.synapse}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{row.langgraph}</td>
                      <td className="p-4 text-slate-600">{row.crewai}</td>
                      <td className="p-4 text-slate-600">{row.ollama}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLE 1: TECH MATRIX */}
        {activeMatrixTab === 'tech' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-bold">Subsystem Component</th>
                    <th className="p-4 font-bold text-blue-700 bg-blue-50/50">Selected Technology</th>
                    <th className="p-4 font-bold">Evaluated Alternatives</th>
                    <th className="p-4 font-bold">Architectural Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTech.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold font-mono text-slate-900">{row.component}</td>
                      <td className="p-4 font-mono font-semibold text-blue-900 bg-blue-50/30">
                        {row.selectedTech}
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">{row.alternatives}</td>
                      <td className="p-4 text-slate-600">{row.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
