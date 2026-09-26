import OpenAI from 'openai';

const omniRouteBaseUrl = process.env.OMNIROUTE_BASE_URL || 'http://localhost:20128/v1';
const omniRouteApiKey = process.env.OMNIROUTE_API_KEY || 'sk-52e4897eef6ec3a2-c6b4a5-a7142476';

const openai = new OpenAI({
  baseURL: omniRouteBaseUrl,
  apiKey: omniRouteApiKey,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    const comboModel = body.comboModel || process.env.OMNIROUTE_COMBO_MODEL || 'SYNAPSE-OS FREE';

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are Synapse Forge, an autonomous Principal Full-Stack Systems Architect.
Your task is to generate complete, self-contained, working, production-grade applications based on the user's prompt.
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

CRITICAL ARCHITECTURE REQUIREMENTS FOR ANY WEB/FRONTEND APPLICATION:
1. 'index.html': Valid HTML5 entry with viewport meta, fonts, '<div id="root"></div>', and script pointing to '/src/main.tsx'.
2. 'vite.config.ts': Valid Vite config importing and using '@vitejs/plugin-react'.
3. 'package.json': Valid JSON containing dependencies: 'react', 'react-dom', 'lucide-react', and devDependencies: 'vite', '@vitejs/plugin-react', '@types/react', '@types/react-dom'.
4. 'src/main.tsx': Valid React 18 createRoot entry mounting App into document.getElementById('root').
5. 'src/App.tsx': Complete, fully realized, responsive application with rich components and interactive state. NEVER use placeholders or empty divs.
   - If user asks for a Portfolio: You MUST build complete Hero (intro, title, CTA buttons), About (background, philosophy, stats), Skills/Services (categorized with icons), Projects (cards with descriptions, tags, demo/github links), Contact Form, and Footer.
6. 'src/index.css': Complete modern styling (typography, responsive layouts, glassmorphism cards, button hovers, smooth animations).
7. 'README.md': Setup and execution guide.`;

    let parsedPayload = null;

    try {
      const completion = await openai.chat.completions.create({
        model: comboModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Build a complete application for: ${prompt}` }
        ],
        response_format: { type: 'json_object' }
      });

      const responseContent = completion.choices?.[0]?.message?.content;
      if (responseContent) {
        try {
          parsedPayload = JSON.parse(responseContent);
        } catch {
          const match = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          parsedPayload = JSON.parse(match ? match[1] : responseContent);
        }
      }
    } catch (err: any) {
      console.warn('[Forge Route Bridge] Gateway request error:', err?.message);
    }

    // Verify critical web files exist in payload, otherwise augment/correct with complete template
    const { ensureCompleteProjectFiles } = await import('../../src/services/forgeProjectTemplates');
    parsedPayload = ensureCompleteProjectFiles(parsedPayload, prompt, comboModel);

    return new Response(JSON.stringify(parsedPayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[Forge Route Handler Error]:', error);
    const { generateCompleteProject } = await import('../../src/services/forgeProjectTemplates');
    const fallback = generateCompleteProject('web application', 'SYNAPSE-OS FREE');
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
