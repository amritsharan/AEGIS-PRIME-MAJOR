import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  ChevronRight, 
  X, 
  Plus, 
  Clock, 
  FlaskConical, 
  MessageSquare
} from 'lucide-react';

export default function HistoryDrawer({ 
  isOpen, 
  onClose, 
  activeChatId, 
  onSelectChat, 
  onNewChat,
  standardChats = [],
  mixerChats = [],
  activeTab = 'standard', // 'standard' | 'mixer'
  onChangeTab
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState(activeTab);

  const activeList = currentTab === 'standard' ? standardChats : mixerChats;

  const filteredChats = activeList.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.messages && chat.messages.some(m => m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40"
          />

          {/* Sliding Drawer on the left */}
          <motion.aside
            initial={{ x: -360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -360, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="fixed left-20 sm:left-24 top-4 bottom-4 w-80 sm:w-88 z-50 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-slate-900/15 flex flex-col overflow-hidden text-slate-800"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">Conversation History</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Isolated Standard & Mixer Archives</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEPARATE HISTORY TABS: Standard vs Fusion Mixer */}
            <div className="p-2 border-b border-slate-100 bg-slate-100/60 flex items-center gap-1 font-mono text-xs">
              <button
                onClick={() => {
                  setCurrentTab('standard');
                  if (onChangeTab) onChangeTab('standard');
                }}
                className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  currentTab === 'standard'
                    ? 'bg-white text-cyan-800 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                <span>Standard ({standardChats.length})</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('mixer');
                  if (onChangeTab) onChangeTab('mixer');
                }}
                className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  currentTab === 'mixer'
                    ? 'bg-white text-pink-800 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-pink-600" />
                <span>Mixer ({mixerChats.length})</span>
              </button>
            </div>

            {/* Quick New Chat Button */}
            <div className="p-3 border-b border-slate-100">
              <button
                onClick={() => {
                  onNewChat(currentTab);
                  onClose();
                }}
                className={`w-full py-2.5 px-3.5 rounded-xl text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                  currentTab === 'standard'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {currentTab === 'standard' ? 'Start Standard Chat' : 'Start Fusion Mixer Session'}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="px-3 pt-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus-within:border-cyan-500 transition-colors">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    currentTab === 'standard'
                      ? "Search standard chats..."
                      : "Search fusion mixer reviews..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent w-full focus:outline-none placeholder-slate-400 font-sans"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold px-2 pt-1 flex items-center justify-between">
                <span>
                  {currentTab === 'standard' ? 'Single Model Reviews' : 'Dual-Model Consensus Reviews'}
                </span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                  {filteredChats.length}
                </span>
              </div>

              {filteredChats.map((chat) => {
                const isSelected = activeChatId === chat.id;

                return (
                  <motion.button
                    key={chat.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      onSelectChat(chat.id, currentTab);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? currentTab === 'standard'
                          ? 'bg-cyan-50/90 border-cyan-300 text-cyan-950 shadow-xs'
                          : 'bg-pink-50/90 border-pink-300 text-pink-950 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-semibold truncate text-slate-800">{chat.title}</div>
                      
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {chat.timestamp}
                        </span>
                        <span className="text-slate-300">•</span>
                        {currentTab === 'standard' ? (
                          <span className="text-cyan-800 bg-cyan-100/70 px-1.5 py-0.2 rounded font-mono font-medium">
                            {chat.modelName || 'Llama-3'}
                          </span>
                        ) : (
                          <span className="text-pink-800 bg-pink-100/70 px-1.5 py-0.2 rounded font-mono font-medium">
                            {chat.model1} + {chat.model2}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </motion.button>
                );
              })}

              {filteredChats.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-mono">
                  No conversations match search query.
                </div>
              )}
            </div>

            {/* User Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                US
              </div>
              <div className="truncate flex-1">
                <div className="text-xs font-semibold text-slate-800 truncate">Operator Account</div>
                <div className="text-[10px] text-slate-500 font-mono">Aegis Sovereign User</div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
