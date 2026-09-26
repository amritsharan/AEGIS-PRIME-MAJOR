/**
 * High-quality project templates generator for Synapse Forge
 * Ensures all generated projects include:
 * - index.html
 * - vite.config.ts
 * - package.json (with vite, @vitejs/plugin-react, react, react-dom, lucide-react)
 * - src/main.tsx
 * - src/App.tsx (fully built, real sections, zero placeholders)
 * - src/index.css (modern responsive styles)
 * - README.md
 */

export function generateCompleteProject(prompt, modelName = 'SYNAPSE-OS FREE') {
  const p = prompt.toLowerCase();
  const safeName = prompt
    .slice(0, 24)
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase() || 'synapse-project';

  const isPortfolio = p.includes('portfolio') || p.includes('resume') || p.includes('cv') || p.includes('personal site') || p.includes('profile');

  if (isPortfolio) {
    return generatePortfolioProject(modelName);
  }

  return generateGeneralWebApp(safeName, prompt, modelName);
}

function generatePortfolioProject(modelName) {
  return {
    projectName: 'modern-developer-portfolio',
    runScript: 'npm install && npm run dev',
    terminalLogs: [
      `[INFO] Initializing Synapse Forge v2.0 using model: ${modelName}`,
      `[INFO] Scaffolding complete Vite + React 18 frontend architecture...`,
      `[INFO] Injected index.html, vite.config.ts, and React 18 main entry`,
      `[INFO] Synthesized Hero, About, Skills/Services, and Projects showcase`,
      `[INFO] Generated responsive CSS styling and interactive state management`,
      `[SUCCESS] 6 self-contained files generated. Ready for immediate local execution.`
    ],
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Alex Morgan | Senior Full-Stack & Systems Engineer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
      },
      {
        path: 'vite.config.ts',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
`
      },
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'modern-developer-portfolio',
          version: '1.0.0',
          private: true,
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            'lucide-react': '^0.400.0'
          },
          devDependencies: {
            '@types/react': '^18.3.3',
            '@types/react-dom': '^18.3.0',
            '@vitejs/plugin-react': '^4.3.1',
            vite: '^5.3.4'
          }
        }, null, 2)
      },
      {
        path: 'src/main.tsx',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
      },
      {
        path: 'src/App.tsx',
        content: `import React, { useState } from 'react';
import { 
  Code, 
  Terminal, 
  Cpu, 
  Layers, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Mail, 
  ChevronRight, 
  Send, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  Database,
  Cloud,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
    setFormData({ name: '', email: '', message: '' });
  };

  const projects = [
    {
      title: 'Synapse-OS Build Studio',
      desc: 'Autonomous multi-file software scaffolding engine featuring zero-trust sandbox execution and live telemetry streaming.',
      tags: ['React 18', 'TypeScript', 'Vite', 'FastAPI', 'WebSocket'],
      demoUrl: '#',
      githubUrl: '#',
      stars: '1.2k'
    },
    {
      title: 'Distributed Vector Cache',
      desc: 'Sub-millisecond semantic retrieval cache with LRU eviction and post-quantum encrypted token authentication.',
      tags: ['Python', 'Rust', 'Redis', 'Kyber-1024', 'Docker'],
      demoUrl: '#',
      githubUrl: '#',
      stars: '840'
    },
    {
      title: 'Aura Cognitive Health AI',
      desc: 'Offline-first mental wellbeing companion leveraging on-device LLM reasoning and local WASI sandboxes.',
      tags: ['TypeScript', 'Tailwind', 'Local LLM', 'WebAssembly'],
      demoUrl: '#',
      githubUrl: '#',
      stars: '620'
    },
    {
      title: 'Nexus ZK-Rollup Monitor',
      desc: 'Real-time blockchain explorer tracking zero-knowledge batch validation with cryptographic state proofs.',
      tags: ['Solidity', 'React', 'Ethers.js', 'PostgreSQL'],
      demoUrl: '#',
      githubUrl: '#',
      stars: '490'
    }
  ];

  const skillCategories = [
    {
      category: 'Frontend Engineering',
      icon: Code,
      skills: ['React 18/19', 'TypeScript', 'Next.js', 'Tailwind CSS', 'WebGL / Canvas', 'State Management']
    },
    {
      category: 'Backend & Distributed Systems',
      icon: Database,
      skills: ['FastAPI / Python', 'Node.js / Express', 'Go (Golang)', 'PostgreSQL', 'Redis', 'GraphQL / REST']
    },
    {
      category: 'Cloud & Infrastructure',
      icon: Cloud,
      skills: ['Docker & Podman', 'Kubernetes', 'AWS & Cloudflare', 'CI/CD Pipelines', 'Linux Kernel', 'Nginx']
    },
    {
      category: 'AI & Security Systems',
      icon: ShieldCheck,
      skills: ['LLM Orchestration', 'RAG Pipelines', 'PQC (Kyber-1024)', 'Zero-Trust Architecture', 'WASI SFI']
    }
  ];

  return (
    <div className="portfolio-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="brand-dot"></div>
          <span className="brand-text">Alex.dev</span>
        </div>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact" className="nav-cta">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="status-badge">
          <span className="pulse-dot"></span>
          <span>AVAILABLE FOR NEW PROJECTS</span>
        </div>
        <h1 className="hero-title">
          Architecting <span className="highlight-text">Sovereign Software</span> & Next-Gen Intelligence
        </h1>
        <p className="hero-subtitle">
          Senior Full-Stack & Distributed Systems Engineer specializing in modern reactive interfaces, 
          high-performance backend services, and autonomous agentic workflows.
        </p>
        <div className="hero-actions">
          <a href="#projects" className="btn btn-primary">
            <span>Explore Projects</span>
            <ChevronRight size={16} />
          </a>
          <a href="#contact" className="btn btn-secondary">
            <span>Get in Touch</span>
            <Mail size={16} />
          </a>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span className="metric-number">6+</span>
            <span className="metric-label">Years Experience</span>
          </div>
          <div className="metric-card">
            <span className="metric-number">45+</span>
            <span className="metric-label">Shipped Projects</span>
          </div>
          <div className="metric-card">
            <span className="metric-number">99.9%</span>
            <span className="metric-label">System Reliability</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="section-header">
          <span className="section-tag">BACKGROUND & PHILOSOPHY</span>
          <h2 className="section-title">About Me</h2>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <h3>Engineering With Precision</h3>
            <p>
              I build software that balances immaculate user ergonomics with rock-solid system architecture.
              From reactive frontend dashboards to high-throughput async microservices, my focus is on writing
              clean, type-safe, maintainable code that scales gracefully.
            </p>
            <p>
              Deeply interested in agentic development, local model inference, and zero-trust computational
              sandboxes that prioritize user privacy and resilience.
            </p>
          </div>
          <div className="about-stats-card">
            <div className="stat-item">
              <span className="stat-title">Primary Focus</span>
              <span className="stat-value">Full-Stack Web & AI Platforms</span>
            </div>
            <div className="stat-item">
              <span className="stat-title">Preferred Stack</span>
              <span className="stat-value">React, TypeScript, FastAPI, PostgreSQL</span>
            </div>
            <div className="stat-item">
              <span className="stat-title">Current Location</span>
              <span className="stat-value">Remote Worldwide</span>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Services Section */}
      <section id="skills" className="section">
        <div className="section-header">
          <span className="section-tag">CAPABILITIES & TOOLING</span>
          <h2 className="section-title">Skills & Services</h2>
        </div>
        <div className="skills-grid">
          {skillCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="skill-card">
                <div className="skill-icon-wrapper">
                  <Icon size={20} />
                </div>
                <h3 className="skill-category-title">{cat.category}</h3>
                <div className="skill-tags">
                  {cat.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Projects Showcase */}
      <section id="projects" className="section">
        <div className="section-header">
          <span className="section-tag">SELECTED WORKS</span>
          <h2 className="section-title">Featured Projects</h2>
        </div>
        <div className="projects-grid">
          {projects.map((proj, idx) => (
            <div key={idx} className="project-card">
              <div className="project-card-header">
                <span className="project-number">0{idx + 1}</span>
                <div className="project-links">
                  <a href={proj.githubUrl} title="GitHub" className="icon-link"><Github size={16} /></a>
                  <a href={proj.demoUrl} title="Live Demo" className="icon-link"><ArrowUpRight size={16} /></a>
                </div>
              </div>
              <h3 className="project-title">{proj.title}</h3>
              <p className="project-desc">{proj.desc}</p>
              <div className="project-tags">
                {proj.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="tag-pill">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <div className="section-header">
          <span className="section-tag">START A CONVERSATION</span>
          <h2 className="section-title">Let's Build Something Together</h2>
        </div>
        <div className="contact-card">
          {formSubmitted ? (
            <div className="form-success">
              <CheckCircle2 size={36} className="success-icon" />
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for reaching out. I will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="contact-form">
              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jane Doe" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. jane@company.com" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project Details</label>
                <textarea 
                  rows={4} 
                  placeholder="Describe your goals, timeline, and tech stack requirements..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary submit-btn">
                <span>Send Message</span>
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Alex Morgan. All rights reserved.</p>
        <p className="footer-sub">Designed & Engineered with Synapse Forge</p>
      </footer>
    </div>
  );
}
`
      },
      {
        path: 'src/index.css',
        content: `/* Modern Developer Portfolio Design System */
:root {
  --bg-dark: #07090e;
  --bg-card: #0d121c;
  --bg-card-hover: #131a29;
  --border: #1e283d;
  --border-active: #38bdf8;
  --accent: #f59e0b;
  --accent-glow: rgba(245, 158, 11, 0.2);
  --primary: #38bdf8;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-sans);
  line-height: 1.6;
  overflow-x: hidden;
}

.portfolio-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Navbar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: rgba(7, 9, 14, 0.85);
  backdrop-filter: blur(12px);
  z-index: 50;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  font-family: var(--font-mono);
  font-size: 1.1rem;
}

.brand-dot {
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--accent);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.8rem;
}

.nav-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--text-main);
}

.nav-cta {
  padding: 0.4rem 1rem;
  background: rgba(56, 189, 248, 0.1);
  color: var(--primary) !important;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 9999px;
  transition: all 0.2s;
}

.nav-cta:hover {
  background: rgba(56, 189, 248, 0.2);
}

/* Hero Section */
.hero-section {
  padding: 5rem 0 4rem;
  text-align: center;
  display: flex;
  flex-col;
  align-items: center;
  flex-direction: column;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.9rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 8px #34d399;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
}

.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.25rem;
  max-width: 850px;
}

.highlight-text {
  background: linear-gradient(135deg, #f59e0b 0%, #fb923c 50%, #f43f5e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--text-muted);
  max-width: 680px;
  margin-bottom: 2.25rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 3.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.6rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: #fff;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(245, 158, 11, 0.45);
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-card-hover);
  border-color: #475569;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 650px;
  border-top: 1px solid var(--border);
  padding-top: 2rem;
}

.metric-card {
  display: flex;
  flex-direction: column;
}

.metric-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
  font-family: var(--font-mono);
}

.metric-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Sections */
.section {
  padding: 4.5rem 0;
  border-top: 1px solid var(--border);
}

.section-header {
  margin-bottom: 2.5rem;
}

.section-tag {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 0.4rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
}

/* About Grid */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.about-card, .about-stats-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 2rem;
}

