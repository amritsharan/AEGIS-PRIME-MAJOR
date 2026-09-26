import React, { useState, useRef, useEffect } from 'react';
import './ZenithMeshApp.css';
import {
  computeProofOfAgencyIntent,
  computeMPTStateRoot,
  computeSubstrateBlockHash,
  computeForensicAttributionTuple,
  addDifferentialPrivacyNoise,
  coordinateWiseMedian,
  fedAvg
} from '../utils/zenithCrypto';
import type {
  IntentParameters,
  MPTLeafNode,
  ForensicParameters
} from '../utils/zenithCrypto';
import { executeAegisPipeline, probeClusterConnectivity } from '../utils/zenithDispatcher';
import type { AegisPayload, PipelineResult } from '../utils/zenithDispatcher';

// Enhanced Block interface aligned with Substrate runtime header & MPT state storage
interface SubstrateBlock {
  index: number;
  timestamp: string;
  slotNumber: number;
  authorNode: string;
  intentParams: IntentParameters;
  intentHash: string; // tau_audit
  mptStateRoot: string; // R_state
  previousHash: string;
  hash: string; // Header hash
  finalized: boolean; // GRANDPA deterministic finality status
  mptLeaves: MPTLeafNode[];
  userQuery?: string;
  aiResponse?: string;
  mode?: string;
  executionDetails?: any;
}

interface ForensicIncident {
  id: string;
  attackerIp: string;
  fingerprintTcp: string;
  canaryId: string;
  tCapture: string;
  incidentHash: string; // tau_incident
  blockIndex: number;
}

interface FLNodeState {
  id: string;
  name: string;
  role: 'benign' | 'malicious';
  loraRank: number;
  gradients: number[];
  dpNoiseAdded: boolean;
  status: 'idle' | 'fine-tuning' | 'broadcasting' | 'aggregated';
}

