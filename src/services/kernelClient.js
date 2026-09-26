/**
 * Synapse-OS Kernel Client Service
 * Connects the UI to the Python FastAPI backend (/synapse-kernel)
 * Supports Phase 1 (Localhost: http://127.0.0.1:8000) and Phase 2 (Remote Campus Node)
 */

const getEnv = (key, fallback) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {
    // Ignore
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {
    // Ignore
  }
  return fallback;
};

const KERNEL_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? '' // Uses Vite /api proxy
  : getEnv('NEXT_PUBLIC_KERNEL_URL', 'http://127.0.0.1:8000');

const WS_BASE_URL = getEnv('NEXT_PUBLIC_WS_TELEMETRY', 'ws://127.0.0.1:8000/ws/telemetry');

export async function sendKernelChat(prompt, models = ['Llama-3 Local'], sessionToken = 'lumina-auth-default') {
  try {
    const res = await fetch(`${KERNEL_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        models,
        session_token: sessionToken,
      }),
    });

    if (!res.ok) {
      throw new Error(`Kernel error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[KernelClient] Live backend unavailable, using client-side fallback:', err.message);
    return null;
  }
}

export async function sendKernelForge(prompt, model = 'Llama-3 Local') {
  try {
    const res = await fetch(`${KERNEL_BASE_URL}/api/forge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
      }),
    });

    if (!res.ok) {
      throw new Error(`Kernel error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[KernelClient] Live forge backend unavailable:', err.message);
    return null;
  }
}

export async function verifyKernelAuth(agentUuid = 'agent-01', requestedUri = 'vfs://session/active') {
  try {
    const res = await fetch(`${KERNEL_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_uuid: agentUuid,
        requested_uri: requestedUri,
        permissions: 'READ_WRITE_ISOLATED',
      }),
    });

    if (!res.ok) throw new Error(`Auth verify error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[KernelClient] Live auth verify unavailable:', err.message);
    return null;
  }
}

export function connectKernelTelemetry(onData, onError) {
  try {
    const ws = new WebSocket(WS_BASE_URL);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onData) onData(data);
      } catch {
        // Ignore parse error
      }
    };

    ws.onerror = (err) => {
      if (onError) onError(err);
    };

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}
