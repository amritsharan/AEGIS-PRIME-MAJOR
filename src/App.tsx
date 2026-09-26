import { useState } from 'react'
import LoginPage from './components/LoginPage'
import LuminaAuth from './components/LuminaAuth'
import SynapseOS from './components/SynapseOS'
import AuditDrawer from './components/AuditDrawer'
import MeshFlowModal from './components/MeshFlowModal'
import { supabase } from './lib/supabase'

type Credentials = { userId: string; password: string }

export default function App() {
  const [phase, setPhase] = useState<'login' | 'lumina' | 'workspace'>('login')
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [isHoneypot, setIsHoneypot] = useState(false)
  const [auditOpen, setAuditOpen] = useState(false)
  const [meshFlowOpen, setMeshFlowOpen] = useState(false)
  const [activeModel, setActiveModel] = useState('synapse-free')

  async function handleSignOut() {
    await supabase.auth.signOut()
    setCredentials(null)
    setIsHoneypot(false)
    setPhase('login')
  }

  if (phase === 'login')
    return (
      <LoginPage
        onNext={(uid, pw, honeypot) => {
          setCredentials({ userId: uid, password: pw })
          setIsHoneypot(Boolean(honeypot))
          setPhase('workspace')
        }}
      />
    )

  if (phase === 'lumina')
    return <LuminaAuth credentials={credentials!} onAuthed={() => setPhase('workspace')} />

  return (
    <>
      <SynapseOS
        userId={credentials?.userId}
        isHoneypot={isHoneypot}
        activeModel={activeModel}
        onModel={setActiveModel}
        onAudit={() => setAuditOpen(true)}
        onMeshFlow={() => setMeshFlowOpen(true)}
        onSignOut={handleSignOut}
      />
      <AuditDrawer open={auditOpen} onClose={() => setAuditOpen(false)} />
      <MeshFlowModal open={meshFlowOpen} onClose={() => setMeshFlowOpen(false)} />
    </>
  )
}
