import React, { useState } from 'react'
import { ALL_MODELS, DEFAULT_STANDARD_CHATS, DEFAULT_MIXER_CHATS } from '../data/modelsData'
import UserDashboard from './UserDashboard'
import AdminPanel from './AdminPanel'
import ComparisonMatrix from './ComparisonMatrix'
import SynapseForge from './SynapseForge'
import Dock from './Dock'
import HistoryDrawer from './HistoryDrawer'
import ModelSelectorDrawer from './ModelSelectorDrawer'
import SynapseFusionModal from './SynapseFusionModal'
import Neo4jMotionGraphView from './Neo4jMotionGraphView'
import LogoutConfirmModal from './LogoutConfirmModal'
import CypherShieldStudio from './CypherShieldStudio'
import ZenithMeshStudio from './ZenithMeshStudio'
import AutonomousAgentStudio from './AutonomousAgentStudio'

type Props = {
  userId?: string
  isHoneypot?: boolean
  activeModel?: string
  onModel?: (m: string) => void
  onAudit?: () => void
  onMeshFlow?: () => void
  onSignOut: () => void
}

export default function SynapseOS({
  userId,
  isHoneypot,
  activeModel: propActiveModel,
  onModel: propOnModel,
  onAudit,
  onMeshFlow,
  onSignOut,
}: Props) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // Navigation views: 'new-chat' | 'model-mixer' | 'forge' | 'admin-panel' | 'matrix' | 'neo4j-graph' | 'cypher-shield' | 'zenith-mesh' | 'autonomous-agent'
  const [activeView, setActiveView] = useState<'new-chat' | 'model-mixer' | 'forge' | 'admin-panel' | 'matrix' | 'neo4j-graph' | 'cypher-shield' | 'zenith-mesh' | 'autonomous-agent'>('new-chat')
  const [activeMainModelId, setActiveMainModelId] = useState(propActiveModel || 'llama-3-local')
  const [fusionPair, setFusionPair] = useState<[string, string]>(['llama-3-local', 'gpt-4o-cloud'])

  // History state separation
  const [standardChats, setStandardChats] = useState(DEFAULT_STANDARD_CHATS)
  const [mixerChats, setMixerChats] = useState(DEFAULT_MIXER_CHATS)
  const [activeChatId, setActiveChatId] = useState(() => `std-${Date.now()}`)

  // Overlays / Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [isFusionModalOpen, setIsFusionModalOpen] = useState(false)
  const [isGraphOpen, setIsGraphOpen] = useState(false)

  const activeMainModel = ALL_MODELS.find((m) => m.id === activeMainModelId) || ALL_MODELS[0]

  const handleNewChat = (tab = 'standard') => {
    const newId = `${tab === 'mixer' ? 'mix-' : 'std-'}${Date.now()}`
    setActiveChatId(newId)
    if (tab === 'mixer') {
      setActiveView('model-mixer')
    } else {
      setActiveView('new-chat')
    }
    setIsHistoryOpen(false)
    setIsModelSelectorOpen(false)
  }

  const handleSelectChat = (chatId: string, tab: string) => {
    setActiveChatId(chatId)
    if (tab === 'mixer') {
      setActiveView('model-mixer')
    } else {
      setActiveView('new-chat')
    }
    setIsHistoryOpen(false)
    setIsModelSelectorOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* 
        Vertical Floating Centered Dock on the Left Side
        1. History (with separate Standard & Mixer archives)
        2. New Chat Glowing Plus (switches to Gemini clean view)
        3. Main Model (8 models + Lumina Auth badge)
        4. Admin Panel (ZK-SNARK, LogicShield Z3, WASM SFI)
        5. Model Mixer (Dual consensus synthesis)
        6. Synapse Forge (Agentic Build Studio v2.0)
        7. Comparison Matrix (Option 7 benchmarks)
        8. Neo4j Motion Graph (Live interactive knowledge mesh)
        9. Cypher-Shield, Zenith-Mesh, and Autonomous Agent status badges
        10. Logout Option (With Yes/No confirmation dialog)
      */}
      <Dock
        activeView={activeView}
        onSelectView={(view: any) => {
          setActiveView(view)
          setIsHistoryOpen(false)
          setIsModelSelectorOpen(false)
        }}
        onToggleHistory={() => {
          setIsHistoryOpen(!isHistoryOpen)
          setIsModelSelectorOpen(false)
        }}
        onNewChat={() => handleNewChat(activeView === 'model-mixer' ? 'mixer' : 'standard')}
        onOpenModelSelector={() => {
          setIsModelSelectorOpen(!isModelSelectorOpen)
          setIsHistoryOpen(false)
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

      {/* Model Selector Drawer */}
      <ModelSelectorDrawer
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        activeModelId={activeMainModelId}
        onSelectModel={(id: string) => {
          setActiveMainModelId(id)
          if (propOnModel) propOnModel(id)
          setActiveView('new-chat')
        }}
        onOpenMixer={() => {
          setActiveView('model-mixer')
          setIsFusionModalOpen(true)
        }}
      />

      {/* Synapse Fusion Mixer Modal (Select exactly 2 models to fuse) */}
      <SynapseFusionModal
        isOpen={isFusionModalOpen}
        onClose={() => setIsFusionModalOpen(false)}
        selectedPair={fusionPair}
        onApplyPair={(pair: [string, string]) => setFusionPair(pair)}
      />

      {/* View: Synapse Forge (Agentic Build Studio v2.0) */}
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

      {/* View: Cypher-Shield Studio (Layer 3 PQC NIST ML-KEM-768 Engine) */}
      {activeView === 'cypher-shield' && (
        <div className="pl-16 sm:pl-20 min-h-screen bg-slate-950">
          <CypherShieldStudio
            onBack={() => setActiveView('new-chat')}
            onNavigate={(view: string) => setActiveView(view)}
          />
        </div>
      )}

      {/* View: Zenith-Mesh Studio (Layer 4 Substrate Proof-of-Agency Node) */}
      {activeView === 'zenith-mesh' && (
        <div className="pl-16 sm:pl-20 min-h-screen bg-[#0a0a0c]">
          <ZenithMeshStudio
            onBack={() => setActiveView('new-chat')}
            onNavigate={(view: string) => setActiveView(view)}
          />
        </div>
      )}

      {/* View: QuantumShield AI Autonomous Agent Studio */}
      {activeView === 'autonomous-agent' && (
        <div className="pl-16 sm:pl-20 min-h-screen bg-slate-950">
          <AutonomousAgentStudio
            onBack={() => setActiveView('new-chat')}
            onNavigate={(view: string) => setActiveView(view)}
          />
        </div>
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
          setIsLogoutModalOpen(false)
          onSignOut()
        }}
      />
    </div>
  )
}