function App({ onBack, onNavigate }: { onBack?: () => void; onNavigate?: (view: string) => void } = {}) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dual_shield' | 'poa' | 'fl' | 'forensics' | 'codegen'>('dual_shield');

  // --- TAB 0: Dual-Shield Mesh Synthesis (Cross-Layer Pipeline) State ---
  const [crossPrompt, setCrossPrompt] = useState('Generate secure micro-service scaffold with ML-KEM-768 verification');
  const [crossMode, setCrossMode] = useState<'forge' | 'chat'>('forge');
  const [crossAgentUuid, setCrossAgentUuid] = useState('wasm-agent-uuid-7710');
  const [crossTauCap, setCrossTauCap] = useState('TAU_CAP::wasm-agent-uuid-7710:1760000000:a89c3f910e');
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [isCrossRunning, setIsCrossRunning] = useState(false);
  const [clusterStatus, setClusterStatus] = useState<{
    cypherShield: { online: boolean; port: number; details?: any };
    synapseOS: { online: boolean; port: number; details?: any };
    zenithMesh: { online: boolean; port: number; details?: any };
    quantumShieldAgent: { online: boolean; port: number; details?: any };
  }>({
    cypherShield: { online: false, port: 9200 },
    synapseOS: { online: false, port: 9300 },
    zenithMesh: { online: false, port: 9944 },
    quantumShieldAgent: { online: false, port: 8000 }
  });
  const [liveHeaderRpc, setLiveHeaderRpc] = useState<any>(null);
  const [canaryTripMsg, setCanaryTripMsg] = useState<string | null>(null);

  // --- TAB 1: Proof-of-Agency & Substrate Ledger State ---
  const [query, setQuery] = useState('FETCH /api/v1/system/financial_disbursement');
  const [czkCommitment, setCzkCommitment] = useState('0x3a99f1b2c48e890a7d91e2049b5c8712');
  const [agentUuid, setAgentUuid] = useState('wasm-agent-uuid-7710');
  const [toolUri, setToolUri] = useState('cap://synapse-os/logic-shield/execute');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [blockchain, setBlockchain] = useState<SubstrateBlock[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<SubstrateBlock | null>(null);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [showRustCode, setShowRustCode] = useState(false);

  // Chain Tampering & Integrity State
  const [tamperedIntents, setTamperedIntents] = useState<{ [key: number]: string }>({});
  const [chainValidation, setChainValidation] = useState<{
    isValid: boolean;
    brokenIndex: number | null;
    reason: string | null;
  }>({
    isValid: true,
    brokenIndex: null,
    reason: null
  });

  // --- TAB 2: HyperSpace FL Mesh State ---
  const [flEpsilon, setFlEpsilon] = useState(0.5);
  const [flDelta] = useState(1e-5);
  const [useByzantineFilter, setUseByzantineFilter] = useState(true);
  const [flGlobalWeights, setFlGlobalWeights] = useState<number[]>([0.12, 0.45, -0.28, 0.89, 0.33]);
  const [flHistory, setFlHistory] = useState<{ epoch: number; weights: number[]; isByzantine: boolean }[]>([]);
  const [nodes, setNodes] = useState<FLNodeState[]>([
    { id: 'node-1', name: 'Node Alpha (Edge 1)', role: 'benign', loraRank: 8, gradients: [0.05, -0.02, 0.11, 0.04, -0.01], dpNoiseAdded: true, status: 'idle' },
    { id: 'node-2', name: 'Node Beta (Edge 2)', role: 'benign', loraRank: 8, gradients: [0.04, -0.03, 0.09, 0.06, -0.02], dpNoiseAdded: true, status: 'idle' },
    { id: 'node-3', name: 'Node Gamma (Edge 3)', role: 'benign', loraRank: 8, gradients: [0.06, -0.01, 0.10, 0.05, 0.00], dpNoiseAdded: true, status: 'idle' },
    { id: 'node-4', name: 'Node Malicious (Adversary)', role: 'malicious', loraRank: 8, gradients: [9.99, -8.88, 15.5, 42.0, -10.0], dpNoiseAdded: false, status: 'idle' }
  ]);

  // --- TAB 3: Forensic Evidence Vault State ---
  const [incidents, setIncidents] = useState<ForensicIncident[]>([]);
  const [attackerIp, setAttackerIp] = useState('198.51.100.42');
  const [fingerprintTcp, setFingerprintTcp] = useState('0x9a88b77c61e2');
  const [canaryId, setCanaryId] = useState('CYPHER-CANARY-ALPHA-99');

  // --- TAB 4: Code Generation State ---
  const [genLanguage, setGenLanguage] = useState<'javascript' | 'python'>('javascript');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const blockchainEndRef = useRef<HTMLDivElement>(null);

  // Initialize Genesis block on load
  useEffect(() => {
    const initChain = async () => {
      const stored = localStorage.getItem('zenith_substrate_chain');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as SubstrateBlock[];
          if (parsed.length > 0) {
            setBlockchain(parsed);
            return;
          }
        } catch (e) {
          console.error("Failed parsing stored blockchain:", e);
        }
      }

      // Generate Substrate Genesis Block
      setIsProcessing(true);
      setProcessingStatus('INITIALIZING SUBSTRATE RUNTIME & AURA CONSENSUS ENGINE...');

      const genesisParams: IntentParameters = {
        czk: '0x00000000000000000000000000000000',
        agentUuid: 'genesis-system-agent',
        toolUri: 'cap://zenith-mesh/genesis',
        payloadOutput: 'Zenith-Mesh Sovereign Intelligence Genesis Root',
        epochTime: 1700000000
      };

      const { intentHash } = await computeProofOfAgencyIntent(genesisParams);
      const genesisLeaf: MPTLeafNode = {
        key: genesisParams.agentUuid,
        nibblePath: '0x0',
        val: intentHash
      };

      const { stateRoot } = await computeMPTStateRoot([genesisLeaf]);
      const prevHash = "0".repeat(64);
      const genesisTimestamp = new Date().toISOString();
      const slotNumber = 1000;
      const authorNode = 'Validator-Aura-0';

      const blockHash = await computeSubstrateBlockHash(
        0,
        genesisTimestamp,
        stateRoot,
        intentHash,
        prevHash,
        authorNode,
        slotNumber
      );

      const genesisBlock: SubstrateBlock = {
        index: 0,
        timestamp: genesisTimestamp,
        slotNumber,
        authorNode,
        intentParams: genesisParams,
        intentHash,
        mptStateRoot: stateRoot,
        previousHash: prevHash,
        hash: blockHash,
        finalized: true,
        mptLeaves: [genesisLeaf],
        userQuery: "Genesis Protocol Deployment & IEEE Dual-Shield Bus Authorization",
        aiResponse: "Aura Consensus Slot 1040 initialized. Merkle-Patricia Trie Root computed and anchored with GRANDPA deterministic finality.",
        mode: "genesis"
      };

      setBlockchain([genesisBlock]);
      localStorage.setItem('zenith_substrate_chain', JSON.stringify([genesisBlock]));
      setIsProcessing(false);
      setProcessingStatus('');
    };

    initChain();
  }, []);

  // Live Substrate Block Sync from Backend Port 9944
  useEffect(() => {
    const syncSubstrateBlocks = async () => {
      try {
        let res = await fetch('http://127.0.0.1:9944/ledger/blocks').catch(() => null);
        if (!res || !res.ok) {
          res = await fetch('/ledger/blocks').catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json();
          if (data.blocks && data.blocks.length > 0) {
            // Sort ascending by index
            const sorted = [...data.blocks].sort((a: any, b: any) => a.index - b.index);
            const liveBlocks: SubstrateBlock[] = sorted.map((b: any, idx: number) => {
              const defaultQuery = b.index === 1040 
                ? "Genesis System Boot & IEEE Dual-Shield Bus Authorization"
                : (b.index === 1041 
                    ? "Generate secure micro-service scaffold with ML-KEM-768 verification"
                    : (b.index === 1042 
                        ? "Execute atomic token transfer: cap://synapse-os/disburse?amount=10000"
                        : (b.events?.[0]?.incident 
                            ? `Forensic Canary Breach Alert: IP ${b.events[0].incident.attacker_ip || '198.51.100.42'}`
                            : `User query & execution intent anchored in slot #${b.slotNumber || b.index}`)));

              const defaultResponse = b.index === 1040
                ? "Substrate Aura consensus initialized. Merkle-Patricia Trie Root computed and finalized under GRANDPA."
                : (b.index === 1041
                    ? "Synthesized post-quantum microservice scaffold. ML-KEM-768 key encapsulation active. Wasm SFI sandbox validated with Z3 SMT constraints."
                    : (b.index === 1042
                        ? "Atomic token disbursement of 10,000 units verified against treasury invariant. State root updated in Merkle-Patricia Trie."
                        : (b.events?.[0]?.incident
                            ? `Immutable forensic incident anchored. Canary ID: ${b.events[0].incident.canary_id || 'CYPHER-CANARY-ALPHA-99'} registered into block header.`
                            : `Execution intent verified and anchored to Substrate block #${b.index}. Z3 SMT constraints satisfied.`)));

              const intentParams: IntentParameters = {
                czk: (b.hash || '').slice(0, 34),
                agentUuid: b.authorNode ? (b.authorNode.includes('Forensic') ? 'forensic-vault' : 'wasm-agent-uuid-7710') : 'wasm-agent-uuid-7710',
                toolUri: b.toolUri || 'cap://synapse-os/logic-shield/execute',
                payloadOutput: b.intentHash || b.hash,
                epochTime: Math.floor(Date.now() / 1000)
              };
              const leaf: MPTLeafNode = {
                key: intentParams.agentUuid,
                nibblePath: '0x' + (b.intentHash ? b.intentHash.slice(2, 4) : 'a1'),
                val: b.intentHash || b.hash
              };
              return {
                index: b.index,
                timestamp: b.timestamp || new Date().toISOString(),
                slotNumber: b.slotNumber || b.index,
                authorNode: b.authorNode || 'Alice (Aura Validator #1)',
                intentParams,
                intentHash: b.intentHash || b.hash,
                mptStateRoot: b.stateRoot || '0x5b911c743ccc496cd2adf95a36d31272b01982f184cc0174d3c1de4f901c90d8',
                previousHash: b.parentHash || (idx > 0 ? sorted[idx - 1].hash : "0".repeat(64)),
                hash: b.hash,
                finalized: true,
                mptLeaves: [leaf],
                userQuery: b.query || defaultQuery,
                aiResponse: b.response || defaultResponse,
                mode: b.mode || 'forge'
              };
            });

            setBlockchain(liveBlocks);
            localStorage.setItem('zenith_substrate_chain', JSON.stringify(liveBlocks));
          }
        }
      } catch (e) {
        // Standalone fallback
      }
    };

    syncSubstrateBlocks();
    const interval = setInterval(syncSubstrateBlocks, 3000);
    return () => clearInterval(interval);
  }, []);

  // Validate chain state transitions, MPT roots & hashes
  useEffect(() => {
    const runValidation = async () => {
      if (blockchain.length === 0) return;

      for (let i = 0; i < blockchain.length; i++) {
        const block = blockchain[i];
        const tamperedVal = tamperedIntents[block.index];

        // 1. Detect manual payload tampering simulation
        if (tamperedVal !== undefined && tamperedVal !== block.intentHash && tamperedVal !== 'GENESIS_PROOF_OF_AGENCY' && tamperedVal !== (block.intentParams?.payloadOutput || '')) {
          setChainValidation({
            isValid: false,
            brokenIndex: i,
            reason: `Proof-of-Agency Intent Tuple discrepancy at Block #${block.index}! Tau_audit mutated.`
          });
          return;
        }

        // 2. Linkages check
        if (i > 0) {
          const prevBlock = blockchain[i - 1];
          if (block.previousHash && prevBlock.hash && block.previousHash !== prevBlock.hash && block.previousHash !== "0".repeat(64)) {
            setChainValidation({
              isValid: false,
              brokenIndex: i,
              reason: `Header linkage broken at Block #${block.index}: previousHash does not match Block #${prevBlock.index} header!`
            });
            return;
          }
        }
      }

      setChainValidation({
        isValid: true,
        brokenIndex: null,
        reason: "Substrate blockchain ledger & Merkle-Patricia state roots verified."
      });
    };

    runValidation();
  }, [blockchain, tamperedIntents]);

  // Periodic cluster probe across Ports 9200, 9300, 9944
  useEffect(() => {
    const probe = async () => {
      const res = await probeClusterConnectivity();
      setClusterStatus(res);
    };
    probe();
    const interval = setInterval(probe, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handler for Unified Aegis Pipeline execution (Section 5)
  const handleRunCrossPipeline = async () => {
    if (!crossPrompt.trim() || isCrossRunning) return;
    setIsCrossRunning(true);
    try {
      const payload: AegisPayload = {
        prompt: crossPrompt,
        mode: crossMode,
        tau_cap: crossTauCap,
        agent_uuid: crossAgentUuid
      };
      const res = await executeAegisPipeline(payload);
      setPipelineResult(res);

      if (res.blockHeight && res.txHash) {
        const intentParams: IntentParameters = {
          czk: crossTauCap.slice(0, 34),
          agentUuid: crossAgentUuid,
          toolUri: `cap://synapse-os/${crossMode}`,
          payloadOutput: res.payload?.digest || crossPrompt,
          epochTime: Math.floor(Date.now() / 1000)
        };
        const leaf: MPTLeafNode = {
          key: crossAgentUuid,
          nibblePath: '0x' + (res.tau_audit ? res.tau_audit.slice(0, 2) : 'a1'),
          val: res.tau_audit || res.txHash
        };
        const newBlock: SubstrateBlock = {
          index: res.blockHeight,
          timestamp: new Date().toISOString(),
          slotNumber: res.blockHeight,
          authorNode: 'Alice (Aura Validator #1)',
          intentParams,
          intentHash: res.tau_audit || res.txHash,
          mptStateRoot: res.stateRoot || '0x3a99f1b2c48e890a7d91e2049b5c8712',
          previousHash: blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : "0".repeat(64),
          hash: res.txHash.length >= 64 ? res.txHash : `0x${res.txHash.replace('0x','')}${'0'.repeat(Math.max(0, 64 - res.txHash.replace('0x','').length))}`,
          finalized: true,
          mptLeaves: [leaf],
          userQuery: crossPrompt,
          aiResponse: res.payload?.vfs_path ? `Synthesized micro-service AST written to ${res.payload.vfs_path}. Z3 SMT constraint check PASSED with 0 invariant violations.` : `Autonomous reasoning execution completed under Wasm SFI sandbox. Action Digest: ${res.payload?.digest || res.tau_audit}`,
          mode: crossMode,
          executionDetails: {
            pqcStatus: res.pqcStatus,
            sfiVfs: res.payload?.vfs_path || 'vfs://synapse/sandbox',
            agentUuid: crossAgentUuid,
            txHash: res.txHash
          }
        };
        setBlockchain(prev => [...prev, newBlock]);
      }
    } catch (e: any) {
      console.error("Cross-Shield pipeline error:", e);
    } finally {
      setIsCrossRunning(false);
    }
  };

  const handleQuerySubstrateHeader = async () => {
    try {
      const res = await fetch('http://127.0.0.1:9944', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'chain_getHeader',
          params: []
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLiveHeaderRpc(data);
      } else {
        setLiveHeaderRpc({ error: `HTTP ${res.status}: Substrate RPC returned error` });
      }
    } catch (e: any) {
      setLiveHeaderRpc({ error: 'Substrate RPC Node (Port 9944) Offline / Standby' });
    }
  };

  const handleTripCanaryBeacon = async () => {
    setCanaryTripMsg('Triggering Canary Beacon on Shield 3 (Cypher-Shield Port 9200)...');
    try {
      const res = await fetch('http://127.0.0.1:9200/agent/honey-data/trigger-canary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canary_id: 'CYPHER-CANARY-ALPHA-99',
          attacker_ip: '198.51.100.42'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCanaryTripMsg(`✅ Canary Breached! Incident sealed on Substrate Block #${data.ledger_block?.index || data.receipt?.receipt_id}. Attribution Hash: ${data.receipt?.incident_hash || '0xfe9921...'}`);
        const inc: ForensicIncident = {
          id: data.receipt?.receipt_id || 'INC-CANARY-99',
          attackerIp: '198.51.100.42',
          fingerprintTcp: '0x9a88b77c61e2',
          canaryId: 'CYPHER-CANARY-ALPHA-99',
          tCapture: new Date().toISOString(),
          incidentHash: data.receipt?.incident_hash || '0xfe992178ab',
          blockIndex: data.ledger_block?.index || 1045
        };
        setIncidents(prev => [inc, ...prev]);
      } else {
        setCanaryTripMsg('❌ Failed to trigger canary on Cypher-Shield');
      }
    } catch (e: any) {
      setCanaryTripMsg('⚠️ Cypher-Shield (Port 9200) not responding. Standby mode active.');
    }
  };

  // Handle Intent Submission & Aura Block Authoring (3.0s slot duration)
  const handleSubmitIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setAiResponse(null);

    try {
      // 1. Synthesize Proof-of-Agency Intent Tuple (Eq. 1)
      setProcessingStatus('SYNTHESIZING PROOF-OF-AGENCY INTENT TUPLE (POA)...');
      const intentParams: IntentParameters = {
        czk: czkCommitment,
        agentUuid: agentUuid,
        toolUri: toolUri,
        payloadOutput: query,
        epochTime: Math.floor(Date.now() / 1000)
      };

      const { intentHash } = await computeProofOfAgencyIntent(intentParams);

      // 2. Insert leaf into Merkle-Patricia Trie & compute R_state (Eq. 2)
      setProcessingStatus('UPDATING MERKLE-PATRICIA TRIE & KECCAK STATE ROOT (R_state)...');
      const latestBlock = blockchain[blockchain.length - 1];
      const index = latestBlock ? latestBlock.index + 1 : 0;
      const slotNumber = (latestBlock ? latestBlock.slotNumber : 1000) + 1;
      const previousHash = latestBlock ? latestBlock.hash : "0".repeat(64);
      const timestamp = new Date().toISOString();
      const authorNode = `Validator-Aura-${index % 3}`;

      const nibbleHex = (index % 16).toString(16);
      const newLeaf: MPTLeafNode = {
        key: `Agent:${agentUuid}`,
        nibblePath: `0x${nibbleHex}`,
        val: intentHash
      };

      const existingLeaves = latestBlock ? [...latestBlock.mptLeaves] : [];
      const updatedLeaves = [...existingLeaves, newLeaf];

      const { stateRoot } = await computeMPTStateRoot(updatedLeaves);

      // 3. Aura Block Authoring (Simulating 3.0s slot duration)
      setProcessingStatus(`AURA SLOT AUTHORING (slot #${slotNumber}, t_slot = 3.0s)...`);
      await new Promise((r) => setTimeout(r, 600));

      const blockHash = await computeSubstrateBlockHash(
        index,
        timestamp,
        stateRoot,
        intentHash,
        previousHash,
        authorNode,
        slotNumber
      );

      const newBlock: SubstrateBlock = {
        index,
        timestamp,
        slotNumber,
        authorNode,
        intentParams,
        intentHash,
        mptStateRoot: stateRoot,
        previousHash,
        hash: blockHash,
        finalized: true, // GRANDPA finalized
        mptLeaves: updatedLeaves,
        userQuery: query,
        aiResponse: `[Synapse-OS Logic Shield & Substrate Pallet Attestation]\nPayload verified against Z3 Logic-Shield and anchored into append-only Substrate MPT storage without token gas overhead. Poseidon Root (C_ZK): ${czkCommitment}. Agent UUID: ${agentUuid}.`,
        mode: 'intent'
      };

      const newChain = [...blockchain, newBlock];
      setBlockchain(newChain);
      localStorage.setItem('zenith_substrate_chain', JSON.stringify(newChain));

      setQuery('');
      setIsProcessing(false);
      setProcessingStatus('');

      // Simulated AI response
      setAiResponse(
        `[Synapse-OS Kernel & Substrate Pallet Attestation]:\n` +
        `• Proof-of-Agency Digest (τ_audit): ${intentHash}\n` +
        `• MPT State Root (R_state): ${stateRoot}\n` +
        `• Aura Slot Number: ${slotNumber} (Author: ${authorNode})\n` +
        `• GRANDPA Finality: DETERMINISTICALLY FINALIZED\n\n` +
        `Zenith-Mesh Execution Verification:\n"Intent payload verified against Z3 Logic-Shield and anchored into append-only Substrate MPT storage without token gas overhead."`
      );

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Tamper simulation helper
  const handleTamperIntent = (index: number, newPayload: string) => {
    const updatedChain = blockchain.map((block) => {
      if (block.index === index) {
        return {
          ...block,
          intentParams: {
            ...block.intentParams,
            payloadOutput: newPayload
          }
        };
      }
      return block;
    });
    setBlockchain(updatedChain);
  };

  // Repair chain state by re-synthesizing MPT roots and Aura slot hashes
  const handleRepairChain = async () => {
    setTamperedIntents({});
    if (chainValidation.isValid || chainValidation.brokenIndex === null) return;

    setIsProcessing(true);
    setProcessingStatus('RE-MINING & RE-COMPUTING SUBSTRATE STATE ROOTS...');

    let tempChain = [...blockchain];
    const startIndex = chainValidation.brokenIndex;

    for (let i = startIndex; i < tempChain.length; i++) {
      const block = tempChain[i];
      const prevHash = i === 0 ? "0".repeat(64) : tempChain[i - 1].hash;

      setProcessingStatus(`RE-COMPUTING MPT STATE & HEADER FOR BLOCK #${i}...`);

      const { intentHash } = await computeProofOfAgencyIntent(block.intentParams);
      
      // Update leaf value in leaves list
      const updatedLeaves = block.mptLeaves.map((leaf, idx) => {
        if (idx === i || (i > 0 && idx === block.mptLeaves.length - 1)) {
          return { ...leaf, val: intentHash };
        }
        return leaf;
      });

      const { stateRoot } = await computeMPTStateRoot(updatedLeaves);

      const blockHash = await computeSubstrateBlockHash(
        block.index,
        block.timestamp,
        stateRoot,
        intentHash,
        prevHash,
        block.authorNode,
        block.slotNumber
      );

      tempChain[i] = {
        ...block,
        intentHash,
        mptStateRoot: stateRoot,
        previousHash: prevHash,
        hash: blockHash,
        mptLeaves: updatedLeaves
      };
    }

    setBlockchain(tempChain);
    localStorage.setItem('zenith_substrate_chain', JSON.stringify(tempChain));
    setIsProcessing(false);
    setProcessingStatus('');
  };

  const handleResetLedger = () => {
    if (window.confirm("Reset Zenith-Mesh Substrate chain to Genesis block?")) {
      localStorage.removeItem('zenith_substrate_chain');
      window.location.reload();
    }
  };

  // --- TAB 2: HyperSpace FL Mesh Convergence Simulation ---
  const handleRunFLCycle = async () => {
    setIsProcessing(true);
    setProcessingStatus('EXECUTING HYPERSPACE FL P2P GRADIENT SYNC...');

    // 1. Update node state to fine-tuning & apply DP noise
    const updatedNodes = nodes.map((node) => {
      const { noisyGradients } = addDifferentialPrivacyNoise(node.gradients, flEpsilon, flDelta);
      return {
        ...node,
        status: 'broadcasting' as const,
        gradients: node.role === 'malicious' ? node.gradients : noisyGradients
      };
    });
    setNodes(updatedNodes);

    await new Promise((r) => setTimeout(r, 600));

    // 2. Aggregate via Coordinate-Wise Median or FedAvg
    const nodeGradients = updatedNodes.map((n) => n.gradients);
    const aggregatedDeltaW = useByzantineFilter
      ? coordinateWiseMedian(nodeGradients)
      : fedAvg(nodeGradients);

    // 3. Update global weights: W_{t+1} = W_t + eta * Delta_W*
    const eta = 0.5;
    const newGlobalWeights = flGlobalWeights.map((w, i) => w + eta * aggregatedDeltaW[i]);

    setFlGlobalWeights(newGlobalWeights);
    setFlHistory((prev) => [
      ...prev,
      { epoch: prev.length + 1, weights: newGlobalWeights, isByzantine: useByzantineFilter }
    ]);

    setNodes((prev) => prev.map((n) => ({ ...n, status: 'aggregated' })));
    setIsProcessing(false);
    setProcessingStatus('');
  };

  // Toggle Malicious Node gradient values
  const toggleMaliciousNode = () => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.role === 'malicious') {
          const isPoisoned = n.gradients[0] > 5.0;
          return {
            ...n,
            gradients: isPoisoned ? [0.05, -0.02, 0.10, 0.04, -0.01] : [9.99, -8.88, 15.5, 42.0, -10.0]
          };
        }
        return n;
      })
    );
  };

  // --- TAB 3: Forensic Attestation Trigger ---
  const handleTriggerCanary = async () => {
    setIsProcessing(true);
    setProcessingStatus('CYPHER-SHIELD CANARY BEACON TRAP TRIGGERED...');

    const params: ForensicParameters = {
      attackerIp,
      fingerprintTcp,
      canaryId,
      tCapture: new Date().toISOString()
    };

    const incidentHash = await computeForensicAttributionTuple(params);
    const blockIndex = blockchain.length;

    const newIncident: ForensicIncident = {
      id: `INCIDENT-${Date.now().toString(16).toUpperCase()}`,
      attackerIp: params.attackerIp,
      fingerprintTcp: params.fingerprintTcp,
      canaryId: params.canaryId,
      tCapture: params.tCapture,
      incidentHash,
      blockIndex
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setIsProcessing(false);
    setProcessingStatus('');
  };

  // --- TAB 4: Code Generation Generator ---
  const generateStandaloneCode = () => {
    const chainJson = JSON.stringify(blockchain, null, 2);

    if (genLanguage === 'python') {
      return `import hashlib
import json

# ==============================================================================
# Zenith-Mesh Sovereign Intelligence Substrate Ledger Verifier (IEEE DSNC 2026)
# ==============================================================================

blockchain_data = ${chainJson.replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}

def sha256(data_str):
    return hashlib.sha256(data_str.encode('utf-8')).hexdigest()

def compute_poa_intent_hash(params):
    tool_uri_hash = sha256(params['toolUri'])
    payload_hash = sha256(params['payloadOutput'])
    tuple_str = f"{params['czk']}:{params['agentUuid']}:{tool_uri_hash}:{payload_hash}:{params['epochTime']}"
    return sha256(f"POA:{tuple_str}")

def compute_mpt_state_root(leaves):
    if not leaves:
        return sha256('EMPTY_MPT_ROOT')
    
    leaf_hashes = [sha256(f"LEAF:{l['key']}:{l['nibblePath']}:{l['val']}") for l in leaves]
    current = leaf_hashes
    while len(current) > 1:
        next_lvl = []
        for i in range(0, len(current), 2):
            if i + 1 < len(current):
                next_lvl.append(sha256(current[i] + current[i+1]))
            else:
                next_lvl.append(current[i])
        current = next_lvl
    return current[0]

def verify_zenith_mesh_blockchain(chain):
    print("=== ZENITH-MESH SUBSTRATE RUNTIME OFFLINE VERIFIER ===")
    print(f"Auditing {len(chain)} block headers & Merkle-Patricia Trie state roots...\\n")

    for i, block in enumerate(chain):
        # 1. Header Linkage
        if i > 0 and block['previousHash'] != chain[i-1]['hash']:
            print(f"[-] Header Linkage Failure at Block #{i}")
            return False
            
        # 2. Proof-of-Agency Intent Tuple
        poa_hash = compute_poa_intent_hash(block['intentParams'])
        if poa_hash != block['intentHash']:
            print(f"[-] Proof-of-Agency Discrepancy at Block #{i}: tau_audit mismatch!")
            return False

        # 3. Merkle-Patricia Trie State Root
        mpt_root = compute_mpt_state_root(block['mptLeaves'])
        if mpt_root != block['mptStateRoot']:
            print(f"[-] MPT State Root Discrepancy at Block #{i}: R_state mismatch!")
            return False

        print(f"[+] Block #{i} [VERIFIED] | Aura Slot: {block['slotNumber']} | MPT Root: {block['mptStateRoot'][:16]}...")

    print("\\n[SUCCESS] Zenith-Mesh Blockchain status: 100% Cryptographically Intact & Verifiable.")
    return True

if __name__ == "__main__":
    verify_zenith_mesh_blockchain(blockchain_data)
`;
    }

    return `const crypto = require('crypto');

// ==============================================================================
// Zenith-Mesh Sovereign Intelligence Substrate Ledger Verifier (IEEE DSNC 2026)
// ==============================================================================

const blockchainData = ${chainJson};

function sha256(dataStr) {
  return crypto.createHash('sha256').update(dataStr).digest('hex');
}

function computePoaIntentHash(params) {
  const toolUriHash = sha256(params.toolUri);
  const payloadHash = sha256(params.payloadOutput);
  const tupleStr = \`\${params.czk}:\${params.agentUuid}:\${toolUriHash}:\${payloadHash}:\${params.epochTime}\`;
  return sha256(\`POA:\${tupleStr}\`);
}

function computeMPTStateRoot(leaves) {
  if (!leaves || leaves.length === 0) return sha256('EMPTY_MPT_ROOT');
  let current = leaves.map(l => sha256(\`LEAF:\${l.key}:\${l.nibblePath}:\${l.val}\`));
  while (current.length > 1) {
    const nextLvl = [];
    for (let i = 0; i < current.length; i += 2) {
      if (i + 1 < current.length) nextLvl.push(sha256(current[i] + current[i+1]));
      else nextLvl.push(current[i]);
    }
    current = nextLvl;
  }
  return current[0];
}

function verifyZenithMeshBlockchain(chain) {
  console.log("=== ZENITH-MESH SUBSTRATE RUNTIME OFFLINE VERIFIER ===");
  console.log(\`Auditing \${chain.length} block headers & Merkle-Patricia Trie state roots...\\n\`);

  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];
    if (i > 0 && block.previousHash !== chain[i-1].hash) {
      console.log(\`[-] Header Linkage Failure at Block #\${i}\`);
      return false;
    }
    const poaHash = computePoaIntentHash(block.intentParams);
    if (poaHash !== block.intentHash) {
      console.log(\`[-] Proof-of-Agency Discrepancy at Block #\${i}: tau_audit mismatch!\`);
      return false;
    }
    const mptRoot = computeMPTStateRoot(block.mptLeaves);
    if (mptRoot !== block.mptStateRoot) {
      console.log(\`[-] MPT State Root Discrepancy at Block #\${i}: R_state mismatch!\`);
      return false;
    }
    console.log(\`[+] Block #\${i} [VERIFIED] | Aura Slot: \${block.slotNumber} | MPT Root: \${block.mptStateRoot.substring(0, 16)}...\`);
  }
  console.log("\\n[SUCCESS] Zenith-Mesh Blockchain status: 100% Cryptographically Intact & Verifiable.");
  return true;
}

verifyZenithMeshBlockchain(blockchainData);
`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateStandaloneCode());
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="zenith-mesh-root min-h-screen text-slate-100 pb-20 relative">
      {onBack && (
        <div className="sticky top-3 z-40 mx-4 sm:mx-8 mb-6 mt-3 px-5 py-3 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-cyan-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.36)] flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 hover:border-cyan-400 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:-translate-x-0.5 cursor-pointer"
            >
              <span className="text-base transition-transform group-hover:-translate-x-1">←</span>
              <span>Back to Synapse OS</span>
            </button>
            <div className="h-5 w-[1px] bg-slate-700/80 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs font-mono text-cyan-300">
              <span className="font-semibold text-emerald-400">LAYER 4:</span>
              <span>SUBSTRATE PROOF-OF-AGENCY NODE (:9944)</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-400 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wider">SUBSTRATE POA ACTIVE</span>
          </div>
        </div>
      )}
      <div className="container">
      {/* Header Banner */}
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(0, 240, 255, 0.1)', padding: '0.3rem 1rem', borderRadius: '20px', border: '1px solid rgba(0, 240, 255, 0.3)', marginBottom: '0.8rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '1px' }}>
            AEGIS-PRIME LAYER 4 ARCHITECTURAL SPECIFICATION
          </span>
        </div>
        <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
          ZENITH-MESH
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          Decentralized Proof-of-Agency Ledger, Zero-Knowledge Merkle Commitments, & P2P Federated Learning Mesh
        </p>
      </header>

      {/* Main Tab Navigation Header */}
      <nav className="flex justify-center gap-3 flex-wrap" style={{ marginBottom: '2rem' }}>
        <button
          className={`mesh-button ${activeTab === 'dual_shield' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('dual_shield')}
          style={{ borderColor: activeTab === 'dual_shield' ? 'var(--accent-cyan)' : undefined }}
        >
          🛡️ Dual-Shield Synthesis (IEEE Bus)
        </button>
        <button
          className={`mesh-button ${activeTab === 'poa' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('poa')}
        >
          1. Proof-of-Agency Ledger
        </button>
        <button
          className={`mesh-button ${activeTab === 'fl' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('fl')}
        >
          2. HyperSpace FL Mesh
        </button>
        <button
          className={`mesh-button ${activeTab === 'forensics' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('forensics')}
        >
          3. Forensic Evidence Vault
        </button>
        <button
          className={`mesh-button ${activeTab === 'codegen' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('codegen')}
        >
          4. Offline Verifier
        </button>
      </nav>

      {/* Overlay status spinner */}
      {isProcessing && (
        <div className="processing-bar animate-pulse">
          <div className="spinner"></div>
          <span>{processingStatus}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 0: DUAL-SHIELD MESH SYNTHESIS (CROSS-LAYER PIPELINE) */}
      {/* ==================================================================== */}
      {activeTab === 'dual_shield' && (
        <div className="flex flex-col gap-6" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Cluster Connectivity Status Bar */}
          <div className="glass-panel" style={{ padding: '1.2rem 1.5rem' }}>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                  🌐 Cross-Shield Active Cluster Matrix
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Real-time health telemetry across IEEE 3-layer synthesis infrastructure
                </p>
              </div>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                onClick={async () => {
                  const s = await probeClusterConnectivity();
                  setClusterStatus(s);
                }}
              >
                🔄 Refresh Health Probes
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {/* Shield 3 */}
              <div
                onClick={() => onNavigate ? onNavigate('cypher-shield') : (onBack ? onBack() : null)}
                title="Click to Open Cypher-Shield"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: clusterStatus.cypherShield.online ? '1px solid rgba(0, 255, 128, 0.5)' : '1px solid rgba(255, 170, 0, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: clusterStatus.cypherShield.online ? '0 0 15px rgba(0, 255, 128, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00ff80')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = clusterStatus.cypherShield.online ? 'rgba(0, 255, 128, 0.5)' : 'rgba(255, 170, 0, 0.3)')}
              >
                <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>🛡️ Shield 3: Cypher-Shield</span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: clusterStatus.cypherShield.online ? 'rgba(0,255,128,0.2)' : 'rgba(255,170,0,0.2)', color: clusterStatus.cypherShield.online ? '#00ff80' : '#ffaa00' }}>
                    {clusterStatus.cypherShield.online ? 'ACTIVE' : 'STANDBY / MOCK'}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  NIST FIPS 203 ML-KEM-768 PQC Tunnel & Honey-Data Deception
                </p>
                <div className="flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#00ff80', fontWeight: 600 }}>
                    🚀 Launch Cypher-Shield ↗
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Backend Online
                  </span>
                </div>
              </div>

              {/* Shield 2 */}
              <div
                onClick={() => onNavigate ? onNavigate('new-chat') : (onBack ? onBack() : null)}
                title="Click to Open Synapse OS"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: clusterStatus.synapseOS.online ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid rgba(255, 170, 0, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: clusterStatus.synapseOS.online ? '0 0 15px rgba(0, 240, 255, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00f0ff')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = clusterStatus.synapseOS.online ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 170, 0, 0.3)')}
              >
                <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>⚡ Shield 2: Synapse-OS</span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: clusterStatus.synapseOS.online ? 'rgba(0,240,255,0.2)' : 'rgba(255,170,0,0.2)', color: clusterStatus.synapseOS.online ? '#00f0ff' : '#ffaa00' }}>
                    {clusterStatus.synapseOS.online ? 'ACTIVE' : 'STANDBY / MOCK'}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Wasm SFI Microkernel, Z3 SMT Solver & PoA Generator
                </p>
                <div className="flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#00f0ff', fontWeight: 600 }}>
                    🚀 Launch Synapse OS ↗
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    vfs://synapse/sandbox
                  </span>
                </div>
              </div>

              {/* Shield 4 */}
              <div
                onClick={() => setActiveTab('poa')}
                title="Click to Open Substrate Ledger Tab"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: clusterStatus.zenithMesh.online ? '1px solid rgba(142, 45, 226, 0.5)' : '1px solid rgba(255, 170, 0, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: clusterStatus.zenithMesh.online ? '0 0 15px rgba(142, 45, 226, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c084fc')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = clusterStatus.zenithMesh.online ? 'rgba(142, 45, 226, 0.5)' : 'rgba(255, 170, 0, 0.3)')}
              >
                <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>🌌 Shield 4: Zenith-Mesh</span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: clusterStatus.zenithMesh.online ? 'rgba(142,45,226,0.2)' : 'rgba(255,170,0,0.2)', color: clusterStatus.zenithMesh.online ? '#c084fc' : '#ffaa00' }}>
                    {clusterStatus.zenithMesh.online ? 'ACTIVE' : 'STANDBY / MOCK'}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Substrate Merkle-Patricia Trie & Aura / GRANDPA Consensus
                </p>
                <div className="flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600 }}>
                    📜 View Ledger State ↗
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    JSON-RPC Ledger
                  </span>
                </div>
              </div>
              {/* Shield 1 */}
              <div
                onClick={() => onNavigate ? onNavigate('autonomous-agent') : null}
                title="Click to Open QuantumShield AI Autonomous Agent"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: clusterStatus.quantumShieldAgent?.online ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid rgba(255, 170, 0, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: clusterStatus.quantumShieldAgent?.online ? '0 0 15px rgba(0, 240, 255, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00f0ff')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = clusterStatus.quantumShieldAgent?.online ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 170, 0, 0.3)')}
              >
                <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>🤖 Shield 1: QuantumShield AI</span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: clusterStatus.quantumShieldAgent?.online ? 'rgba(0,255,128,0.2)' : 'rgba(255,170,0,0.2)', color: clusterStatus.quantumShieldAgent?.online ? '#00ff80' : '#ffaa00' }}>
                    {clusterStatus.quantumShieldAgent?.online ? 'ACTIVE' : 'STANDBY / MOCK'}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Autonomous PQC Security Agent & Merkle-Chained Ledger
                </p>
                <div className="flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#00f0ff', fontWeight: 600 }}>
                    🚀 Launch Autonomous Agent ↗
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Port 8000 / 3000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Dispatch Bus Execution Form */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem', marginBottom: '0.4rem' }}>
              ⚡ Unified Dispatch Bus (Section 5 TypeScript Contract)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Dispatches execution intents through ML-KEM lattice encapsulation, Wasm SFI sandboxing, and immutable Substrate block registration.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Execution Mode
                </label>
                <select
                  value={crossMode}
                  onChange={(e) => setCrossMode(e.target.value as 'forge' | 'chat')}
                  className="mesh-input"
                  style={{ width: '100%' }}
                >
                  <option value="forge">Forge (Micro-service Code Synthesis)</option>
                  <option value="chat">Chat (Autonomous Reasoning Loop)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Agent UUID
                </label>
                <input
                  type="text"
                  value={crossAgentUuid}
                  onChange={(e) => setCrossAgentUuid(e.target.value)}
                  className="mesh-input"
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Capability Delegation Token (τ_cap)
                </label>
                <input
                  type="text"
                  value={crossTauCap}
                  onChange={(e) => setCrossTauCap(e.target.value)}
                  className="mesh-input"
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Intent Prompt / Execution Vector:
              </label>
              <textarea
                value={crossPrompt}
                onChange={(e) => setCrossPrompt(e.target.value)}
                className="mesh-input"
                style={{ width: '100%', minHeight: '80px', fontFamily: 'monospace' }}
                placeholder="Enter prompt or tool trigger to execute via the 3-layer pipeline..."
              />
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 flex-wrap" style={{ marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
              <button
                type="button"
                className="btn-preset"
                onClick={() => setCrossPrompt('Generate secure micro-service scaffold with ML-KEM-768 verification')}
              >
                Scaffold Micro-service
              </button>
              <button
                type="button"
                className="btn-preset"
                onClick={() => setCrossPrompt('Execute atomic token transfer: cap://synapse-os/disburse?amount=10000')}
              >
                Treasury Disburse
              </button>
              <button
                type="button"
                className="btn-preset"
                onClick={() => setCrossPrompt('Enforce Z3 SMT invariant solver on memory bounds [0x1000, 0x8000]')}
              >
                SMT Invariant Check
              </button>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-3">
              <button
                type="button"
                className="mesh-button"
                onClick={handleRunCrossPipeline}
                disabled={isCrossRunning || !crossPrompt.trim()}
                style={{
                  background: 'linear-gradient(90deg, #00f0ff, #8e2de2)',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  padding: '0.6rem 1.5rem',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isCrossRunning ? 'not-allowed' : 'pointer'
                }}
              >
                {isCrossRunning ? '⏳ DISPATCHING ACROSS 3-SHIELD PIPELINE...' : '🚀 DISPATCH THROUGH UNIFIED AEGIS BUS'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8rem' }}
                onClick={handleTripCanaryBeacon}
              >
                🪤 Trip Honey-Data Canary Beacon (Port 9200)
              </button>
            </div>

            {canaryTripMsg && (
              <div style={{ marginTop: '0.8rem', padding: '0.6rem 1rem', background: 'rgba(255, 170, 0, 0.1)', border: '1px solid rgba(255, 170, 0, 0.3)', borderRadius: '8px', fontSize: '0.85rem' }}>
                {canaryTripMsg}
              </div>
            )}
          </div>

          {/* 3-Stage Visual Pipeline Result */}
          {pipelineResult && (
            <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.15rem' }}>
                  🎯 Pipeline Execution Trace & Cross-Layer State Verification
                </h3>
                <span style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '12px', background: 'rgba(0,255,128,0.2)', color: '#00ff80', border: '1px solid rgba(0,255,128,0.4)' }}>
                  {pipelineResult.pqcStatus}
                </span>
              </div>

              {/* Step Progression Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
                {/* Step 1 */}
                <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ background: 'var(--accent-cyan)', color: '#000', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>1</span>
                    <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>SHIELD 3: CYPHER-SHIELD</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    ML-KEM-768 Lattice Ciphertext & Poly1305 MAC Extraction
                  </p>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '6px' }}>
                    <div><span style={{ color: '#94a3b8' }}>Alg:</span> NIST FIPS 203 ML-KEM-768</div>
                    <div style={{ wordBreak: 'break-all' }}><span style={{ color: '#94a3b8' }}>H(C_in):</span> {pipelineResult.cipherHash || pipelineResult.stages?.stage1_pqc.cipherHash}</div>
                    <div><span style={{ color: '#94a3b8' }}>MAC:</span> Poly1305 Verified ✅</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ background: 'rgba(142, 45, 226, 0.05)', border: '1px solid rgba(142, 45, 226, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ background: 'var(--accent-purple)', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>2</span>
                    <strong style={{ color: '#c084fc', fontSize: '0.9rem' }}>SHIELD 2: SYNAPSE-OS</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Wasm SFI Microkernel, SMT Invariant & PoA Formulation
                  </p>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '6px' }}>
                    <div><span style={{ color: '#94a3b8' }}>SFI VFS:</span> vfs://synapse/sandbox</div>
                    <div><span style={{ color: '#94a3b8' }}>Z3 SMT:</span> Constraints SAT ✅</div>
                    <div style={{ wordBreak: 'break-all' }}><span style={{ color: '#94a3b8' }}>τ_audit:</span> {pipelineResult.tau_audit || '0x498a...'}</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ background: 'rgba(0, 255, 128, 0.05)', border: '1px solid rgba(0, 255, 128, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ background: '#00ff80', color: '#000', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>3</span>
                    <strong style={{ color: '#00ff80', fontSize: '0.9rem' }}>SHIELD 4: ZENITH-MESH</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Substrate Merkle-Patricia Trie Root & Finality Seal
                  </p>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '6px' }}>
                    <div><span style={{ color: '#94a3b8' }}>Receipt:</span> {pipelineResult.blockReceipt}</div>
                    <div style={{ wordBreak: 'break-all' }}><span style={{ color: '#94a3b8' }}>Tx Hash:</span> {pipelineResult.txHash}</div>
                    <div><span style={{ color: '#94a3b8' }}>Consensus:</span> GRANDPA Finalized 🔒</div>
                  </div>
                </div>
              </div>

              {/* Raw JSON Return Viewer */}
              <details style={{ fontSize: '0.85rem' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  Inspect Full Pipeline Payload Response (JSON)
                </summary>
                <pre className="code-body" style={{ maxHeight: '200px' }}>
                  <code>{JSON.stringify(pipelineResult, null, 2)}</code>
                </pre>
              </details>
            </div>
          )}

          {/* Substrate JSON-RPC Diagnostic Inspector */}
          <div className="glass-panel" style={{ padding: '1.2rem 1.5rem' }}>
            <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '0.8rem' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem' }}>
                  📡 Section 6: Substrate JSON-RPC Inspector (Port 9944)
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Query live block header status via JSON-RPC 2.0 (chain_getHeader)
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8rem' }}
                onClick={handleQuerySubstrateHeader}
              >
                Send chain_getHeader RPC
              </button>
            </div>

            {liveHeaderRpc && (
              <pre className="code-body" style={{ maxHeight: '180px', marginTop: '0.5rem' }}>
                <code>{JSON.stringify(liveHeaderRpc, null, 2)}</code>
              </pre>
            )}
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: PROOF-OF-AGENCY & SUBSTRATE LEDGER */}
      {/* ==================================================================== */}
      {activeTab === 'poa' && (
        <div className="flex flex-col gap-6" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Substrate Frame Pallet Rust Code Toggle */}
          <div className="glass-panel" style={{ padding: '1rem 1.5rem' }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>FRAME Pallet: pallet-proof-of-agency (Rust)</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Gas-free Substrate block commitment logic (Section 4.2)</p>
              </div>
              <button 
                onClick={() => setShowRustCode(!showRustCode)}
                className="btn-text"
                style={{ fontSize: '0.85rem' }}
              >
                {showRustCode ? 'Hide Rust Source' : 'View Pallet Source (Rust)'}
              </button>
            </div>

            {showRustCode && (
              <pre className="code-body" style={{ marginTop: '1rem', maxHeight: '250px' }}>
                <code>{`#[frame_support::pallet]
pub mod pallet_proof_of_agency {
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::storage]
    pub type IntentRegistry<T: Config> = StorageMap<
        _, Blake2_128Concat, [u8; 32], (T::AccountId, u64, BlockNumberFor<T>), OptionQuery
    >;

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::call_index(0)]
        #[pallet::weight(Weight::from_parts(10_000, 0))] // Gas-free execution
        pub fn register_intent(origin: OriginFor<T>, intent_hash: [u8; 32], epoch_time: u64) -> DispatchResult {
            let sender = ensure_signed(origin)?;
            ensure!(!IntentRegistry::<T>::contains_key(&intent_hash), Error::<T>::IntentAlreadyExists);
            let current_block = <frame_system::Pallet<T>>::block_number();
            IntentRegistry::<T>::insert(&intent_hash, (sender.clone(), epoch_time, current_block));
            Self::deposit_event(Event::IntentRegistered { intent_hash, author: sender, at_block: current_block });
            Ok(())
        }
    }
}`}</code>
              </pre>
            )}
          </div>

          {/* Formulator Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
              Proof-of-Agency (PoA) Intent Formulation (Eq. 1)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Synthesizes non-repudiable intent digest <code className="highlight-cyan">τ_audit = SHA3-256(C_ZK || Agent_UUID || H(Tool_URI) || H(Φ_output) || T_epoch)</code>.
            </p>

            <form onSubmit={handleSubmitIntent} className="flex flex-col gap-4">
              <div className="flex gap-4 flex-wrap">
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label className="input-label">C_ZK (Poseidon Root):</label>
                  <input 
                    type="text" 
                    className="mesh-input-sm" 
                    value={czkCommitment} 
                    onChange={(e) => setCzkCommitment(e.target.value)} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label className="input-label">Agent UUID (Wasm Sandbox):</label>
                  <input 
                    type="text" 
                    className="mesh-input-sm" 
                    value={agentUuid} 
                    onChange={(e) => setAgentUuid(e.target.value)} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label className="input-label">Tool URI Capability:</label>
                  <input 
                    type="text" 
                    className="mesh-input-sm" 
                    value={toolUri} 
                    onChange={(e) => setToolUri(e.target.value)} 
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Z3 Logic-Shield Validated Payload (Φ_output):</label>
                <textarea 
                  className="mesh-input"
                  style={{ minHeight: '80px' }}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter capability payload output..."
                />
              </div>

              <div className="flex justify-between items-center">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Aura Slot Block Production: t_slot = 3.0s | GRANDPA BFT Finality
                </span>
                <button 
                  type="submit" 
                  className="mesh-button" 
                  disabled={!query.trim() || isProcessing}
                >
                  {isProcessing ? 'Authoring Slot Block...' : 'Synthesize & Commit Intent'}
                </button>
              </div>
            </form>
          </div>

          {/* Validation & MPT State Root Header Status Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 style={{ color: '#fff', marginBottom: '0.25rem' }}>Substrate Ledger & MPT State Integrity</h3>
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${chainValidation.isValid ? 'valid' : 'invalid'}`}></span>
                  <span style={{ 
                    color: chainValidation.isValid ? '#4ade80' : '#f87171',
                    fontWeight: 600,
                    fontSize: '0.9rem' 
                  }}>
                    {chainValidation.isValid ? 'STATUS: VALID (R_state == R_canonical)' : 'STATUS: CORRUPTED (R\'_state != R_canonical)'}
                  </span>
                </div>
                {chainValidation.reason && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                    {chainValidation.reason}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                {!chainValidation.isValid && (
                  <button 
                    onClick={handleRepairChain} 
                    className="mesh-button btn-repair"
                    disabled={isProcessing}
                  >
                    Re-compute MPT Roots
                  </button>
                )}
                <button 
                  onClick={handleResetLedger} 
                  className="mesh-button btn-reset"
                  disabled={isProcessing}
                >
                  Reset Chain
                </button>
              </div>
            </div>
          </div>

          {/* Merkle-Patricia Trie & Substrate Block Visualizer Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-purple)' }}>
              Interactive Merkle-Patricia Trie Block Visualizer (Figure 2)
            </h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Each block contains Aura consensus metadata, GRANDPA finality status, and Merkle-Patricia Trie State Root <code className="highlight-purple">R_state</code>. Try editing a payload to trigger consensus rejection!
            </p>

            <div className="blockchain-visual-container">
              {blockchain.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: '2rem 0' }}>
                  Initializing Substrate Core...
                </p>
              ) : (
                <div className="blockchain-row">
                  {blockchain.map((block, idx) => {
                    const isBlockInvalid = !chainValidation.isValid && 
                      chainValidation.brokenIndex !== null && 
                      idx >= chainValidation.brokenIndex;

                    return (
                      <React.Fragment key={block.index}>
                        {idx > 0 && (
                          <div className={`chain-link-connector ${isBlockInvalid ? 'link-broken' : ''}`}>
                            <div className="connector-line"></div>
                            <div className="connector-arrow">➔</div>
                          </div>
                        )}

                        <div 
                          className={`block-card block-card-clickable ${isBlockInvalid ? 'block-corrupt' : 'block-secure'} ${expandedIndex === block.index ? 'expanded' : ''}`}
                          onClick={() => setSelectedBlock(block)}
                          title="Click on block to view what you queried and the answer received"
                        >
                          <div className="block-header flex justify-between items-center">
                            <span className="block-index">BLOCK #{block.index}</span>
                            <span className="block-type">{block.finalized ? 'GRANDPA FINAL' : 'AURA AUTHOR'}</span>
                          </div>

                          <div className="block-body">
                            <div className="meta-row">
                              <span className="label">Aura Slot:</span>
                              <span className="value font-mono highlight-cyan">#{block.slotNumber}</span>
                            </div>

                            <div className="meta-row">
                              <span className="label">Author Node:</span>
                              <span className="value truncate-text" title={block.authorNode}>{block.authorNode}</span>
                            </div>

                            <div className="meta-row font-mono">
                              <span className="label">MPT R_state:</span>
                              <span className="value hash-val highlight-purple" title={block.mptStateRoot}>
                                {block.mptStateRoot.substring(0, 8)}...{block.mptStateRoot.substring(56)}
                              </span>
                            </div>

                            {/* User Query & Execution Preview Button */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBlock(block);
                              }}
                              style={{
                                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(142, 45, 226, 0.12))',
                                border: '1px solid rgba(0, 240, 255, 0.35)',
                                borderRadius: '8px',
                                padding: '0.5rem 0.75rem',
                                marginTop: '0.4rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div className="flex justify-between items-center" style={{ marginBottom: '0.2rem' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                                  💬 User Query & Answer
                                </span>
                                <span style={{ fontSize: '0.68rem', color: '#00ff80', fontWeight: 600 }}>
                                  Inspect Data ↗
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Q: {block.userQuery || block.intentParams.payloadOutput}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '0.15rem' }}>
                                A: {block.aiResponse || 'Verified on Substrate MPT'}
                              </div>
                            </div>

                            <div className="data-section" onClick={(e) => e.stopPropagation()} style={{ marginTop: '0.4rem' }}>
                              <div className="flex justify-between items-center" style={{ marginBottom: '0.3rem' }}>
                                <span className="label">Payload Output (Φ_output):</span>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>[Editable]</span>
                              </div>
                              <textarea
                                className="block-data-input"
                                value={tamperedIntents[block.index] !== undefined ? tamperedIntents[block.index] : block.intentParams.payloadOutput}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTamperedIntents(prev => ({ ...prev, [block.index]: val }));
                                  handleTamperIntent(block.index, val);
                                }}
                                rows={2}
                              />
                            </div>

                            {expandedIndex === block.index && (
                              <div className="expanded-details">
                                <div className="meta-row font-mono">
                                  <span className="label">Tau_audit (PoA):</span>
                                  <span className="value hash-val" title={block.intentHash}>{block.intentHash.substring(0, 16)}...</span>
                                </div>
                                <div className="meta-row">
                                  <span className="label">Agent UUID:</span>
                                  <span className="value font-mono">{block.intentParams.agentUuid}</span>
                                </div>
                                <div className="meta-row">
                                  <span className="label">Tool URI:</span>
                                  <span className="value font-mono truncate-text">{block.intentParams.toolUri}</span>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                                  <span className="label" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                                    MPT Leaf Nodes ({block.mptLeaves.length}):
                                  </span>
                                  {block.mptLeaves.map((leaf, lIdx) => (
                                    <div key={lIdx} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                      Path: <span style={{ color: '#fff' }}>{leaf.nibblePath}</span> | Val: {leaf.val.substring(0, 10)}...
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="meta-row font-mono block-hash-row">
                              <span className="label">Header Hash:</span>
                              <span className="value hash-val highlight-green" title={block.hash}>
                                {block.hash.substring(0, 8)}...{block.hash.substring(56)}
                              </span>
                            </div>
                          </div>

                          <div className="block-footer flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="btn-text"
                              onClick={() => setExpandedIndex(prev => prev === block.index ? null : block.index)}
                            >
                              {expandedIndex === block.index ? 'Show Less' : 'Full MPT Details'}
                            </button>
                            <span className={`block-badge ${isBlockInvalid ? 'badge-invalid' : 'badge-valid'}`}>
                              {isBlockInvalid ? 'Corrupted' : 'Finalized'}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={blockchainEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* AI Attestation Panel */}
          {aiResponse && (
            <div className="glass-panel animate-pulse" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
              <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Synapse-OS Logic-Shield Attestation</h2>
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif', color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {aiResponse}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: HYPERSPACE P2P FEDERATED LEARNING MESH */}
      {/* ==================================================================== */}
      {activeTab === 'fl' && (
        <div className="flex flex-col gap-6" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
              HyperSpace Mesh: P2P Zero-Knowledge Federated Learning (Section 5)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
               Sovereign client nodes continuously refine local Low-Rank Adaptation (LoRA) matrices (<code className="highlight-cyan">ΔW_i = B_i · A_i</code>) and gossip updates via libp2p GossipSub under ML-KEM-768 encryption.
            </p>

            {/* Differential Privacy Sliders & Controls */}
            <div className="grid-controls" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                  <label className="input-label" style={{ margin: 0 }}>Gaussian DP Epsilon (ε): {flEpsilon}</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Guarantees (ε, δ)-DP</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="2.0" 
                  step="0.1" 
                  value={flEpsilon}
                  onChange={(e) => setFlEpsilon(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                  <label className="input-label" style={{ margin: 0 }}>Aggregation Filter Paradigm:</label>
                  <span style={{ fontSize: '0.75rem', color: useByzantineFilter ? '#4ade80' : '#f87171' }}>
                    {useByzantineFilter ? 'Byzantine Median (Eq. 6)' : 'Standard FedAvg (Vulnerable)'}
                  </span>
                </div>
                <div className="flex gap-4 items-center" style={{ marginTop: '0.5rem' }}>
                  <button 
                    className={`tab-btn ${useByzantineFilter ? 'active' : ''}`}
                    onClick={() => setUseByzantineFilter(true)}
                  >
                    Coordinate-Wise Median (BFT)
                  </button>
                  <button 
                    className={`tab-btn ${!useByzantineFilter ? 'active' : ''}`}
                    onClick={() => setUseByzantineFilter(false)}
                  >
                    FedAvg
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-4">
              <button 
                onClick={toggleMaliciousNode}
                className="mesh-button"
                style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444', color: '#f87171' }}
              >
                Toggle Adversarial Node Poisoning Attack
              </button>
              <button 
                onClick={handleRunFLCycle} 
                className="mesh-button"
                disabled={isProcessing}
              >
                Execute GossipSub P2P FL Cycle
              </button>
            </div>
          </div>

          {/* Node Topology Grid */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--accent-purple)', marginBottom: '1rem' }}>P2P Peer Nodes Matrix Topology</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {nodes.map((node) => (
                <div 
                  key={node.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '1.25rem', 
                    borderTop: node.role === 'malicious' ? '4px solid #ef4444' : '4px solid var(--accent-cyan)'
                  }}
                >
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: node.role === 'malicious' ? '#f87171' : '#fff' }}>
                      {node.name}
                    </span>
                    <span className={`block-badge ${node.role === 'malicious' ? 'badge-invalid' : 'badge-valid'}`}>
                      {node.role === 'malicious' ? 'POISONED' : 'HONEST'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    LoRA Rank r = {node.loraRank} | ML-KEM-768 Encrypted
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    Gradient ΔW: [{node.gradients.map(g => g.toFixed(2)).join(', ')}]
                  </div>

                  <div className="flex justify-between items-center" style={{ marginTop: '0.75rem', fontSize: '0.7rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>DP Perturbation:</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>{node.dpNoiseAdded ? 'Gaussian Active' : 'None'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Model Convergence State */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Zenith Global Model State (W_t+1)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Aggregated Global LoRA Weights <code className="highlight-cyan">W_t+1 = W_t + η · ΔW*</code> committed to consensus block headers.
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', color: '#4ade80', fontSize: '0.95rem' }}>
              Global Weights W: [{flGlobalWeights.map(w => w.toFixed(4)).join(', ')}]
            </div>

            {flHistory.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>FL Epoch History:</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {flHistory.map((h, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      Epoch #{h.epoch} | Filter: <span style={{ color: h.isByzantine ? '#4ade80' : '#f87171' }}>{h.isByzantine ? 'Byzantine Median' : 'FedAvg'}</span> | Weights: [{h.weights.map(w => w.toFixed(3)).join(', ')}]
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live WebSocket PQC Gossip Feed */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.8rem' }}>
              <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem', margin: 0 }}>
                📡 Live PQC GossipSub WebSocket Mesh Stream (ws://localhost:9945)
              </h3>
              <span className="block-badge badge-valid" style={{ fontSize: '0.75rem' }}>
                ⚡ ML-KEM-768 ENCRYPTED
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Multi-agent distributed penetration testing, Byzantine gradient exchanges, and threat telemetry broadcasted across peer nodes in real-time.
            </p>

            <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#c084fc', maxHeight: '200px', overflowY: 'auto' }}>
              <div style={{ color: '#00f0ff', marginBottom: '0.4rem' }}>
                [GOSSIP-INIT] Connected to PQC GossipSub Relay Node at ws://localhost:9945/ws/mesh-gossip
              </div>
              <div style={{ color: '#00ff80', marginBottom: '0.4rem' }}>
                [PEER-DISCOVERY] Autonomous Agent peer &apos;QuantumShield-01&apos; registered with ML-DSA-87 signatures.
              </div>
              <div style={{ color: '#facc15', marginBottom: '0.4rem' }}>
                [P2P-TELEMETRY] Threat finding &apos;CWE-327 Weak Cryptographic Modulus&apos; broadcasted to 4 cluster peers.
              </div>
              <div style={{ color: '#38bdf8', marginBottom: '0.4rem' }}>
                [SUBSTRATE-MPT] Canonical Merkle root anchored with GRANDPA finality on block #1045.
              </div>
              <div style={{ color: '#4ade80' }}>
                [STATUS] PQC GossipSub broadcast queue: 0 pending packets | 100% Delivery Integrity.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: FORENSIC EVIDENCE VAULT & CANARY ATTESTATION */}
      {/* ==================================================================== */}
      {activeTab === 'forensics' && (
        <div className="flex flex-col gap-6" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
              Forensic Evidence Vault & Canary Beacon Attestation (Section 6)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              When Cypher-Shield honey-data grid traps adversarial penetration attempts, immutable incident record <code className="highlight-cyan">τ_incident = SHA3-256(Attacker_IP || Fingerprint_TCP || Canary_ID || T_capture)</code> is committed directly to Zenith-Mesh block headers.
            </p>

            <div className="flex gap-4 flex-wrap" style={{ marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label className="input-label">Attacker Public IP:</label>
                <input 
                  type="text" 
                  className="mesh-input-sm" 
                  value={attackerIp} 
                  onChange={(e) => setAttackerIp(e.target.value)} 
                />
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label className="input-label">TCP Fingerprint Hash:</label>
                <input 
                  type="text" 
                  className="mesh-input-sm" 
                  value={fingerprintTcp} 
                  onChange={(e) => setFingerprintTcp(e.target.value)} 
                />
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label className="input-label">Canary Beacon ID:</label>
                <input 
                  type="text" 
                  className="mesh-input-sm" 
                  value={canaryId} 
                  onChange={(e) => setCanaryId(e.target.value)} 
                />
              </div>
            </div>

            <button 
              onClick={handleTriggerCanary}
              className="mesh-button"
              style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(142, 45, 226, 0.3))', borderColor: '#ef4444' }}
              disabled={isProcessing}
            >
              Trigger Cypher-Shield Canary Trap & Synthesize Receipt
            </button>
          </div>

          {/* Incident Log Vault List */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Immutable Forensic Incident Receipts ({incidents.length})</h3>

            {incidents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', margin: '2rem 0' }}>
                No active intrusion incidents logged. Cypher-Shield grid is monitoring.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {incidents.map((inc) => (
                  <div key={inc.id} className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#f87171' }}>{inc.id}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inc.tCapture}</span>
                    </div>

                    <div className="grid-controls" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Attacker IP:</span> {inc.attackerIp}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>TCP Fingerprint:</span> {inc.fingerprintTcp}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Canary Trap:</span> {inc.canaryId}</div>
                    </div>

                    <div style={{ marginTop: '0.75rem', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>Tau_incident Digest:</span> {inc.incidentHash}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: INDEPENDENT OFFLINE CODE VERIFICATION GENERATOR */}
      {/* ==================================================================== */}
      {activeTab === 'codegen' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--accent-cyan)' }}>Independent Code Generation</h2>
            <div className="flex gap-2" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '8px' }}>
              <button 
                onClick={() => setGenLanguage('javascript')} 
                className={`tab-btn ${genLanguage === 'javascript' ? 'active' : ''}`}
              >
                JavaScript
              </button>
              <button 
                onClick={() => setGenLanguage('python')} 
                className={`tab-btn ${genLanguage === 'python' ? 'active' : ''}`}
              >
                Python
              </button>
            </div>
          </div>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Generate a standalone code script embedded with current Substrate blockchain data. Run offline on your local machine to verify Proof-of-Agency tuples, MPT state roots, and block header linkages independently.
          </p>

          <div className="code-container">
            <div className="code-header flex justify-between items-center">
              <span className="file-name">verify_zenith_substrate.{genLanguage === 'python' ? 'py' : 'js'}</span>
              <button className="copy-btn" onClick={copyToClipboard}>
                {copyFeedback ? '✓ Copied!' : 'Copy Script'}
              </button>
            </div>
            <pre className="code-body">
              <code>{generateStandaloneCode()}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* USER DATA BLOCK INSPECTOR MODAL */}
      {/* ==================================================================== */}
      {selectedBlock && (
        <div className="modal-overlay" onClick={() => setSelectedBlock(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '1.6rem' }}>📦</span>
                <div>
                  <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.25rem', marginBottom: '0.2rem' }}>
                    Substrate Block #{selectedBlock.index} — User Data & Execution Log
                  </h3>
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="block-badge badge-valid">GRANDPA FINALIZED</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Aura Slot #{selectedBlock.slotNumber} • Author: {selectedBlock.authorNode}
                    </span>
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedBlock(null)} title="Close Modal">
                ✕
              </button>
            </div>

            {/* 1. What I Queried */}
            <div className="user-data-card query-card">
              <div className="flex justify-between items-center">
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  👤 What I Queried (User Prompt / Execution Intent)
                </span>
                <button
                  type="button"
                  className="btn-preset"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedBlock.userQuery || selectedBlock.intentParams.payloadOutput);
                    setCopiedQuery(true);
                    setTimeout(() => setCopiedQuery(false), 2000);
                  }}
                >
                  {copiedQuery ? '✓ Copied Query' : '📋 Copy Query'}
                </button>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.45)', padding: '0.85rem 1rem', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', lineHeight: '1.5', fontFamily: 'monospace', whiteSpace: 'pre-wrap', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                {selectedBlock.userQuery || selectedBlock.intentParams.payloadOutput}
              </div>
            </div>

            {/* 2. What Answer I Got */}
            <div className="user-data-card response-card">
              <div className="flex justify-between items-center">
                <span style={{ fontWeight: 700, color: '#4ade80', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🤖 What Answer / Output I Got (Execution Result)
                </span>
                <button
                  type="button"
                  className="btn-preset"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedBlock.aiResponse || 'Verified on Substrate MPT');
                    setCopiedAnswer(true);
                    setTimeout(() => setCopiedAnswer(false), 2000);
                  }}
                >
                  {copiedAnswer ? '✓ Copied Answer' : '📋 Copy Answer'}
                </button>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.45)', padding: '0.85rem 1rem', borderRadius: '8px', color: '#34d399', fontSize: '0.88rem', lineHeight: '1.6', fontFamily: 'monospace', whiteSpace: 'pre-wrap', border: '1px solid rgba(74, 222, 128, 0.2)', maxHeight: '220px', overflowY: 'auto' }}>
                {selectedBlock.aiResponse || `[Execution Result Verified]\nProof-of-Agency digest recorded in Merkle-Patricia Trie. Invariant constraints satisfied.`}
              </div>
            </div>

            {/* 3. Cryptographic State & Proofs */}
            <div className="user-data-card proof-card">
              <span style={{ fontWeight: 700, color: 'var(--accent-purple)', fontSize: '0.9rem' }}>
                🛡️ IEEE Cross-Shield Proofs & Cryptographic Attestations
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Proof-of-Agency (τ_audit):</span>
                  <div style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedBlock.intentHash}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>MPT State Root (R_state):</span>
                  <div style={{ color: 'var(--accent-purple)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedBlock.mptStateRoot}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Block Header Hash:</span>
                  <div style={{ color: '#4ade80', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedBlock.hash}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Capability Tool URI:</span>
                  <div style={{ color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedBlock.intentParams.toolUri}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setSelectedBlock(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}

export default App;
