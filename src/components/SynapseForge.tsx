import SynapseForgeStudio from './SynapseForge.jsx'

export default function SynapseForge({
  activeModel,
  activeModelId,
  onClose,
}: {
  activeModel?: string
  activeModelId?: string
  onClose: () => void
}) {
  return <SynapseForgeStudio onClose={onClose} activeModelId={activeModel || activeModelId || 'synapse-os-free'} />
}
