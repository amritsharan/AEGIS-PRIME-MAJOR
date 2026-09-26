import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FORGE_TEMPLATES, ALL_MODELS } from '../data/modelsData';
import { 
  buildAppWithGateway, 
  detectLanguage,
  pingGateway
} from '../services/omniRouteForge';
import { exportForgeProject } from '../utils/forgeExporter';
import { executeAegisPipeline } from '../lib/aegisDispatcher';
import { 
  Hammer, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Server, 
  Bot, 
  Coins, 
  Network, 
  Code, 
  Lock, 
  Layers, 
  Copy, 
  Check, 
  Terminal, 
  FileCode, 
  Download, 
  RefreshCw,
  Cpu,
  FolderArchive,
  ArrowDownToLine,
  Zap,
  Activity,
  Play,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function SynapseForge({ onClose, activeModelId = 'synapse-os-free' }) {
  // Ensure default model is SYNAPSE-OS FREE
  const [selectedModelId, setSelectedModelId] = useState(
    ALL_MODELS.some(m => m.id === 'synapse-os-free') ? 'synapse-os-free' : (activeModelId || ALL_MODELS[0].id)
  );
  const activeModel = ALL_MODELS.find(m => m.id === selectedModelId) || ALL_MODELS[0];

  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStatusText, setBuildStatusText] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'guide'
  const [builtProject, setBuiltProject] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [gatewayLive, setGatewayLive] = useState(true);
  const [buildDuration, setBuildDuration] = useState(0);

  const logsEndRef = useRef(null);

  // Check gateway health on mount
  useEffect(() => {
    pingGateway().then(live => setGatewayLive(live));
  }, []);

  // Scroll logs to bottom during building
  useEffect(() => {
    if (isBuilding && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, isBuilding]);

  // Timer while building
  useEffect(() => {
    let timer;
    if (isBuilding) {
      setBuildDuration(0);
      timer = setInterval(() => {
        setBuildDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBuilding]);

  const getTemplateIcon = (iconName) => {
    switch (iconName) {
      case 'ShieldCheck': return ShieldCheck;
      case 'Server': return Server;
      case 'Bot': return Bot;
      case 'Coins': return Coins;
      case 'Network': return Network;
      case 'Code': return Code;
      case 'Lock': return Lock;
      default: return Layers;
    }
  };

  const handleForge = async (template = null) => {
    const activeTmpl = template || selectedTemplate || FORGE_TEMPLATES[0];
    const targetPrompt = prompt.trim() || activeTmpl.prompt;
    const comboModel = activeModel.name;

    setIsBuilding(true);
    setBuiltProject(null);
    setBuildProgress(15);
    setBuildStatusText(`Connecting to ${comboModel} Gateway...`);
    setTerminalLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 SYNAPSE FORGE v2.0 initiated`,
      `[${new Date().toLocaleTimeString()}] 🧠 Model: ${comboModel} (${activeModel.fullName})`,
      `[${new Date().toLocaleTimeString()}] 🌐 Gateway Pipeline: Active (${comboModel})`
    ]);

    try {
      setBuildProgress(25);
      setBuildStatusText(`Executing 4-Stage AEGIS Pipeline with ${comboModel}...`);

      const pipelineResult = await executeAegisPipeline({
        prompt: targetPrompt,
        mode: 'forge',
        comboModel: comboModel,
        onStageTransition: (stage, stageName, detail) => {
          if (stage === 1) setBuildProgress(30);
          if (stage === 2) setBuildProgress(50);
          if (stage === 3) setBuildProgress(75);
          if (stage === 4) setBuildProgress(92);
          setBuildStatusText(`[Stage ${stage}/4] ${stageName} (${detail.status})`);
        },
        onLog: (logText) => {
          setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logText}`]);
        }
      });

      setBuildProgress(95);
      setBuildStatusText('Applying zero-trust invariants & packaging bundle...');

      const forgeData = pipelineResult.stage3_execution;
      const parsedFiles = (forgeData.files || []).map((f) => ({
        path: f.path || f.name,
        name: f.path || f.name,
        content: f.content || f.code,
        code: f.content || f.code,
        lang: detectLanguage(f.path || f.name)
      }));

      setBuiltProject({
        projectName: forgeData.projectName || 'synapse-app',
        title: forgeData.projectName || 'synapse-app',
        runScript: forgeData.runScript || 'npm install && npm run dev',
        files: parsedFiles,
        terminalLogs: forgeData.terminalLogs || []
      });

      setBuildProgress(100);
      setActiveFileIndex(0);
    } catch (err) {
      console.warn('[SynapseForge] Pipeline execution warning, fallback engaged:', err.message);
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚠️ Notice: ${err.message}. Engaging autonomous fallback...`
      ]);

      const fallback = await buildAppWithGateway({
        prompt: targetPrompt,
        model: comboModel,
        onProgress: (pct, msg) => {
          setBuildProgress(pct);
          setBuildStatusText(msg);
        },
        onLog: (logText) => {
          setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logText}`]);
        }
      });

      setBuiltProject({
        projectName: fallback.title,
        title: fallback.title,
        runScript: 'npm install && npm run dev',
        files: fallback.files.map(f => ({
          path: f.name,
          name: f.name,
          content: f.code,
          code: f.code,
          lang: f.lang
        })),
        terminalLogs: fallback.terminalLogs || []
      });
      setActiveFileIndex(0);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadZip = async () => {
    if (!builtProject) return;
    setIsZipping(true);
    try {
      const filesForExport = builtProject.files.map(f => ({
        path: f.path || f.name,
        content: f.content || f.code
      }));
      await exportForgeProject(
        builtProject.projectName || builtProject.title || 'synapse-project',
        filesForExport,
        builtProject.runScript || 'npm install && npm run dev'
      );
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadActiveFile = () => {
    if (!builtProject || !builtProject.files[activeFileIndex]) return;
    const activeFile = builtProject.files[activeFileIndex];
    const blob = new Blob([activeFile.content || activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const parts = (activeFile.path || activeFile.name).split('/');
    a.download = parts[parts.length - 1] || 'download.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto pl-16 sm:pl-22 p-4 sm:p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-mono tracking-tight text-slate-900">
                  SYNAPSE FORGE
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  READY
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                AGENTIC BUILD STUDIO // v2.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Model Selector */}
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {ALL_MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>CLOSE FORGE</span>
              </button>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <div className="py-6 sm:py-8 text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[11px] font-mono font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>AGENTIC BUILD MODE // ACTIVE</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What would you like to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">build</span> today?
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Describe your project – Synapse Forge will scaffold, generate, and build it using{' '}
            <strong className="text-amber-600 font-mono">{activeModel.name}</strong>.
          </p>
        </div>

        {/* Main Prompt Bar */}
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3.5 shadow-md shadow-slate-900/5 focus-within:border-amber-400 focus-within:ring-3 focus-within:ring-amber-400/10 transition-all">
            <Hammer className="w-5 h-5 text-amber-500 shrink-0 ml-1" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isBuilding && handleForge()}
              placeholder="e.g. Build me a modern portfolio with hero, about, skills, and projects..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-sans"
              disabled={isBuilding}
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleForge()}
              disabled={isBuilding}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold font-mono text-xs flex items-center gap-2 shadow-md shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isBuilding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>SCAFFOLDING...</span>
                </>
              ) : (
                <>
                  <Hammer className="w-4 h-4" />
                  <span>FORGE</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="flex flex-wrap items-center justify-between px-2 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span>Model:</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                {activeModel.name}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">{activeModel.fullName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeModel.name} Core · Online</span>
            </div>
          </div>
        </div>

        {/* Quick Start Templates Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>QUICK START TEMPLATES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {FORGE_TEMPLATES.map((tmpl) => {
              const Icon = getTemplateIcon(tmpl.icon);
              const isSelected = selectedTemplate?.id === tmpl.id;

              return (
                <motion.button
                  key={tmpl.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isBuilding}
                  onClick={() => {
                    setSelectedTemplate(tmpl);
                    setPrompt(tmpl.prompt);
                    handleForge(tmpl);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-32 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="p-2 rounded-xl"
                      style={{ backgroundColor: `${tmpl.color}15`, color: tmpl.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {tmpl.category}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-slate-900">{tmpl.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">{tmpl.desc}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LIVE ENGAGING BUILD ANIMATION OVERLAY (Active during isBuilding)          */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isBuilding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -20 }}
              transition={{ duration: 0.35 }}
              className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden relative"
            >
              {/* Glowing Background Radial Effects */}
              <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold tracking-tight text-white">
                        {activeModel.name} AGENTIC CORE ACTIVE
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40">
                        {activeModel.name} // ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {buildStatusText || 'Synthesizing application architecture...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>00:{buildDuration.toString().padStart(2, '0')}s</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>PQC Protected</span>
                  </div>
                </div>
              </div>

              {/* Holographic Center Ring + Progress Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                
                {/* Left: Cybernetic Rotating Rings */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    {/* Outer slow rotating ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40"
                    />

                    {/* Middle counter-rotating ring */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      className="absolute inset-3 rounded-full border-2 border-dotted border-cyan-400/50"
                    />

                    {/* Inner glowing core */}
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/30 to-orange-600/30 border border-amber-400/60 shadow-lg shadow-amber-500/20 flex flex-col items-center justify-center"
                    >
                      <Hammer className="w-6 h-6 text-amber-300 animate-bounce" />
                      <span className="text-[11px] font-mono font-bold text-white mt-0.5">
                        {buildProgress}%
                      </span>
                    </motion.div>
                  </div>

                  <div className="mt-4 text-center">
                    <div className="text-xs font-mono font-bold text-slate-200">{activeModel.name} ENGINE</div>
                    <div className="text-[11px] font-mono text-amber-400/90 mt-0.5">Scaffolding files via {activeModel.name}...</div>
                  </div>
                </div>

                {/* Right: Milestone Pipeline & Progress Bar */}
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* Visual Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Scaffolding Pipeline Progress</span>
                      <span className="text-amber-400 font-bold">{buildProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full"
                        initial={{ width: '5%' }}
                        animate={{ width: `${buildProgress}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* 5 Milestone Steps */}
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {[
                      { name: 'Intent', pct: 20 },
                      { name: 'Architecture', pct: 40 },
                      { name: 'Synthesizing', pct: 65 },
                      { name: 'PQC Verify', pct: 85 },
                      { name: 'Packaging', pct: 100 }
                    ].map((step, idx) => {
                      const isComplete = buildProgress >= step.pct;
                      const isActive = buildProgress >= step.pct - 20 && buildProgress < step.pct;

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isComplete
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                              : isActive
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse'
                              : 'bg-slate-900/60 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-center mb-1">
                            {isComplete ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`} />
                            )}
                          </div>
                          <span className="text-[10px] font-mono block font-semibold">{step.name}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Terminal Log Stream Window */}
                  <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 font-mono text-[11px] text-slate-300 h-36 overflow-y-auto space-y-1 shadow-inner">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pb-1 border-b border-slate-800/80 flex items-center justify-between">
                      <span>LIVE TERMINAL LOGS // vfs://agent-build</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        STREAMING
                      </span>
                    </div>
                    {terminalLogs.map((log, i) => (
                      <div key={i} className="leading-relaxed flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        <span>{log}</span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>

                </div>
              </div>

              {/* Engaging Floating Note */}
              <div className="pt-2 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Generating complete multi-file codebase with live download packaging...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* SCAFFOLDED PROJECT PREVIEW CONTAINER (When forged & ready)                */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {builtProject && !isBuilding && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden space-y-0 mt-6"
            >
              {/* Build status banner with Download actions */}
              <div className="p-4 sm:p-5 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400">
                        BUILD COMPLETED SUCCESSFULLY
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                        {builtProject.modelUsed || activeModel.name}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">
                      Project: <strong className="text-slate-200">{builtProject.title}</strong> • {builtProject.files.length} generated files • PQC Secured
                    </p>
                  </div>
                </div>

                {/* Download and Copy Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Download Individual File */}
                  <button
                    onClick={handleDownloadActiveFile}
                    title="Download active file"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download File</span>
                  </button>

                  {/* Copy Code */}
                  <button
                    onClick={() => handleCopyCode(builtProject.files[activeFileIndex]?.content || builtProject.files[activeFileIndex]?.code || '')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>

                  {/* Download Complete Project Bundle as ZIP */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isZipping ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>PACKAGING ZIP...</span>
                      </>
                    ) : (
                      <>
                        <FolderArchive className="w-4 h-4" />
                        <span>↓ DOWNLOAD PROJECT .ZIP</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Navigation Tabs (Code Explorer vs Run Guide) */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-4 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`py-2.5 px-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'code'
                      ? 'border-amber-400 text-amber-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Code Explorer</span>
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`py-2.5 px-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'guide'
                      ? 'border-amber-400 text-amber-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal & Run Guide</span>
                </button>
              </div>

              {/* Main Content Area */}
              {activeTab === 'code' ? (
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
                  {/* File tree sidebar */}
                  <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/70 p-3 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2 py-1 flex items-center justify-between">
                      <span>PROJECT EXPLORER</span>
                      <span className="text-slate-500">{builtProject.files.length} files</span>
                    </div>

                    {builtProject.files.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveFileIndex(idx)}
                        className={`w-full p-2.5 rounded-xl text-left font-mono text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          activeFileIndex === idx
                            ? 'bg-white text-amber-800 font-bold border border-amber-300/80 shadow-xs ring-1 ring-amber-400/20'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className={`w-4 h-4 shrink-0 ${activeFileIndex === idx ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span className="truncate">{file.path || file.name}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                          {file.lang}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Code display area */}
                  <div className="md:col-span-8 p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto relative flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
                        <span className="text-amber-300 font-bold">{builtProject.files[activeFileIndex]?.path || builtProject.files[activeFileIndex]?.name}</span>
                        <span className="text-slate-500 text-[10px]">
                          {(builtProject.files[activeFileIndex]?.content || builtProject.files[activeFileIndex]?.code || '').split('\n').length} lines
                        </span>
                      </div>
                      <pre className="leading-relaxed font-mono">
                        <code>{builtProject.files[activeFileIndex]?.content || builtProject.files[activeFileIndex]?.code}</code>
                      </pre>
                    </div>

                    <div className="pt-4 border-t border-slate-900 mt-6 flex items-center justify-between text-[11px] text-slate-500">
                      <span>File format: {builtProject.files[activeFileIndex]?.lang}</span>
                      <button
                        onClick={handleDownloadActiveFile}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        <span>Download this file</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Run Guide Tab */
                <div className="p-6 bg-slate-950 text-slate-200 font-mono text-xs space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>How to Run Locally</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      You can download the full project bundle as a <code className="text-amber-300 font-bold">.zip</code> archive and execute the following in your terminal:
                    </p>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 space-y-1">
                      <div># 1. Unzip the downloaded bundle</div>
                      <div>unzip {builtProject.title.toLowerCase()}-bundle.zip</div>
                      <div>cd {builtProject.title.toLowerCase()}</div>
                      <div>&nbsp;</div>
                      <div># 2. Start services</div>
                      <div>npm install && npm run dev   # (or pip install -r requirements.txt)</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="text-sm font-bold text-slate-300">Architecture Overview</div>
                    <p className="text-slate-400 leading-relaxed">
                      {builtProject.overview || 'Multi-file architecture scaffolded with zero ambient authority and post-quantum token guards.'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Feature Badges */}
        <div className="pt-6 pb-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-amber-500" />
            <span>{activeModel.name} Neural Core</span>
          </span>
          <span className="flex items-center gap-1.5">
            <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
            <span>Direct .ZIP Bundle Export</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-cyan-600 font-bold">&lt;/&gt;</span>
            <span>Multi-file scaffolding</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Agentic code generation</span>
          </span>
        </div>

      </div>
    </div>
  );
}
