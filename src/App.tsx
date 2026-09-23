import { useState } from 'react'
import LoginPage from './components/LoginPage'
import LuminaAuth from './components/LuminaAuth'
import SynapseOS from './components/SynapseOS'
import AuditDrawer from './components/AuditDrawer'
import { supabase } from './lib/supabase'

type Credentials = { userId: string; password: string }

export default function App() {
  const [phase, setPhase] = useState<'login' | 'lumina' | 'workspace'>('login')
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [auditOpen, setAuditOpen] = useState(false)
  const [activeModel, setActiveModel] = useState('synapse-free')

  async function handleSignOut() {
    await supabase.auth.signOut()
    setCredentials(null)
    setPhase('login')
  }

  if (phase === 'login')
    return (
      <LoginPage
        onNext={(uid, pw) => {
          setCredentials({ userId: uid, password: pw })
          setPhase('lumina')
        }}
      />
    )

  if (phase === 'lumina')
    return <LuminaAuth credentials={credentials!} onAuthed={() => setPhase('workspace')} />

  return (
    <>
      <SynapseOS
        activeModel={activeModel}
        onModel={setActiveModel}
        onAudit={() => setAuditOpen(true)}
        onSignOut={handleSignOut}
      />
      <AuditDrawer open={auditOpen} onClose={() => setAuditOpen(false)} />
    </>
  )
}
