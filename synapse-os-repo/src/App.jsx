import React, { useState } from 'react';
import { ALL_MODELS, DEFAULT_STANDARD_CHATS, DEFAULT_MIXER_CHATS } from './data/modelsData';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import ComparisonMatrix from './components/ComparisonMatrix';
import SynapseForge from './components/SynapseForge';
import Dock from './components/Dock';
import HistoryDrawer from './components/HistoryDrawer';
import ModelSelectorDrawer from './components/ModelSelectorDrawer';
import SynapseFusionModal from './components/SynapseFusionModal';

import Neo4jMotionGraphView from './components/Neo4jMotionGraphView';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import LuminaLoginScreen from './components/LuminaLoginScreen';

export default function App() {
  // Authentication state (defaults to true for active session)
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Navigation views: 'new-chat' | 'model-mixer' | 'forge' | 'admin-panel' | 'matrix' | 'neo4j-graph'
  const [activeView, setActiveView] = useState('new-chat');
  const [activeMainModelId, setActiveMainModelId] = useState('llama-3-local');
  const [fusionPair, setFusionPair] = useState(['llama-3-local', 'gpt-4o-cloud']);

  // History state separation
  const [standardChats, setStandardChats] = useState(DEFAULT_STANDARD_CHATS);
  const [mixerChats, setMixerChats] = useState(DEFAULT_MIXER_CHATS);
  const [activeChatId, setActiveChatId] = useState(() => `std-${Date.now()}`);

  // Overlays / Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isFusionModalOpen, setIsFusionModalOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  const activeMainModel = ALL_MODELS.find(m => m.id === activeMainModelId) || ALL_MODELS[0];

  const handleNewChat = (tab = 'standard') => {
    const newId = `${tab === 'mixer' ? 'mix-' : 'std-'}${Date.now()}`;
    setActiveChatId(newId);
    if (tab === 'mixer') {
      setActiveView('model-mixer');
    } else {
      setActiveView('new-chat');
    }
    setIsHistoryOpen(false);
    setIsModelSelectorOpen(false);
  };

  const handleSelectChat = (chatId, tab) => {
    setActiveChatId(chatId);
    if (tab === 'mixer') {
      setActiveView('model-mixer');
    } else {
      setActiveView('new-chat');
    }
    setIsHistoryOpen(false);
    setIsModelSelectorOpen(false);
  };

  // If user is logged out, render Lumina Sovereign Login Screen
  if (!isAuthenticated) {
    return <LuminaLoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      
      {/* 
        Vertical Floating Centered Dock on the Left Side
        1. History (with separate Standard & Mixer archives)
        2. New Chat Glowing Plus (switches to Gemini clean view)
        3. Main Model (Image 1: 8 models + Lumina Auth)
        4. Admin Panel (ZK-SNARK & WASM SFI)
        5. Model Mixer (Image 2 & 3: Dual consensus synthesis)
        6. Synapse Forge (Image 3 & 4: Agentic Build Studio)
        7. Comparison Matrix (Option 7 benchmarks)
        8. Neo4j Motion Graph (Live interactive knowledge mesh)
        9. Logout Option (With Yes/No confirmation dialog)
      */}
      <Dock
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          setIsHistoryOpen(false);
          setIsModelSelectorOpen(false);
        }}
        onToggleHistory={() => {
          setIsHistoryOpen(!isHistoryOpen);
          setIsModelSelectorOpen(false);
        }}
        onNewChat={() => handleNewChat(activeView === 'model-mixer' ? 'mixer' : 'standard')}
        onOpenModelSelector={() => {
          setIsModelSelectorOpen(!isModelSelectorOpen);
          setIsHistoryOpen(false);
        }}
        onToggleGraph={() => setIsGraphOpen(!isGraphOpen)}
        isGraphOpen={isGraphOpen}
        isHistoryOpen={isHistoryOpen}
        isModelSelectorOpen={isModelSelectorOpen}
        activeModelName={activeMainModel.name}
        onLogoutRequest={() => setIsLogoutModalOpen(true)}
      />

      {/* Slide-over History Drawer with Separate Standard & Mixer Archives */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        standardChats={standardChats}
        mixerChats={mixerChats}
        activeTab={activeView === 'model-mixer' ? 'mixer' : 'standard'}
      />

      {/* Model Selector Drawer (Image 1 Layout with Lumina-Auth) */}
      <ModelSelectorDrawer
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        activeModelId={activeMainModelId}
        onSelectModel={(id) => {
          setActiveMainModelId(id);
          setActiveView('new-chat');
        }}
        onOpenMixer={() => {
          setActiveView('model-mixer');
          setIsFusionModalOpen(true);
        }}
      />

      {/* Synapse Fusion Mixer Modal (Image 2 Layout: Select exactly 2 models to fuse) */}
      <SynapseFusionModal
        isOpen={isFusionModalOpen}
        onClose={() => setIsFusionModalOpen(false)}
        selectedPair={fusionPair}
        onApplyPair={(pair) => setFusionPair(pair)}
      />

      {/* View: Synapse Forge (Agentic Build Studio v2.0 - Image 4) */}
      {activeView === 'forge' && (
        <SynapseForge
          onClose={() => setActiveView('new-chat')}
          activeModelId={activeMainModelId}
        />
      )}

      {/* View: Admin Panel Technical Transparency */}
      {activeView === 'admin-panel' && (
        <AdminPanel
          onSwitchToUserUI={() => setActiveView('new-chat')}
        />
      )}

      {/* View: Comparison Matrix */}
      {activeView === 'matrix' && (
        <ComparisonMatrix
          onBack={() => setActiveView('model-mixer')}
        />
      )}

      {/* View: Neo4j Motion Graph & Neural Knowledge Mesh */}
      {activeView === 'neo4j-graph' && (
        <Neo4jMotionGraphView
          onBack={() => setActiveView('model-mixer')}
          fusionPair={fusionPair}
          onOpenFusionModal={() => setIsFusionModalOpen(true)}
          onNavigateToMixer={() => setActiveView('model-mixer')}
        />
      )}

      {/* View: User Dashboard (New Chat & Model Mixer Workspace) */}
      {(activeView === 'new-chat' || activeView === 'model-mixer') && (
        <UserDashboard
          activeView={activeView}
          onSelectView={setActiveView}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          isGraphOpen={isGraphOpen}
          setIsGraphOpen={setIsGraphOpen}
          activeMainModelId={activeMainModelId}
          onOpenModelSelector={() => setIsModelSelectorOpen(true)}
          fusionPair={fusionPair}
          onOpenFusionModal={() => setIsFusionModalOpen(true)}
          standardChats={standardChats}
          setStandardChats={setStandardChats}
          mixerChats={mixerChats}
          setMixerChats={setMixerChats}
        />
      )}

      {/* Logout Confirmation Modal (Yes/No prompt) */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          setIsAuthenticated(false);
        }}
      />

    </div>
  );
}