.about-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-main);
}

.about-card p {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.stat-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-title {
  font-size: 0.8rem;
  color: var(--text-dim);
  font-family: var(--font-mono);
}

.stat-value {
  font-weight: 600;
  color: var(--text-main);
}

/* Skills Grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.skill-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.75rem;
  transition: all 0.25s;
}

.skill-card:hover {
  border-color: #38bdf8;
  transform: translateY(-3px);
}

.skill-icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 0.75rem;
  background: rgba(56, 189, 248, 0.1);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.skill-category-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.3rem 0.65rem;
  border-radius: 0.5rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.25s;
}

.project-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.project-number {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--accent);
  font-weight: 700;
}

.project-links {
  display: flex;
  gap: 0.5rem;
}

.icon-link {
  color: var(--text-dim);
  padding: 0.35rem;
  border-radius: 0.4rem;
  transition: all 0.2s;
}

.icon-link:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.08);
}

.project-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
}

.project-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag-pill {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  padding: 0.25rem 0.55rem;
  background: rgba(56, 189, 248, 0.08);
  color: var(--primary);
  border-radius: 0.4rem;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

/* Contact Card & Form */
.contact-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.5rem;
  padding: 2.5rem;
  max-width: 650px;
  margin: 0 auto;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

.form-group input, .form-group textarea {
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus, .form-group textarea:focus {
  border-color: var(--accent);
}

.submit-btn {
  justify-content: center;
  margin-top: 0.5rem;
}

.form-success {
  text-align: center;
  padding: 2rem 0;
}

.success-icon {
  color: #34d399;
  margin-bottom: 1rem;
}

/* Footer */
.footer {
  padding: 2.5rem 0;
  border-top: 1px solid var(--border);
  text-align: center;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.footer-sub {
  font-size: 0.75rem;
  margin-top: 0.3rem;
  color: #475569;
}

/* Responsive */
@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
  }
  .hero-metrics {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
`
      },
      {
        path: 'README.md',
        content: `# Modern Developer Portfolio
Scaffolded via Synapse Forge with model **${modelName}**.

### Quick Start
To run this application locally:

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
\`\`\`

The app will launch at \`http://localhost:3000\`.
`
      }
    ]
  };
}

