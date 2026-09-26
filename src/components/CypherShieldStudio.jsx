import React, { useState, useRef, useEffect } from 'react';
import { Shield, Server, Zap, Lock, Unlock, ShieldCheck, Download, UploadCloud, Terminal, Send, Eye, ShieldAlert, Cpu, Award, Keyboard, Volume2, VolumeX, RefreshCw, Trash2, Sun, Moon, Database, Activity, Radio, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './CypherShieldApp.css';
import { jsPDF } from 'jspdf';

const API_URL = (typeof window !== 'undefined' && window.__API_URL__) || "http://localhost:9200";

const ALL_KEYS = [
  // Row 1
  { lower: "`", upper: "~" }, { lower: "1", upper: "!" }, { lower: "2", upper: "@" }, { lower: "3", upper: "#" },
  { lower: "4", upper: "$" }, { lower: "5", upper: "%" }, { lower: "6", upper: "^" }, { lower: "7", upper: "&" },
  { lower: "8", upper: "*" }, { lower: "9", upper: "(" }, { lower: "0", upper: ")" }, { lower: "-", upper: "_" },
  { lower: "=", upper: "+" },
  // Row 2
  { lower: "q", upper: "Q" }, { lower: "w", upper: "W" }, { lower: "e", upper: "E" }, { lower: "r", upper: "R" },
  { lower: "t", upper: "T" }, { lower: "y", upper: "Y" }, { lower: "u", upper: "U" }, { lower: "i", upper: "I" },
  { lower: "o", upper: "O" }, { lower: "p", upper: "P" }, { lower: "[", upper: "{" }, { lower: "]", upper: "}" },
  { lower: "\\", upper: "|" },
  // Row 3
  { lower: "a", upper: "A" }, { lower: "s", upper: "S" }, { lower: "d", upper: "D" }, { lower: "f", upper: "F" },
  { lower: "g", upper: "G" }, { lower: "h", upper: "H" }, { lower: "j", upper: "J" }, { lower: "k", upper: "K" },
  { lower: "l", upper: "L" }, { lower: ";", upper: ":" }, { lower: "'", upper: "\"" },
  // Row 4
  { lower: "z", upper: "Z" }, { lower: "x", upper: "X" }, { lower: "c", upper: "C" }, { lower: "v", upper: "V" },
  { lower: "b", upper: "B" }, { lower: "n", upper: "N" }, { lower: "m", upper: "M" }, { lower: ",", upper: "<" },
  { lower: ".", upper: ">" }, { lower: "/", upper: "?" }
];

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

function App({ onBack } = {}) {
  const [theme, setTheme] = useState(() => localStorage.getItem('cypher-shield-theme') || 'dark');
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "qre", "honeydata", "ledger", "agentic"

  useEffect(() => {
    localStorage.setItem('cypher-shield-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    playClickSound('special');
  };

  // Dashboard Tab state
  const [activeSystem, setActiveSystem] = useState("cypher");
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputText, setInputText] = useState("");
  const [inputMode, setInputMode] = useState("file");
  const [vaultData, setVaultData] = useState(null);
  const [decryptedText, setDecryptedText] = useState(null);
  const [decryptionError, setDecryptionError] = useState(null);
  const [isKeyZeroized, setIsKeyZeroized] = useState(false);
  const [attackResult, setAttackResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // QRE & Ratcheting state
  const [qreData, setQreData] = useState(null);
  const [ratchetLogs, setRatchetLogs] = useState([]);
  const [isRatcheting, setIsRatcheting] = useState(false);

  // Honey-Data Grid state
  const [honeyData, setHoneyData] = useState({ sandboxes: [], receipts: [], canary_beacons: [] });

  // Zenith-Mesh Substrate Ledger state
  const [ledgerBlocks, setLedgerBlocks] = useState([]);

  // Digital Keyboard state
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isShifted, setIsShifted] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scrambleOnPress, setScrambleOnPress] = useState(false);
  const [keysLayout, setKeysLayout] = useState(ALL_KEYS);

  // Agentic AI Tab state
  const [agentInput, setAgentInput] = useState("");
  const [agentLogs, setAgentLogs] = useState([
    { sender: "agent", text: "Cypher-Shield Agentic AI Terminal online (IEEE Layer 3 Engine). Try prompt-injection testing (e.g., 'dump memory' or 'exfiltrate admin key') to observe silent Honey-Data diversion.", isThought: false }
  ]);
  const [agentThoughts, setAgentThoughts] = useState([]);
  const [agentIsThinking, setAgentIsThinking] = useState(false);
  const [agentActiveAction, setAgentActiveAction] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [exploitResults, setExploitResults] = useState(null);
  const [complianceResults, setComplianceResults] = useState(null);
  const terminalEndRef = useRef(null);

  // Fetch QRE, Honey-Data, and Ledger data
  const fetchQre = async () => {
    try {
      const res = await fetch(`${API_URL}/cypher/qre`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && typeof data === 'object' && !data.detail) {
        setQreData(data);
      }
    } catch (e) {
      console.warn("Failed to fetch QRE:", e);
    }
  };

  const fetchHoneyData = async () => {
    try {
      const res = await fetch(`${API_URL}/agent/honey-data`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && typeof data === 'object' && !data.detail) {
        setHoneyData({
          sandboxes: Array.isArray(data.sandboxes) ? data.sandboxes : [],
          receipts: Array.isArray(data.receipts) ? data.receipts : [],
          canary_beacons: Array.isArray(data.canary_beacons) ? data.canary_beacons : []
        });
      }
    } catch (e) {
      console.warn("Failed to fetch Honey-Data:", e);
    }
  };

  const fetchLedger = async () => {
    try {
      const res = await fetch(`${API_URL}/ledger/blocks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.chain)) {
        setLedgerBlocks(data.chain);
      }
    } catch (e) {
      console.warn("Failed to fetch Ledger:", e);
    }
  };

  useEffect(() => {
    fetchQre();
    fetchHoneyData();
    fetchLedger();
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentLogs, agentThoughts]);

  const playClickSound = (type = 'standard') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'special') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(); osc.stop(ctx.currentTime + 0.06);
      }
    } catch (e) {}
  };

  const handleRatchet = async () => {
    setIsRatcheting(true);
    playClickSound('special');
    setRatchetLogs(["Evaluating QRE physical qubit threat bounds..."]);
    try {
      const res = await fetch(`${API_URL}/cypher/ratchet`, { method: "POST" });
      const data = await res.json();
      
      for (let i = 0; i < data.logs.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        setRatchetLogs(data.logs.slice(0, i + 1));
      }
      
      setIsKeyZeroized(true);
      setDecryptedText(null);
      fetchQre();
      fetchLedger();
    } catch (err) {
      console.error("Ratchet error:", err);
    }
    setIsRatcheting(false);
  };

  const handleTriggerCanary = async (canaryId) => {
    try {
      playClickSound('special');
      const res = await fetch(`${API_URL}/agent/honey-data/trigger-canary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canary_id: canaryId, attacker_ip: "198.51.100.42" })
      });
      const data = await res.json();
      fetchHoneyData();
      fetchLedger();
      alert(`Canary Exfiltration Intercepted! Forensic receipt created: ${data.receipt.receipt_id}`);
    } catch (err) {
      console.error("Canary trigger error:", err);
    }
  };

  const shuffleKeys = () => setKeysLayout(prev => shuffleArray(prev));
  const resetLayout = () => setKeysLayout(ALL_KEYS);

  const insertText = (char) => {
    if (!textareaRef.current) { setInputText(prev => prev + char); return; }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentVal = textareaRef.current.value;
    const newVal = currentVal.substring(0, start) + char + currentVal.substring(end);
    setInputText(newVal);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + char.length;
      }
    }, 0);
  };

  const handleBackspace = () => {
    playClickSound('special');
    if (!textareaRef.current) { setInputText(prev => prev.slice(0, -1)); return; }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentVal = textareaRef.current.value;
    let newVal = currentVal;
    let newCursorPos = start;
    if (start !== end) {
      newVal = currentVal.substring(0, start) + currentVal.substring(end);
    } else if (start > 0) {
      newVal = currentVal.substring(0, start - 1) + currentVal.substring(start);
      newCursorPos = start - 1;
    }
    setInputText(newVal);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursorPos;
      }
    }, 0);
    if (scrambleOnPress) shuffleKeys();
  };

  const handleClear = () => {
    playClickSound('special');
    setInputText("");
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleKeyClick = (keyObj) => {
    let char = keyObj.lower;
    const isLetter = /^[a-zA-Z]$/.test(char);
    if (isLetter) {
      char = (isShifted !== isCapsLock) ? keyObj.upper : keyObj.lower;
    } else {
      char = isShifted ? keyObj.upper : keyObj.lower;
    }
    insertText(char);
    playClickSound('standard');
    if (isShifted) setIsShifted(false);
    if (scrambleOnPress) shuffleKeys();
  };

  const handleToggle = (system) => {
    setActiveSystem(system);
    setVaultData(null);
    setAttackResult(null);
    setSelectedFile(null);
    setInputText("");
    setInputMode("file");
    setDecryptedText(null);
    setDecryptionError(null);
    setIsKeyZeroized(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setInputText("");
      setDecryptedText(null);
      setDecryptionError(null);
    }
  };

  const handleEncrypt = async () => {
    if (inputMode === "file" && !selectedFile) return;
    if (inputMode === "text" && !inputText.trim()) return;
    setLoading(true);
    setDecryptionError(null);
    setDecryptedText(null);
    setIsKeyZeroized(false);
    try {
      const endpoint = activeSystem === "aegis" ? "/aegis/upload" : "/cypher/upload";
      let res;
      if (inputMode === "file") {
        const formData = new FormData();
        formData.append("file", selectedFile);
        res = await fetch(`${API_URL}${endpoint}`, { method: "POST", body: formData });
      } else {
        res = await fetch(`${API_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText })
        });
      }
      const data = await res.json();
      setVaultData(data);
      setAttackResult(null);
      setDecryptedText(null);
      fetchLedger();
    } catch (err) {
      console.error("Encryption Error:", err);
      alert("Failed to upload and encrypt. See console.");
    }
    setLoading(false);
  };

  const handleDownload = async (forceInvalid = false) => {
    if (!vaultData) return;
    setLoading(true);
    setDecryptionError(null);
    setDecryptedText(null);
    try {
      const endpoint = activeSystem === "aegis" ? "/aegis/download" : "/cypher/download";
      const formData = new FormData();
      formData.append("file_id", vaultData.file_id);
      
      if (activeSystem === "aegis") {
        formData.append("private_key", forceInvalid ? "INVALID_RSA_KEY" : vaultData.private_key);
        formData.append("public_key", vaultData.public_key);
      } else {
        const secretToSend = (forceInvalid || isKeyZeroized) ? "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" : vaultData.shared_secret_simulate;
        formData.append("shared_secret", secretToSend);
      }
      
      const res = await fetch(`${API_URL}${endpoint}`, { method: "POST", body: formData });
      if (!res.ok) {
        const errBody = await res.text();
        let errorMsg = "Decryption failed: Poly1305 MAC tag mismatch or corrupted secret.";
        try {
          const parsed = JSON.parse(errBody);
          if (parsed.detail) errorMsg = parsed.detail;
        } catch (e) {
          if (errBody) errorMsg = errBody;
        }
        throw new Error(errorMsg);
      }
      
      const disposition = res.headers.get('Content-Disposition');
      let filename = 'decrypted_file';
      if (disposition && disposition.includes('filename="')) {
        filename = disposition.split('filename="')[1].split('"')[0];
      }
      
      const blob = await res.blob();
      if (filename === 'input.txt') {
        const textOutput = await blob.text();
        setDecryptedText(textOutput);
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download Error:", err);
      setDecryptionError(err.message || "Decryption failed: Poly1305 AEAD validation rejected.");
    }
    setLoading(false);
  };

  const handleAttack = async () => {
    if (!vaultData || !vaultData.public_key) return;
    setLoading(true);
    setAttackResult({ logs: ["Initializing Quantum Registers..."], success: null, message: "Standby...", cracked_key_snippet: "", decrypted_content: null });
    try {
      const endpoint = activeSystem === "aegis" ? "/aegis/crack" : "/cypher/crack";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          public_key: vaultData.public_key,
          file_id: vaultData.file_id,
          private_key: vaultData.private_key
        })
      });
      const data = await res.json();
      
      for (let i = 0; i < data.logs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAttackResult(prev => ({ ...prev, logs: data.logs.slice(0, i + 1) }));
      }
      setAttackResult(data);
    } catch (err) {
      console.error("Attack Error:", err);
    }
    setLoading(false);
  };

  const triggerAgentAction = async (actionType) => {
    if (agentIsThinking) return;
    setAgentIsThinking(true);
    setAgentActiveAction(actionType);
    setAgentThoughts([]);
    
    if (actionType === "scan") setScanResults(null);
    else if (actionType === "exploit") setExploitResults(null);
    else if (actionType === "compliance") setComplianceResults(null);

    try {
      const res = await fetch(`${API_URL}/agent/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: actionType })
      });
      const data = await res.json();

      for (let i = 0; i < data.logs.length; i++) {
        await new Promise(r => setTimeout(r, 500));
        setAgentThoughts(data.logs.slice(0, i + 1));
      }

      if (actionType === "scan") {
        setScanResults(data);
        setAgentLogs(prev => [...prev, { sender: "agent", text: `Scan complete. Audit complete. Total vulnerable items detected: ${data.findings.filter(f => f.status === 'Vulnerable').length}.`, isThought: false }]);
      } else if (actionType === "exploit") {
        setExploitResults(data);
        setAgentLogs(prev => [...prev, { sender: "agent", text: data.success ? `Penetration audit complete. Vulnerable RSA files located and compromised using Shor's period finding.` : `Exploit aborted. No vulnerable elements identified in vault storage.`, isThought: false }]);
      } else if (actionType === "compliance") {
        setComplianceResults(data);
        setAgentLogs(prev => [...prev, { sender: "agent", text: `Security Compliance Report compiled. Readiness score: ${data.score}%.`, isThought: false }]);
      }
    } catch (err) {
      console.error("Agent Action Error:", err);
    }
    setAgentIsThinking(false);
  };

  const handleAgentChatSubmit = async (e) => {
    e.preventDefault();
    if (!agentInput.trim() || agentIsThinking) return;

    const userMessage = agentInput;
    setAgentInput("");
    setAgentLogs(prev => [...prev, { sender: "user", text: userMessage, isThought: false }]);
    setAgentIsThinking(true);
    setAgentThoughts([]);

    try {
      const res = await fetch(`${API_URL}/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();

      for (let i = 0; i < data.thoughts.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        setAgentThoughts(data.thoughts.slice(0, i + 1));
      }

      setAgentLogs(prev => [...prev, { sender: "agent", text: data.reply, isThought: false }]);
      if (data.honey_data) {
        fetchHoneyData();
        fetchLedger();
      }
    } catch (err) {
      console.error("Agent Chat Error:", err);
    }
    setAgentIsThinking(false);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const score = complianceResults?.score ?? 0;
    const status = complianceResults?.compliant_status ?? "UNKNOWN";
    const auditTime = new Date().toLocaleString();
    const logs = complianceResults?.logs ?? [];
    const auditMessage = complianceResults?.message ?? "";

    doc.setFillColor(11, 14, 20); doc.rect(0, 0, 210, 297, "F");
    doc.setDrawColor(0, 242, 254); doc.setLineWidth(1); doc.line(15, 32, 195, 32);

    doc.setFont("Helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(0, 242, 254);
    doc.text("CYPHER SHIELD", 15, 22);
    doc.setFont("Helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(148, 163, 184);
    doc.text("POST-QUANTUM CRYPTOGRAPHY SECURITY AUDIT", 15, 28);

    doc.setFillColor(16, 18, 27); doc.rect(15, 40, 180, 45, "F");
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.1); doc.rect(15, 40, 180, 45, "S");

    doc.setFont("Helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(226, 232, 240);
    doc.text("SYSTEM AUDIT COMPLIANCE REPORT", 20, 48);
    doc.setFont("Helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(148, 163, 184);
    doc.text(`Audit Timestamp: ${auditTime}`, 20, 56);
    doc.text("Target Environment: Cypher-Shield Layer 3 Engine", 20, 62);
    
    doc.text("Compliance Level:", 20, 72);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(status === "COMPLIANT" ? 0 : 255, status === "COMPLIANT" ? 255 : 8, status === "COMPLIANT" ? 135 : 68);
    doc.text(status, 55, 72);

    doc.setFillColor(20, 22, 33); doc.ellipse(160, 62, 18, 18, "F");
    doc.setDrawColor(0, 242, 254); doc.setLineWidth(2); doc.ellipse(160, 62, 18, 18, "S");
    doc.setFont("Helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(255, 255, 255);
    doc.text(`${score}%`, 160, 64, { align: "center" });

    doc.setFont("Helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(226, 232, 240);
    doc.text("EXECUTIVE SUMMARY", 15, 100);
    doc.line(15, 103, 195, 103);
    doc.setFont("Helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(226, 232, 240);
    const summaryLines = doc.splitTextToSize(auditMessage, 180);
    doc.text(summaryLines, 15, 110);
    
    const summaryHeight = summaryLines.length * 5;
    let currentY = 115 + summaryHeight;
    doc.setFont("Helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(226, 232, 240);
    doc.text("AUDITOR VERIFICATION TRAIL", 15, currentY);
    doc.line(15, currentY + 3, 195, currentY + 3);

    currentY += 10;
    const logBoxHeight = Math.max(logs.length * 6 + 6, 25);
    doc.setFillColor(10, 12, 18); doc.rect(15, currentY, 180, logBoxHeight, "F");
    doc.setFont("Courier", "normal"); doc.setFontSize(8); doc.setTextColor(0, 255, 135);
    logs.forEach((log, index) => {
      doc.text(doc.splitTextToSize(log, 170), 20, currentY + 6 + index * 6);
    });

    const reportId = `CS-PQC-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    doc.save(`pqc_compliance_report_${reportId.toLowerCase()}.pdf`);
  };

  const isSecured = attackResult ? !attackResult.success : true;

  return (
    <div className={`cypher-shield-root min-h-screen ${theme === 'light' ? 'light-theme' : ''}`}>
      <div className="app-container">
      {onBack && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(5, 10, 20, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: theme === 'light' ? '1px solid rgba(2, 132, 199, 0.2)' : '1px solid rgba(0, 242, 254, 0.2)',
          marginBottom: '1rem',
          borderRadius: '12px'
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.9rem',
              background: theme === 'light' ? 'rgba(2, 132, 199, 0.1)' : 'rgba(0, 242, 254, 0.1)',
              color: 'var(--neon-blue)',
              border: theme === 'light' ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid rgba(0, 242, 254, 0.4)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Back to Synapse OS
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--neon-blue)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-green)', display: 'inline-block' }} />
            LAYER 3: NIST ML-KEM-768 ACTIVE (:9200)
          </div>
        </div>
      )}
      <header className="header">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <h1>Cypher Shield</h1>
        <p>Post-Quantum Cryptography & Agentic Security Auditor (IEEE Layer 3 Engine)</p>
      </header>

      {/* Primary Tab Navigation */}
      <div className="primary-tabs">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <Shield size={18} /> Cryptosystem Dashboard
        </button>
        <button className={`tab-btn ${activeTab === 'qre' ? 'active' : ''}`} onClick={() => { setActiveTab('qre'); fetchQre(); }}>
          <Activity size={18} /> QRE & Ratcheting
        </button>
        <button className={`tab-btn ${activeTab === 'honeydata' ? 'active' : ''}`} onClick={() => { setActiveTab('honeydata'); fetchHoneyData(); }}>
          <Radio size={18} /> Honey-Data Grid
        </button>
        <button className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => { setActiveTab('ledger'); fetchLedger(); }}>
          <Layers size={18} /> Substrate Ledger
        </button>
        <button className={`tab-btn ${activeTab === 'agentic' ? 'active' : ''}`} onClick={() => setActiveTab('agentic')}>
          <Terminal size={18} /> Agentic Terminal
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="system-toggle">
            <button className={`toggle-btn ${activeSystem === 'aegis' ? 'active' : ''}`} onClick={() => handleToggle('aegis')}>
              Aegis Prime (RSA-1024)
            </button>
            <button className={`toggle-btn ${activeSystem === 'cypher' ? 'active' : ''}`} onClick={() => handleToggle('cypher')}>
              Cypher-Shield (ML-KEM / ChaCha20-Poly1305)
            </button>
          </div>

          <div className="dashboard-grid">
            {/* 1. Client System */}
            <div className="panel user-system" style={{ borderColor: isSecured ? 'var(--border-color)' : 'rgba(255,8,68,0.5)'}}>
              <div className="panel-header">
                <div className="panel-icon"><Shield color="var(--neon-blue)" /></div>
                <h2 className="panel-title">Client System</h2>
              </div>
              <p className="control-label" style={{marginBottom: "1rem"}}>Holds Private Keys locally. Encrypts payloads using ML-KEM shared secrets.</p>
              
              <div className="control-group">
                <label className="control-label">Input Mode:</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button className={`btn ${inputMode === 'file' ? 'btn-primary' : ''}`} style={{ flex: 1 }} onClick={() => setInputMode('file')}>File</button>
                  <button className={`btn ${inputMode === 'text' ? 'btn-primary' : ''}`} style={{ flex: 1 }} onClick={() => setInputMode('text')}>Text</button>
                </div>
                {inputMode === 'file' ? (
                  <div className="file-input-wrapper">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                    <button className="btn" onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ width: '100%' }}>
                      <UploadCloud size={18} style={{ marginRight: '8px' }} /> {selectedFile ? selectedFile.name : "Choose File..."}
                    </button>
                  </div>
                ) : (
                  <div className="text-input-container">
                    <textarea
                      ref={textareaRef}
                      className="input-field"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder="Enter message to encrypt..."
                      rows={4}
                      style={{ marginBottom: '0.75rem', resize: 'vertical' }}
                    />
                    <div className="keypad-toolbar">
                      <button type="button" className={`keypad-toggle-btn ${keyboardVisible ? 'active' : ''}`} onClick={() => { setKeyboardVisible(!keyboardVisible); playClickSound('special'); }}>
                        <Keyboard size={16} /> {keyboardVisible ? "Hide Cypher Keypad" : "Show Cypher Keypad"}
                      </button>
                    </div>

                    {keyboardVisible && (
                      <div className="cypher-keypad-wrapper">
                        <div className="keypad-controls">
                          <div className="keypad-status">
                            <span className="keypad-title">CYPHER KEYPAD</span>
                            <div className="leds-group">
                              <span className={`led-indicator ${isCapsLock ? 'active green' : ''}`}>CAPS</span>
                              <span className={`led-indicator ${scrambleOnPress ? 'active purple' : ''}`}>AUTO</span>
                              <span className={`led-indicator ${soundEnabled ? 'active blue' : ''}`}>AUDIO</span>
                            </div>
                          </div>
                          <div className="keypad-actions">
                            <button type="button" className="keypad-action-btn" onClick={() => setSoundEnabled(!soundEnabled)}>
                              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                            </button>
                            <button type="button" className="keypad-action-btn" onClick={() => { shuffleKeys(); playClickSound('special'); }}>
                              <RefreshCw size={14} /> Scramble
                            </button>
                            <button type="button" className={`keypad-action-btn toggle ${scrambleOnPress ? 'active' : ''}`} onClick={() => setScrambleOnPress(!scrambleOnPress)}>
                              Auto-Scramble
                            </button>
                            <button type="button" className="keypad-action-btn" onClick={() => { resetLayout(); playClickSound('special'); }}>
                              QWERTY
                            </button>
                          </div>
                        </div>

                        <div className="keypad-board">
                          <div className="keypad-row">
                            {keysLayout.slice(0, 13).map((k, i) => (
                              <button key={`row1-${i}`} type="button" className="keypad-key" onClick={() => handleKeyClick(k)}>
                                {isShifted || isCapsLock ? k.upper : k.lower}
                              </button>
                            ))}
                            <button type="button" className="keypad-key special delete" onClick={handleBackspace}>Backspace</button>
                          </div>
                          <div className="keypad-row">
                            <button type="button" className="keypad-key special tab" onClick={() => insertText("  ")}>Tab</button>
                            {keysLayout.slice(13, 26).map((k, i) => (
                              <button key={`row2-${i}`} type="button" className="keypad-key" onClick={() => handleKeyClick(k)}>
                                {isShifted || isCapsLock ? k.upper : k.lower}
                              </button>
                            ))}
                          </div>
                          <div className="keypad-row">
                            <button type="button" className={`keypad-key special caps ${isCapsLock ? 'active' : ''}`} onClick={() => setIsCapsLock(!isCapsLock)}>Caps Lock</button>
                            {keysLayout.slice(26, 37).map((k, i) => (
                              <button key={`row3-${i}`} type="button" className="keypad-key" onClick={() => handleKeyClick(k)}>
                                {isShifted || isCapsLock ? k.upper : k.lower}
                              </button>
                            ))}
                            <button type="button" className="keypad-key special enter" onClick={() => insertText("\n")}>Enter</button>
                          </div>
                          <div className="keypad-row">
                            <button type="button" className={`keypad-key special shift ${isShifted ? 'active' : ''}`} onClick={() => setIsShifted(!isShifted)}>Shift</button>
                            {keysLayout.slice(37, 47).map((k, i) => (
                              <button key={`row4-${i}`} type="button" className="keypad-key" onClick={() => handleKeyClick(k)}>
                                {isShifted || isCapsLock ? k.upper : k.lower}
                              </button>
                            ))}
                            <button type="button" className="keypad-key special clear" onClick={handleClear}><Trash2 size={14} /> Clear</button>
                          </div>
                          <div className="keypad-row justify-center">
                            <button type="button" className="keypad-key space" onClick={() => insertText(" ")}>[ Spacebar ]</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button className="btn btn-primary" onClick={handleEncrypt} disabled={loading || (inputMode === 'file' ? !selectedFile : !inputText.trim())}>
                <Lock size={18} /> {loading ? 'Processing...' : `Sign, Encrypt & Upload`}
              </button>
              
              {vaultData && (
                 <div className="control-group" style={{marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)"}}>
                    <label className="control-label">{vaultData.filename === 'input.txt' ? 'Text Available in Vault:' : 'File Available in Vault:'}</label>
                    
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <button className="btn" onClick={() => handleDownload(false)} disabled={loading} style={{flex: 1, minWidth: '150px', background: isKeyZeroized ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 255, 135, 0.1)', color: isKeyZeroized ? 'var(--text-secondary)' : 'var(--neon-green)', borderColor: isKeyZeroized ? 'var(--border-color)' : 'var(--neon-green)'}}>
                        <Download size={18} /> {vaultData.filename === 'input.txt' ? 'Fetch & Decrypt Text' : 'Fetch & Decrypt File'}
                      </button>

                      {activeSystem === 'cypher' && (
                        <button className="btn" onClick={() => { setIsKeyZeroized(!isKeyZeroized); setDecryptedText(null); setDecryptionError(null); playClickSound('special'); }} disabled={loading} style={{background: isKeyZeroized ? 'rgba(255, 8, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: isKeyZeroized ? 'var(--neon-red)' : 'var(--text-secondary)', borderColor: isKeyZeroized ? 'var(--neon-red)' : 'var(--border-color)'}}>
                          <Trash2 size={16} /> {isKeyZeroized ? 'Key Zeroized (0x00)' : 'Zeroize Session Key'}
                        </button>
                      )}
                    </div>

                    {isKeyZeroized && (
                      <p style={{fontSize: '0.8rem', color: 'var(--neon-red)', marginBottom: '0.5rem'}}>
                        ⚠️ RAM Scrub Active: ML-KEM shared secret wiped (0x00). Decryption requests will be rejected by Poly1305 AEAD MAC.
                      </p>
                    )}

                    {decryptedText && (
                      <div className="data-box alert" style={{marginTop: "1rem", borderColor: "var(--neon-green)", background: "rgba(0, 255, 135, 0.05)"}}>
                        <div className="control-label" style={{color: 'var(--neon-green)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px'}}>
                          <CheckCircle2 size={16} /> Decrypted Output:
                        </div>
                        <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)', margin: 0}}>{decryptedText}</pre>
                      </div>
                    )}

                    {decryptionError && (
                      <div className="data-box alert" style={{marginTop: "1rem", borderColor: "var(--neon-red)", background: "rgba(255, 8, 68, 0.08)", borderLeft: "4px solid var(--neon-red)"}}>
                        <div className="control-label" style={{color: 'var(--neon-red)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold'}}>
                          <AlertTriangle size={16} /> Decryption FAILED:
                        </div>
                        <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)', margin: 0, fontSize: '0.88rem'}}>
                          {decryptionError}
                        </pre>
                      </div>
                    )}
                 </div>
              )}

              {attackResult && attackResult.success && (
                <div className="data-box alert" style={{marginTop: "2rem"}}>
                   <p style={{color: "var(--neon-red)", fontWeight: "bold", marginBottom: "0.5rem"}}>⚠️ ALERT: System Compromised</p>
                   <pre>The Quantum Attack successfully derived your private key via the server's public key interaction.</pre>
                </div>
              )}
            </div>

            {/* 2. Server Vault */}
            <div className="panel vault-server">
              {vaultData ? (
                 <div className={`status-badge ${isSecured ? 'secure' : 'danger'}`}>
                   {isSecured ? 'ENCRYPTED' : 'BREACHED'}
                 </div>
              ) : null}
              
              <div className="panel-header">
                <div className="panel-icon"><Server color="var(--neon-purple)" /></div>
                <h2 className="panel-title">Server Vault</h2>
              </div>
              <p className="control-label" style={{marginBottom: "1rem"}}>Stores encrypted payloads & zero-copy headers. Cryptographic metadata written to SQLite.</p>

              <div className="data-box info">
                <div className="control-label">Digital Signature (ML-DSA-87 / RSA):</div>
                <pre style={{color: 'var(--neon-blue)'}}>{
                  vaultData && typeof vaultData.digital_signature === 'string'
                    ? vaultData.digital_signature.substring(0, 120) + "..."
                    : "No Signature Stored"
                }</pre>
              </div>

              <div className="data-box info" style={{marginTop: "1rem"}}>
                <div className="control-label">Public Key / Polynomial Matrix:</div>
                <pre>{
                  vaultData && typeof vaultData.public_key === 'string'
                    ? vaultData.public_key.substring(0, 120) + "..."
                    : "No Data"
                }</pre>
              </div>

               <div className="data-box" style={{marginTop: "1rem"}}>
                 <div className="control-label">File Storage Payload:</div>
                 <pre>
                  {vaultData
                    ? (activeSystem === 'aegis'
                       ? `[AEGIS FILE STORAGE]\nStored RSA Encrypted Blob for ID: ${vaultData.file_id}`
                       : (vaultData.pqc_key_ciphertext && typeof vaultData.pqc_key_ciphertext === 'string'
                          ? `[LATTICE KEM STORAGE (ChaCha20-Poly1305 AEAD)]\nKyber Ciphertext:\n${vaultData.pqc_key_ciphertext.substring(0,50)}...\n\nEncrypted Payload Stored for ID: ${vaultData.file_id}`
                          : `[LATTICE KEM STORAGE]\nNo PQC Key Data\n\nEncrypted Payload Stored for ID: ${vaultData.file_id}`)
                      )
                    : "Awaiting Data Injection..."}
                 </pre>
               </div>
            </div>

            {/* 3. Quantum Attacker */}
            <div className="panel quantum-attacker">
              <div className="panel-header">
                <div className="panel-icon"><Zap color="var(--neon-red)" /></div>
                <h2 className="panel-title">Quantum Attacker</h2>
              </div>
              <p className="control-label" style={{marginBottom: "1rem"}}>
                Simulates quantum cryptanalysis (Shor's period finding vs Grover's lattice vector search).
              </p>

              <button className="btn btn-danger" onClick={handleAttack} disabled={loading || !vaultData}>
                 <Zap size={18} /> Initialize Quantum Attack
              </button>

              {attackResult && (
                 <div className="data-box" style={{marginTop: "1.5rem"}}>
                   {attackResult.logs && attackResult.logs.map((log, i) => (
                     <div key={i} className="log-entry">{">"} {log}</div>
                   ))}
                   
                   {attackResult.success !== null && (
                     <div className="control-group" style={{marginTop: "1.5rem"}}>
                       <button className="btn" disabled style={{
                           background: attackResult.success ? 'rgba(255, 8, 68, 0.2)' : 'rgba(0, 255, 135, 0.2)',
                           color: attackResult.success ? 'var(--neon-red)' : 'var(--neon-green)',
                           border: `1px solid ${attackResult.success ? 'var(--neon-red)' : 'var(--neon-green)'}`
                       }}>
                         {attackResult.success ? <Unlock size={18}/> : <ShieldCheck size={18}/>}
                         {attackResult.success ? "Decryption Successful" : "Decryption FAILED"}
                       </button>
                       <p style={{marginTop: "1rem", fontSize: "0.9rem", color: "var(--text-secondary)"}}>
                         {attackResult.message}
                       </p>

                       {attackResult.success && attackResult.decrypted_content && (
                         <div className="data-box alert" style={{marginTop: "1rem", borderColor: "var(--neon-red)", background: "rgba(255, 8, 68, 0.08)", borderLeft: "4px solid var(--neon-red)"}}>
                           <div className="control-label" style={{color: 'var(--neon-red)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold'}}>
                             <Unlock size={14} /> Intercepted Plaintext Message / User Payload:
                           </div>
                           <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)', margin: 0, fontFamily: 'monospace', fontSize: '0.95rem'}}>
                             {attackResult.decrypted_content}
                           </pre>
                         </div>
                       )}
                     </div>
                   )}
                 </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* QRE & Dynamic Ratcheting Tab */}
      {activeTab === 'qre' && (
        <div className="panel full-width-panel">
          <div className="panel-header">
            <Activity color="var(--neon-blue)" />
            <h2 className="panel-title">Quantum Resource Estimator (QRE) & Dynamic Parameter Ratcheting</h2>
          </div>
          <p className="control-label" style={{marginBottom: '1.5rem'}}>
            Calculates equation (8) from IEEE paper: Q_cost = α · (n · k · log₂ q) · D_T-Gate. Dynamically ratchets matrix dimension from k=3 to k=4 when Q_cost drops below 10^7 qubits.
          </p>

          {qreData && (
            <div className="qre-dashboard-grid">
              <div className="qre-metric-card">
                <span className="qre-label">PHYSICAL QUBIT COST (Q_cost)</span>
                <span className="qre-value" style={{ color: qreData.threat_detected ? 'var(--neon-red)' : 'var(--neon-blue)' }}>
                  {qreData.formatted_q_cost || 'N/A'}
                </span>
                <span className="qre-sub">Calculated for T-Gate Depth: {qreData.t_gate_depth != null ? qreData.t_gate_depth.toLocaleString() : 'N/A'}</span>
              </div>

              <div className="qre-metric-card">
                <span className="qre-label">ACTIVE MATRIX DIMENSION (k)</span>
                <span className="qre-value" style={{ color: 'var(--neon-green)' }}>
                  k = {qreData.k_rank || 3}
                </span>
                <span className="qre-sub">ML-KEM-{(qreData.k_rank || 3) * 256} (n=256, q=3329)</span>
              </div>

              <div className="qre-metric-card">
                <span className="qre-label">SAFETY THRESHOLD</span>
                <span className="qre-value" style={{ color: 'var(--text-secondary)' }}>
                  {qreData.formatted_threshold || '10,000,000 Physical Qubits'}
                </span>
                <span className="qre-sub">Status: {qreData.status || 'ACTIVE'}</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={handleRatchet} disabled={isRatcheting}>
              <RefreshCw size={18} className={isRatcheting ? "spin-icon" : ""} />
              {isRatcheting ? "Zeroizing Memory & Escalating Parameters..." : "Simulate Threat & Trigger Dynamic Ratchet (k=3 → k=4)"}
            </button>
          </div>

          {ratchetLogs.length > 0 && (
            <div className="data-box" style={{ marginTop: '1.5rem', background: 'rgba(10, 12, 18, 0.9)' }}>
              <div className="control-label" style={{ color: 'var(--neon-green)', marginBottom: '0.75rem' }}>Dynamic Ratcheting Execution Log:</div>
              {ratchetLogs.map((log, i) => (
                <div key={i} className="log-entry">{log}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Honey-Data Grid Tab */}
      {activeTab === 'honeydata' && (
        <div className="panel full-width-panel">
          <div className="panel-header">
            <Radio color="var(--neon-purple)" />
            <h2 className="panel-title">Active Honey-Data Deception Grid & Canary Attribution</h2>
          </div>
          <p className="control-label" style={{ marginBottom: '1.5rem' }}>
            Section 5 Countermeasures: Silently diverts malicious prompt injection dumps away from production into isolated Shadow Sandboxes instrumented with HMAC-SHA256 tracking beacons.
          </p>

          <div className="honey-grid-container">
            <div className="honey-column">
              <h3>Ephemeral Shadow Sandboxes ({(honeyData?.sandboxes || []).length})</h3>
              {(!honeyData?.sandboxes || honeyData.sandboxes.length === 0) ? (
                <p className="control-label">No active sandboxes. Try running a prompt-injection phrase in the Agentic Terminal (e.g. 'dump memory') to trigger diversion.</p>
              ) : (
                honeyData.sandboxes.map(sb => (
                  <div key={sb.sandbox_id} className="sandbox-card">
                    <div className="sandbox-header">
                      <span className="sandbox-id">{sb.sandbox_id}</span>
                      <span className="risk-badge critical">{sb.status}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Triggered by: {sb.trigger_reason}</p>
                    <div className="synthetic-assets-box">
                      <strong>Synthetic Asset Markers:</strong>
                      <pre>{JSON.stringify(sb.synthetic_assets, null, 2)}</pre>
                    </div>
                    <button className="btn" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleTriggerCanary(sb.canary_id)}>
                      Simulate Attacker Exfiltrating Canary Key
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="honey-column">
              <h3>Forensic Attribution Receipts ({(honeyData?.receipts || []).length})</h3>
              {(!honeyData?.receipts || honeyData.receipts.length === 0) ? (
                <p className="control-label">No forensic receipts recorded yet.</p>
              ) : (
                honeyData.receipts.map(rc => (
                  <div key={rc.receipt_id} className="receipt-card">
                    <div className="sandbox-header">
                      <span className="sandbox-id">{rc.receipt_id}</span>
                      <span className="risk-badge low">{rc.legal_attribution_status}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem' }}><strong>Canary ID:</strong> {rc.canary_id}</p>
                    <p style={{ fontSize: '0.85rem' }}><strong>Egress IP:</strong> {rc.egress_ip} ({rc.asn})</p>
                    <p style={{ fontSize: '0.85rem' }}><strong>Routing:</strong> {rc.routing_topology}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Substrate Ledger Tab */}
      {activeTab === 'ledger' && (
        <div className="panel full-width-panel">
          <div className="panel-header">
            <Layers color="var(--neon-green)" />
            <h2 className="panel-title">Zenith-Mesh Substrate Blockchain Ledger</h2>
          </div>
          <p className="control-label" style={{ marginBottom: '1.5rem' }}>
            Stamps key rotation hashes, intent digests (τ_audit), and forensic attribution receipts to an immutable block state.
          </p>

          <div className="ledger-chain-view">
            {(ledgerBlocks || []).map(block => (
              <div key={block.index} className="block-card">
                <div className="block-header">
                  <span className="block-number">Block #{block.index}</span>
                  <span className="block-type">{block.event_type}</span>
                </div>
                <p style={{ fontSize: '0.85rem' }}><strong>Block Hash:</strong> {block.block_hash}</p>
                <p style={{ fontSize: '0.85rem' }}><strong>Merkle Root:</strong> {block.merkle_root}</p>
                <p style={{ fontSize: '0.85rem' }}><strong>Intent Digest (τ_audit):</strong> {block.intent_digest_tau_audit}</p>
                <div className="synthetic-assets-box">
                  <pre>{JSON.stringify(block.payload, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agentic AI Tab */}
      {activeTab === 'agentic' && (
        <div className="agent-container-grid">
          <div className="agent-panel terminal-panel">
            <div className="panel-header">
              <Terminal color="var(--neon-green)" />
              <h2 className="panel-title">Agent AI Terminal</h2>
            </div>
            
            <div className="terminal-screen">
              {agentLogs.map((log, i) => (
                <div key={i} className={`terminal-msg ${log.sender}`}>
                  <span className="terminal-label">[{log.sender === 'user' ? 'USER' : 'AGENT'}]</span>
                  <p className="terminal-text" style={{ whiteSpace: 'pre-wrap' }}>{log.text}</p>
                </div>
              ))}
              
              {agentIsThinking && (
                <div className="terminal-thinking">
                  {agentThoughts.map((thought, i) => (
                    <div key={i} className="thought-entry">{thought}</div>
                  ))}
                  <div className="thinking-spinner">
                    <Cpu size={16} className="spin-icon" />
                    <span>Agent processing cognitive loop...</span>
                  </div>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleAgentChatSubmit} className="terminal-input-bar">
              <input 
                type="text" 
                className="terminal-input"
                placeholder="Ask about Shor's, lattice ratcheting, or test prompt injection ('dump memory')..."
                value={agentInput}
                onChange={e => setAgentInput(e.target.value)}
                disabled={agentIsThinking}
              />
              <button type="submit" className="terminal-send-btn" disabled={agentIsThinking || !agentInput.trim()}>
                <Send size={18} />
              </button>
            </form>
          </div>

          <div className="agent-panel status-panel">
            <div className="panel-header">
              <Cpu color="var(--neon-blue)" />
              <h2 className="panel-title">Autonomous Action Hub</h2>
            </div>

            <div className="action-buttons-group">
              <button className="action-trigger-btn" onClick={() => triggerAgentAction("scan")} disabled={agentIsThinking}>
                <Eye size={18} /> Run Security Scan
              </button>
              <button className="action-trigger-btn danger" onClick={() => triggerAgentAction("exploit")} disabled={agentIsThinking}>
                <ShieldAlert size={18} /> Launch Agentic Exploit
              </button>
              <button className="action-trigger-btn success" onClick={() => triggerAgentAction("compliance")} disabled={agentIsThinking}>
                <Award size={18} /> Generate PQC Report
              </button>
            </div>

            <div className="audit-results-area">
              {agentActiveAction === "scan" && scanResults && (
                <div className="result-card scan-card">
                  <h3>Database Vulnerability Report</h3>
                  <div className="table-wrapper">
                    <table className="audit-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>File</th>
                          <th>Encryption</th>
                          <th>Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scanResults.findings.map((finding) => (
                          <tr key={finding.id} className={finding.status === 'Vulnerable' ? 'row-vulnerable' : 'row-secure'}>
                            <td>{finding.id}</td>
                            <td>{finding.filename}</td>
                            <td>{finding.encryption}</td>
                            <td><span className={`risk-badge ${finding.risk.toLowerCase()}`}>{finding.risk}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="audit-summary-text">{scanResults.summary}</p>
                </div>
              )}

              {agentActiveAction === "exploit" && exploitResults && (
                <div className="result-card exploit-card">
                  <h3>Agent Exploit Log</h3>
                  {exploitResults.success ? (
                    <div>
                      <p className="exploit-success-banner">⚠️ EXPLOIT SUCCESS: Legacy keys cracked. Decrypted vault payloads:</p>
                      {exploitResults.exploited.map((item) => (
                        <div key={item.id} className="exploited-item">
                          <div className="exploited-meta">ID {item.id}: <strong>{item.filename}</strong></div>
                          <div className="exploited-key-box">
                            <strong>Derived Private Key snippet:</strong>
                            <pre className="key-snippet">{item.recovered_key}</pre>
                          </div>
                          <div className="exploited-payload-box">
                            <strong>Decrypted content:</strong>
                            <p className="payload-content">"{item.decrypted_content}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="exploit-fail-banner">No quantum-vulnerable items available for automated exploits.</p>
                  )}
                  <p className="audit-summary-text">{exploitResults.message}</p>
                </div>
              )}

              {agentActiveAction === "compliance" && complianceResults && (
                <div className="result-card compliance-card">
                  <h3>Post-Quantum Readiness Audit</h3>
                  <div className="compliance-gauge-wrapper">
                    <div className="compliance-score-ring">
                      <span className="score-num">{complianceResults.score}%</span>
                      <span className="score-label">Readiness</span>
                    </div>
                    <div className="compliance-status-details">
                      <div className={`status-pill ${complianceResults.compliant_status.toLowerCase()}`}>
                        {complianceResults.compliant_status}
                      </div>
                      <p className="compliance-date-text">Audit Time: {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                   <p className="audit-summary-text" style={{marginTop: '1.5rem'}}>{complianceResults.message}</p>
                   <button className="btn" onClick={handleDownloadPDF} style={{ marginTop: "1.5rem", background: "rgba(0, 242, 254, 0.1)", color: "var(--neon-blue)", border: "1px solid var(--neon-blue)", width: "auto", display: "inline-flex", padding: "0.6rem 1.2rem", fontSize: "0.85rem" }}>
                     <Download size={16} /> Export PDF Report
                   </button>
                 </div>
              )}

              {!agentActiveAction && (
                <div className="awaiting-action-placeholder">
                  <Terminal size={48} className="pulse-icon" />
                  <p>Awaiting active instruction... Trigger an automated agent action from the control panel to view dynamic audit reports.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
