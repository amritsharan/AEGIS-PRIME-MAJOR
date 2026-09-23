/* ─── API Configuration ───────────────────────────────────── */
/* Grok Model Option (xAI) */
export const GROK_API_KEY = (import.meta.env.VITE_GROK_API_KEY as string | undefined) ?? ''
export const GROK_API_BASE = 'https://api.x.ai/v1'

/* Secondary OmniRoute Neural Gateway API (for operating all other models) */
export const OMNIROUTE_API_KEY = (import.meta.env.VITE_OMNIROUTE_API_KEY as string | undefined) ?? ''
export const OMNIROUTE_API_BASE = 'http://localhost:20128/v1'

export const OMNIROUTE_PROXY_BASE = '/omniroute/v1'

/* Local Ollama LLM Instance (for local execution) */
export const OLLAMA_API_BASE = 'http://localhost:11434/v1'
export const OLLAMA_PROXY_BASE = '/ollama/v1'

export const LOCAL_OLLAMA_MODELS: Record<string, string> = {
  'llama3-local': 'llama3.2:1b',
  'qwen-local': 'qwen2.5:0.5b',
  'smollm-local': 'smollm2:360m',
}

/* Backward compatibility */
export const AEGIS_API_KEY = GROK_API_KEY
export const AEGIS_API_BASE = GROK_API_BASE
export const OLLAMA_MODEL = 'llama3.2:1b'

export type ApiMessage = { role: 'system' | 'user' | 'assistant'; content: string }

/** Check if the selected model routes to local Ollama */
export function isLocalOllamaModel(modelId: string): boolean {
  if (LOCAL_OLLAMA_MODELS[modelId]) return true
  const lower = modelId.toLowerCase()
  return (
    lower.includes('llama') ||
    lower.includes('ollama') ||
    lower === 'qwen-local' ||
    lower.includes('smollm') ||
    lower.includes('smol')
  )
}

/** Backward compatibility */
export const isLlamaModel = isLocalOllamaModel

/** Check if the selected model routes to xAI Grok */
export function isGrokModel(modelId: string): boolean {
  const lower = modelId.toLowerCase()
  return lower.includes('grok') || lower === 'xai'
}

/** Helper to call local Ollama with automatic proxy/direct fallback */
async function fetchOllama(body: string): Promise<Response> {
  // First attempt: via Vite proxy
  try {
    const res = await fetch(`${OLLAMA_PROXY_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
    if (res.ok) return res
  } catch {
    /* fallback to direct */
  }

  // Second attempt: direct to local Ollama port 11434
  try {
    const res = await fetch(`${OLLAMA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
    return res
  } catch {
    throw new Error(
      'Local Ollama instance on port 11434 is not reachable. Ensure Ollama is running (`ollama serve`).'
    )
  }
}

/** Helper to call OmniRoute with automatic direct/proxy fallback */
async function fetchOmniRoute(body: string): Promise<Response> {
  // First attempt: direct to local gateway port 20128
  try {
    const res = await fetch(`${OMNIROUTE_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OMNIROUTE_API_KEY}`,
      },
      body,
    })
    if (res.ok || res.status < 500) {
      return res
    }
  } catch {
    /* fallback to proxy */
  }

  // Second attempt: via Vite proxy
  try {
    const res = await fetch(`${OMNIROUTE_PROXY_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OMNIROUTE_API_KEY}`,
      },
      body,
    })
    return res
  } catch {
    throw new Error(
      'OmniRoute Gateway on port 20128 is not reachable. Ensure omniroute is running.'
    )
  }
}

export async function* streamCompletion(
  messages: ApiMessage[],
  modelId: string,
): AsyncGenerator<string, void, unknown> {
  const isOllama = isLocalOllamaModel(modelId)
  const useGrok = isGrokModel(modelId)

  let res: Response

  if (isOllama) {
    /* 1. Local Ollama Model -> Local Ollama Instance (llama3.2:1b, qwen2.5:0.5b, smollm2:360m) */
    const ollamaModel =
      LOCAL_OLLAMA_MODELS[modelId] ??
      (modelId.includes('qwen')
        ? 'qwen2.5:0.5b'
        : modelId.includes('smol')
        ? 'smollm2:360m'
        : 'llama3.2:1b')

    const requestBody = JSON.stringify({
      model: ollamaModel,
      messages,
      stream: true,
      max_tokens: 2048,
    })
    res = await fetchOllama(requestBody)
  } else if (useGrok) {
    /* 2. Grok Model Option -> xAI API */
    const grokModel = modelId === 'grok-3-mini' ? 'grok-3-mini' : 'grok-3'
    res = await fetch(`${GROK_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'HTTP-Referer': 'https://aegis-prime.mesh',
        'X-Title': 'Aegis-Prime Synapse OS',
      },
      body: JSON.stringify({
        model: grokModel,
        messages,
        stream: true,
        max_tokens: 2048,
      }),
    })
  } else {
    /* 3. All Other Models -> Secondary API (OmniRoute) with sk-52e4897eef6ec3a2-c6b4a5-a7142476 */
    const requestBody = JSON.stringify({
      model: 'SYNAPSE-OS FREE',
      messages,
      stream: true,
      max_tokens: 2048,
    })
    res = await fetchOmniRoute(requestBody)
  }

  if (!res.ok) {
    let detail = ''
    try {
      const text = await res.text()
      try {
        const parsed = JSON.parse(text)
        detail = parsed.error?.message || parsed.error || parsed.message || text
      } catch {
        detail = text
      }
    } catch {
      /* ignore */
    }
    throw new Error(`API ${res.status}: ${detail.slice(0, 300) || res.statusText}`)
  }

  const reader = res.body!.getReader()
  const dec = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      // Skip comments or SSE keepalives like `: omniroute-keepalive` or `: x-omniroute-...`
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') return
      try {
        const chunk = JSON.parse(payload)
        const delta = chunk.choices?.[0]?.delta?.content
        if (delta) yield delta
      } catch {
        /* skip malformed SSE chunks */
      }
    }
  }
}
