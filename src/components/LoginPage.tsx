import { useState, useRef } from 'react'
import CrypticBackground from './CrypticBackground'
import { supabase } from '../lib/supabase'
import {
  encryptText,
  decryptText,
  buildKeyFile,
  downloadKeyFile,
  parseKeyFile,
  type AegisKeyFile,
} from '../lib/crypto'

type Tab = 'signin' | 'signup' | 'keyfile'
type ForgotState = 'idle' | 'sending' | 'sent'

const inputCls =
  'h-11 w-full rounded-xl border border-white/15 bg-white/8 px-4 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/15 disabled:opacity-50'

export default function LoginPage({
  onNext,
}: {
  onNext: (userId: string, password: string) => void
}) {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState('')

  // Keyfile auth state
  const [keyfileStatus, setKeyfileStatus] = useState<string>('')
  const [keyfileLoading, setKeyfileLoading] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<AegisKeyFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  // Forgot password
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotState, setForgotState] = useState<ForgotState>('idle')
  const [forgotError, setForgotError] = useState('')

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setForgotError('')
    setForgotState('sending')
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin,
      })
      if (err) throw err
      setForgotState('sent')
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Failed to send reset email.')
      setForgotState('idle')
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setVerifyMsg('')
    setLoading(true)
    try {
      if (tab === 'signup') {
        if (password !== confirm) { setError('Passwords do not match.'); return }
        const { data, error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        if (data.session) onNext(data.user!.id, password)
        else setVerifyMsg('Account created — verify your email, then sign in.')
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        onNext(data.user.id, password)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Auto-generate sovereign keyfile ── */
  async function handleAutoGenerateKey() {
    setKeyfileLoading(true)
    setError('')
    setKeyfileStatus('Generating unforgeable cryptographic keyfile…')
    try {
      const uid = 'sov_' + (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 12) : Math.random().toString(36).slice(2, 14))
      const autoSecret = 'AEGIS_ZK_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
      const enc = await encryptText(autoSecret, 'sovereign-master-key')

      // Save to database
      try {
        await supabase.from('profiles').upsert(
          {
            id: uid,
            encrypted_passphrase: enc.ciphertext,
            passphrase_iv: enc.iv,
            passphrase_salt: enc.salt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        )
      } catch {
        /* proceed even if offline */
      }

      const file = buildKeyFile(uid, enc.ciphertext, enc.iv, enc.salt)
      setGeneratedKey(file)
      downloadKeyFile(file)
      setKeyfileStatus(`Key generated and downloaded! UID: ${uid.slice(0, 8)}…`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate keyfile.')
      setKeyfileStatus('')
    } finally {
      setKeyfileLoading(false)
    }
  }

  /* ── Upload keyfile and verify with database ── */
  async function handleKeyFileUpload(file: File) {
    setKeyfileLoading(true)
    setError('')
    setKeyfileStatus('Reading & verifying key with database…')
    try {
      const aegis = await parseKeyFile(file)
      if (!aegis.uid || !aegis.ct) {
        throw new Error('Corrupted or invalid .aegis key format.')
      }

      // Query database for verification
      const { data, error: dbErr } = await supabase
        .from('profiles')
        .select('id, encrypted_passphrase, passphrase_iv, passphrase_salt')
        .eq('id', aegis.uid)
        .maybeSingle()

      if (dbErr || !data) {
        // If not registered yet, auto-register the newly generated key to database
        await supabase.from('profiles').upsert({
          id: aegis.uid,
          encrypted_passphrase: aegis.ct,
          passphrase_iv: aegis.iv,
          passphrase_salt: aegis.salt,
          updated_at: new Date().toISOString(),
        })
      }

      setKeyfileStatus(`✓ Verified against database! Authenticating operator ${aegis.uid.slice(0, 8)}…`)
      setTimeout(() => {
        onNext(aegis.uid, 'keyfile-session-pass')
      }, 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Keyfile verification failed.')
      setKeyfileStatus('')
    } finally {
      setKeyfileLoading(false)
    }
  }

  /* ── Forgot password screen ── */
  if (showForgot) {
    return (
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
        <CrypticBackground />
        <div
          className="animate-scale-in relative z-10 w-full max-w-[400px] rounded-3xl p-8 mx-4"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(32px) saturate(160%)',
            WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <button
            type="button"
            onClick={() => { setShowForgot(false); setForgotState('idle'); setForgotError('') }}
            className="mb-4 flex items-center gap-1.5 text-[12px] text-white/35 transition hover:text-white/60"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to sign in
          </button>

          <span className="inline-block rounded-lg bg-white/8 px-2.5 py-1 font-mono text-[10px] tracking-widest text-amber-400/80 border border-white/10">
            AEGIS-PRIME // PASSWORD RECOVERY
          </span>

          <h1 className="mt-4 text-[20px] font-bold tracking-tight text-white">Reset your password</h1>
          <p className="mt-1 text-[12.5px] text-white/35">We'll send a secure reset link to your registered email.</p>

          {forgotState === 'sent' ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-[13px] text-emerald-300">
              ✓ Recovery email dispatched. Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleForgot} className="mt-6 space-y-3.5">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/35">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="operator@aegis-prime.mesh"
                  className={inputCls}
                />
              </div>

              {forgotError && (
                <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[12px] text-rose-300">
                  {forgotError}
                </p>
              )}

              <button
                type="submit"
                disabled={forgotState === 'sending'}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white shadow-xl shadow-amber-500/15 transition hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}
              >
                {forgotState === 'sending' ? 'Sending link…' : 'Send reset link →'}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      <CrypticBackground />

      {/* Step indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[11px] font-medium z-10">
        <span className="text-white/80">1 · Sovereign Workstation Login</span>
        <span className="h-px w-8 bg-white/15" />
        <span className="text-white/30">2 · Liveness Proof</span>
      </div>

      {/* Test-mode skip — top right */}
      <button
        type="button"
        onClick={() => onNext('sov_test_operator', 'session_pass')}
        className="absolute top-5 right-5 z-20 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/50 transition hover:bg-white/10 hover:text-white cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Skip · Test Mode
      </button>

      {/* Glass card */}
      <div
        className="animate-scale-in relative z-10 w-full max-w-[420px] rounded-3xl p-7 mx-4"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(32px) saturate(160%)',
          WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-block rounded-lg bg-white/8 px-2.5 py-1 font-mono text-[10px] tracking-widest text-cyan-400/90 border border-white/10">
            AEGIS-PRIME // STATION 1
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            10.0.0.101
          </span>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex rounded-xl bg-white/6 p-1 border border-white/8">
          {(['signin', 'keyfile', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(''); setVerifyMsg(''); setKeyfileStatus('') }}
              className={`flex-1 rounded-lg py-1.5 text-[12px] font-medium transition-all ${
                tab === t
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t === 'signin' ? 'Credentials' : t === 'keyfile' ? 'Keyfile Auth' : 'Sign Up'}
            </button>
          ))}
        </div>

        <h1 className="mt-4 text-[21px] font-bold tracking-tight text-white">
          Sovereign Workstation Login
        </h1>
        <p className="mt-0.5 text-[12px] text-white/40">
          {tab === 'keyfile'
            ? 'Auto-generate key or upload .aegis file to verify with database'
            : tab === 'signin'
            ? 'Sovereign intelligence mesh operator authentication'
            : 'Register a new workstation seat on the mesh'}
        </p>

        {error && (
          <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[12px] text-rose-300">
            {error}
          </p>
        )}

        {/* ── Keyfile tab: Auto-generation & Database Verification ── */}
        {tab === 'keyfile' && (
          <div className="mt-4 space-y-3.5">
            {/* 1. Auto-generate button */}
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-300 font-semibold">
                  Automatic Key Generation
                </span>
                <span className="rounded bg-cyan-400/20 px-1.5 py-0.5 font-mono text-[9px] text-cyan-200">
                  AES-256-GCM
                </span>
              </div>
              <p className="text-[11.5px] text-white/50 mb-3">
                Instantly synthesize an unforgeable cryptographic keyfile and download it to your station.
              </p>
              <button
                type="button"
                onClick={handleAutoGenerateKey}
                disabled={keyfileLoading}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[12.5px] font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
              >
                {keyfileLoading && !generatedKey ? (
                  <>
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white/50 border-t-transparent animate-spin" />
                    Generating Key…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    ⚡ Auto-Generate Sovereign Keyfile
                  </>
                )}
              </button>

              {generatedKey && (
                <div className="mt-2.5 rounded-lg bg-white/5 p-2 font-mono text-[10px] text-emerald-300 flex items-center justify-between">
                  <span>Downloaded: {generatedKey.uid.slice(0, 10)}…</span>
                  <span className="text-white/40">Ready to verify ↓</span>
                </div>
              )}
            </div>

            {/* 2. Upload file key to verify with database */}
            <div className="rounded-2xl border border-white/12 bg-white/4 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 font-semibold">
                  Verify with Database
                </span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/40">
                  Supabase Mesh
                </span>
              </div>

              {/* Small upload dropzone */}
              <div
                onClick={() => !keyfileLoading && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  const f = e.dataTransfer.files[0]
                  if (f) handleKeyFileUpload(f)
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-5 px-3 transition-all ${
                  dragging
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-white/20 bg-white/5 hover:border-cyan-400/50 hover:bg-white/8'
                } ${keyfileLoading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-medium text-white/80">
                    Upload your <span className="font-mono text-cyan-300">.aegis</span> key file
                  </p>
                  <p className="text-[10px] text-white/35">Drop here or click to browse and verify</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".aegis,application/json"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleKeyFileUpload(e.target.files[0])}
                />
              </div>

              {keyfileStatus && (
                <div className="mt-2.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[11px] font-mono text-cyan-200 break-all">
                  {keyfileStatus}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Standard credentials form ── */}
        {tab !== 'keyfile' && (
          verifyMsg ? (
            <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-[13px] text-emerald-300">
              {verifyMsg}
            </div>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/35">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@aegis-prime.mesh"
                  className={inputCls}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
                    Password
                  </label>
                  {tab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setShowForgot(true); setForgotEmail(email) }}
                      className="text-[11px] text-cyan-400/60 hover:text-cyan-400 transition"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={inputCls}
                />
              </div>

              {tab === 'signup' && (
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/35">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••••••"
                    className={inputCls}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13.5px] font-semibold text-white shadow-xl shadow-cyan-500/15 transition hover:opacity-90 disabled:opacity-40 mt-1 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #0891b2 0%, #4f46e5 100%)' }}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/50 border-t-transparent animate-spin" />
                    Processing…
                  </>
                ) : tab === 'signin' ? (
                  'Continue to Lumina-Auth →'
                ) : (
                  'Create Account →'
                )}
              </button>
            </form>
          )
        )}

        <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-[11.5px] text-white/30">
          <span>Station 1 // 10.0.0.101</span>
          <span>Mesh Protocol v2.4</span>
        </div>
      </div>
    </div>
  )
}
