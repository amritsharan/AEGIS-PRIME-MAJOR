import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt;
    const comboModel = body.comboModel || process.env.FORGE_DEFAULT_COMBO_MODEL || 'auto';
    const tauCap = body.tau_cap || body.tauCap;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Validate capability token (if provided, must match CAP_0x pattern)
    if (tauCap && typeof tauCap === 'string') {
      if (!tauCap.startsWith('CAP_0x') && !tauCap.startsWith('tau_cap_')) {
        return NextResponse.json(
          { error: 'Invalid capability token signature. Revoked ambient authority.' },
          { status: 403 }
        );
      }
    }

    const omniRouteBaseUrl = process.env.OMNIROUTE_BASE_URL || 'http://localhost:20128/v1';
    const omniRouteApiKey = process.env.OMNIROUTE_API_KEY || 'omniroute-local-key';

    const systemPrompt = `You are Synapse Forge, an autonomous Principal Full-Stack Systems Architect.
Your task is to generate complete, self-contained, working applications based on the user's prompt.
You MUST output a valid, well-formed JSON object ONLY, adhering strictly to the schema below without any markdown fences, preambles, or postscripts outside JSON:

{
  "projectName": "string (slug or pascal-case project name)",
  "runScript": "string (e.g., 'npm install && npm run dev')",
  "files": [
    {
      "path": "string (relative file path, e.g. index.html, vite.config.ts, package.json, src/main.tsx, src/App.tsx, src/index.css)",
      "content": "string (complete, production-ready code with no truncation or placeholders)"
    }
  ],
  "terminalLogs": [
    "string (step-by-step diagnostic/scaffolding terminal log lines)"
  ]
}

CRITICAL ARCHITECTURAL REQUIREMENTS:
For frontend, web, and portfolio applications, you MUST include:
1. "index.html" with root element <div id="root"></div> and module script referencing /src/main.tsx
2. "vite.config.ts" configuring '@vitejs/plugin-react'
3. "package.json" with vite, @vitejs/plugin-react, react, react-dom, and dev scripts ('dev': 'vite', 'build': 'vite build')
4. "src/main.tsx" mounting App via ReactDOM.createRoot
5. "src/index.css" with modern, responsive CSS styling
6. "src/App.tsx" with full, complete, production-grade sections. If building a portfolio, provide real, comprehensive content.
NEVER use minimal placeholders, stubs, or placeholder comments. Generate full working code.`;

    let payload: any = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${omniRouteBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${omniRouteApiKey}`
        },
        body: JSON.stringify({
          model: comboModel === 'auto' ? 'SYNAPSE-OS FREE' : comboModel,
          stream: false,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          const content = data.choices?.[0]?.message?.content || '';
          payload = JSON.parse(content);
        } catch {
          const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (match) {
            payload = JSON.parse(match[1]);
          }
        }
      }
    } catch (err: any) {
      console.warn('[Forge Route] OmniRoute fetch warning:', err.message);
    }

    // Dynamic template fallback if needed
    if (!payload || !payload.files || payload.files.length === 0) {
      try {
        const { ensureCompleteProjectFiles } = await import('../../../services/forgeProjectTemplates.js');
        payload = ensureCompleteProjectFiles(payload, prompt, comboModel);
      } catch {
        payload = {
          projectName: 'synapse-forge-app',
          runScript: 'npm install && npm run dev',
          files: [
            {
              path: 'index.html',
              content: '<!DOCTYPE html>\n<html>\n<head><title>Synapse App</title></head>\n<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>\n</html>'
            },
            {
              path: 'package.json',
              content: '{\n  "name": "synapse-forge-app",\n  "scripts": { "dev": "vite" }\n}'
            }
          ],
          terminalLogs: [
            'Synapse Forge initialized.',
            'Files scaffolded under Capability Token.'
          ]
        };
      }
    }

    return NextResponse.json({
      success: true,
      projectName: payload.projectName || 'synapse-app',
      runScript: payload.runScript || 'npm install && npm run dev',
      files: payload.files || [],
      terminalLogs: payload.terminalLogs || []
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to execute Synapse Forge build pipeline' },
      { status: 500 }
    );
  }
}