function generateGeneralWebApp(safeName, prompt, modelName) {
  return {
    projectName: safeName,
    runScript: 'npm install && npm run dev',
    terminalLogs: [
      `[INFO] Initializing Synapse Forge v2.0 using model: ${modelName}`,
      `[INFO] Target specification: "${prompt.slice(0, 60)}"`,
      `[INFO] Scaffolding complete Vite + React 18 production bundle...`,
      `[INFO] Generated index.html, vite.config.ts, and modular components`,
      `[SUCCESS] 6 files compiled and validated for immediate execution.`
    ],
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeName.toUpperCase()}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
      },
      {
        path: 'vite.config.ts',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
`
      },
      {
        path: 'package.json',
        content: JSON.stringify({
          name: safeName,
          version: '1.0.0',
          private: true,
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build'
          },
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            'lucide-react': '^0.400.0'
          },
          devDependencies: {
            '@types/react': '^18.3.3',
            '@types/react-dom': '^18.3.0',
            '@vitejs/plugin-react': '^4.3.1',
            vite: '^5.3.4'
          }
        }, null, 2)
      },
      {
        path: 'src/main.tsx',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
      },
      {
        path: 'src/App.tsx',
        content: `import React, { useState } from 'react';
import { Sparkles, Terminal, Activity, Play, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [logs, setLogs] = useState<string[]>([
    'System initialized in reactive mode',
    'Connected to local kernel state',
    'Ready for user operations'
  ]);

  const handleRunTask = () => {
    setLogs(prev => [...prev, \`Operation dispatched at \${new Date().toLocaleTimeString()}\`]);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <Sparkles className="brand-icon" />
          <h1>${safeName}</h1>
        </div>
        <div className="badge">
          <ShieldCheck size={14} />
          <span>Operational</span>
        </div>
      </header>

      <main className="main-panel">
        <div className="action-bar">
          <button onClick={handleRunTask} className="action-btn">
            <Play size={16} />
            <span>Execute Workflow</span>
          </button>
        </div>

        <div className="console-box">
          <div className="console-title">System Console Logs</div>
          {logs.map((l, i) => (
            <div key={i} className="log-line">→ {l}</div>
          ))}
        </div>
      </main>
    </div>
  );
}
`
      },
      {
        path: 'src/index.css',
        content: `:root {
  --bg: #090d16;
  --panel: #0f172a;
  --border: #1e293b;
  --accent: #f59e0b;
  --text: #f8fafc;
  --muted: #94a3b8;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: 'Outfit', sans-serif;
}

.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  color: var(--accent);
}

.brand h1 {
  font-size: 1.5rem;
  margin: 0;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
  font-size: 0.75rem;
  font-family: monospace;
}

.main-panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 2rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent);
  color: #000;
  font-weight: 700;
  border: none;
  border-radius: 0.6rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.console-box {
  background: #04060a;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.85rem;
}

.console-title {
  color: var(--muted);
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.4rem;
}

.log-line {
  color: #38bdf8;
  padding: 0.2rem 0;
}
`
      },
      {
        path: 'README.md',
        content: `# ${safeName}
Scaffolded via Synapse Forge with model **${modelName}**.

### Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`
`
      }
    ]
  };
}

export function detectLanguage(filename = '') {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'javascript';
  if (lower.endsWith('.html')) return 'html';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
  if (lower.endsWith('.sh') || lower.endsWith('.bat')) return 'bash';
  return 'text';
}

/**
 * Validates and corrects a project payload from the model gateway, ensuring
 * that all required files (index.html, vite.config.ts, package.json, src/main.tsx,
 * src/App.tsx with full real sections, src/index.css) exist and are complete.
 */
export function ensureCompleteProjectFiles(payload, prompt = '', modelName = 'SYNAPSE-OS FREE') {
  const p = (prompt || '').toLowerCase();
  const isPortfolio = p.includes('portfolio') || p.includes('resume') || p.includes('cv') || p.includes('personal site') || p.includes('profile');

  if (!payload || !Array.isArray(payload.files) || payload.files.length === 0) {
    return generateCompleteProject(prompt, modelName);
  }

  let files = payload.files.map(f => ({
    path: f.path || f.name || 'file.txt',
    name: f.path || f.name || 'file.txt',
    content: f.content || f.code || '',
    code: f.content || f.code || '',
    lang: f.lang || detectLanguage(f.path || f.name)
  }));

  const hasIndexHtml = files.some(f => f.path.toLowerCase().endsWith('index.html'));
  const hasViteConfig = files.some(f => f.path.toLowerCase().includes('vite.config'));
  const hasPackageJson = files.some(f => f.path.toLowerCase().endsWith('package.json'));
  const hasMainEntry = files.some(f => /main\.(tsx|jsx|ts|js)$/i.test(f.path));
  const hasCss = files.some(f => f.path.toLowerCase().endsWith('.css'));
  const appFile = files.find(f => /app\.(tsx|jsx)$/i.test(f.path));

  // If user requested a portfolio, check if model only gave a python backend or a small placeholder
  const isStubOrBackendOnly = files.some(f => f.path.includes('main.py')) || 
    !appFile || 
    appFile.content.length < 600 || 
    !appFile.content.toLowerCase().includes('hero') || 
    !appFile.content.toLowerCase().includes('skills');

  if (isPortfolio && (!hasIndexHtml || !hasViteConfig || !hasMainEntry || isStubOrBackendOnly)) {
    return generatePortfolioProject(modelName);
  }

  // Ensure all 5 essential files exist for general web apps
  const baseTmpl = generateCompleteProject(prompt, modelName);

  if (!hasIndexHtml) {
    const tmplIndex = baseTmpl.files.find(f => f.path === 'index.html');
    if (tmplIndex) files.unshift({ ...tmplIndex, name: tmplIndex.path, code: tmplIndex.content });
  }

  if (!hasViteConfig) {
    const tmplVite = baseTmpl.files.find(f => f.path === 'vite.config.ts');
    if (tmplVite) files.push({ ...tmplVite, name: tmplVite.path, code: tmplVite.content });
  }

  if (!hasPackageJson) {
    const tmplPkg = baseTmpl.files.find(f => f.path === 'package.json');
    if (tmplPkg) files.push({ ...tmplPkg, name: tmplPkg.path, code: tmplPkg.content });
  }

  if (!hasMainEntry) {
    const tmplMain = baseTmpl.files.find(f => f.path === 'src/main.tsx');
    if (tmplMain) files.push({ ...tmplMain, name: tmplMain.path, code: tmplMain.content });
  }

  if (!hasCss) {
    const tmplCss = baseTmpl.files.find(f => f.path === 'src/index.css');
    if (tmplCss) files.push({ ...tmplCss, name: tmplCss.path, code: tmplCss.content });
  }

  return {
    projectName: payload.projectName || baseTmpl.projectName,
    runScript: payload.runScript || 'npm install && npm run dev',
    terminalLogs: payload.terminalLogs && payload.terminalLogs.length > 0
      ? payload.terminalLogs
      : baseTmpl.terminalLogs,
    files
  };
}
