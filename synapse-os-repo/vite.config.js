import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function forgeBridgePlugin() {
  return {
    name: 'forge-bridge-plugin',
    configureServer(server) {
      server.middlewares.use('/api/forge', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        let rawBody = '';
        req.on('data', chunk => { rawBody += chunk; });
        req.on('end', async () => {
          try {
            const body = JSON.parse(rawBody || '{}');
            const prompt = body.prompt;
            const comboModel = body.comboModel || process.env.FORGE_DEFAULT_COMBO_MODEL || 'auto';
            const tauCap = body.tau_cap || body.tauCap;

            if (!prompt) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Prompt is required' }));
            }

            if (tauCap && typeof tauCap === 'string' && !tauCap.startsWith('CAP_0x') && !tauCap.startsWith('tau_cap_')) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Invalid capability token signature.' }));
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
6. "src/App.tsx" with full, complete, production-grade sections. If building a portfolio, provide real, comprehensive content for:
   - Hero / Introduction with headline, bio, and call-to-action
   - About section with background & engineering philosophy
   - Skills / Services matrix across frontend, backend, and cloud
   - Project Showcase with rich project cards, tech stack tags, and links
   - Interactive Contact form and social links
   - Professional Footer
NEVER use minimal placeholders, stubs, or placeholder comments. Generate full working code.`;

            let payload = null;

            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 12000);

              const response = await fetch(`${omniRouteBaseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${omniRouteApiKey}`
                },
                body: JSON.stringify({
                  model: 'SYNAPSE-OS FREE',
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
                let content = '';
                try {
                  const data = JSON.parse(text);
                  content = data.choices?.[0]?.message?.content || '';
                } catch {
                  const lines = text.split('\n');
                  for (const line of lines) {
                    if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                      try {
                        const chunk = JSON.parse(line.slice(6));
                        content += chunk.choices?.[0]?.delta?.content || chunk.choices?.[0]?.message?.content || '';
                      } catch {}
                    }
                  }
                }

                if (content) {
                  try {
                    payload = JSON.parse(content);
                  } catch {
                    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                    payload = JSON.parse(match ? match[1] : content);
                  }
                }
              }
            } catch (gwErr) {
              console.warn('[Vite Forge Bridge] Inference notice:', gwErr.message);
            }

            const { ensureCompleteProjectFiles } = await import('./src/services/forgeProjectTemplates.js');
            payload = ensureCompleteProjectFiles(payload, prompt, comboModel);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(payload));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), forgeBridgePlugin()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/omniroute': {
        target: 'http://127.0.0.1:20128',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/omniroute/, '')
      },
      '/lumina': {
        target: 'http://127.0.0.1:9100',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lumina/, '')
      },
      '/cypher': {
        target: 'http://127.0.0.1:9200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cypher/, '')
      },
      '/zenith': {
        target: 'http://127.0.0.1:9944',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zenith/, '')
      },
      '/synapse': {
        target: 'http://127.0.0.1:9300',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/synapse/, '')
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true
      }
    }
  }
})


