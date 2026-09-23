# Aegis-Prime — Sovereign Intelligence Mesh UI

## Context
The scaffold is bare (`src/App.tsx` renders an empty centered div; `src/index.css` only imports Tailwind v4). The attached PDF is the *Aegis-Prime* architecture spec — it grounds the domain vocabulary (Lumina-Auth ZK identity, Synapse-OS Wasm microkernel, Cypher-Shield ML-KEM-768 post-quantum transport, Zenith-Mesh Substrate Proof-of-Agency ledger, ISCWP wire protocol, EADC Shannon-entropy gate, Z3 SMT logic shield, atomic kill-switch). The brief asks for a complete, production-grade **light-theme** UI/UX system across four desktop application frames, with the minimalist high-clarity aesthetic of ChatGPT/Notion. The user only ever touches Lumina-Auth (login) and Synapse-OS (chat workspace + Forge builder); the crypto/blockchain kernel appears strictly as clean status badges and collapsible drawer inspectors.

## Approach
Build a single-page React app in `src/App.tsx` that switches between the auth screen and the workspace, with the Forge and Audit drawers overlaid on the workspace. Use strict design tokens, Tailwind utilities, and small internal components. Preserve the existing entrypoint (`main.tsx` → `App.tsx`, `index.css`).

### Design system / tokens (`src/index.css`)
- Wire fonts via Google Fonts CSS2 `@import` (before other statements): **Inter** (UI) + **JetBrains Mono** (code/hashes). Set `-apple-system` fallback stack.
- Define CSS custom properties for the strict palette: canvas `#FFFFFF`, surface `#F9FAFB`, hairline `#E5E7EB`, ink `#111827`, slate `#6B7280`, mono ink `#374151`; accents — emerald `#059669`/`#ECFDF5`, indigo `#4F46E5`/`#EEF2FF`, coral `#F43F5E`/`#FFF1F2`, ruby `#DC2626`/`#FEF2F2`. Reference tokens everywhere; no scattered hex.
- Add the faint 24px dot-grid background utility for the auth canvas.
- No unlayered universal reset.

### Structure (componentized within `src/`)
Split into files under `src/components/` for clarity:
- `App.tsx` — top-level state: `phase` (`auth` | `workspace`), `forgeOpen`, `auditOpen`, `activeModel`, `authState`. Renders `LuminaAuth` or `SynapseOS`.
- **Screen 1 — `LuminaAuth.tsx`**: dot-grid canvas, centered 420px card (rounded-16, hairline border, soft shadow); header capsule "Aegis-Prime // Zero-Knowledge Gate"; title/subtitle; animated 56px hairline emerald **liveness ring** with an SVG/CSS keystroke-waveform animation (Tf/Td sampling); 48px passphrase input with focus ring + FIDO2/YubiKey accessory icon; full-width dark primary button `Verify & Mint Capability Token` that transitions to emerald success pill `ZK Proof Validated (TTL: 30s)` then advances to the workspace.
- **Screen 2 — `SynapseOS.tsx`**: 3-column layout.
  - `NavRail.tsx` (260px, surface, right hairline): "Aegis Workstation" title + profile + green "zk-Session Live" dot; "+ New Conversation" pill; segmented model switcher `[Local CPU (AirLLM)] [Cloud Sandbox] [Consensus Mixer]`; recent conversations list with hover; bottom hardware dock pill "Node 2 (AVX-512) | RAM: 4.8 GB / 16 GB".
  - Center stream (max-w 768px): 52px sticky header with breadcrumb (left), emerald "ML-KEM-768 Lattice Secured" pill (center), icon actions Forge / Audit Ledger / ruby Kill-Switch (right). Message stream: right-aligned zinc user bubbles; left-aligned assistant markdown with a syntax-highlighted code block; **uncertainty markers** — coral dotted underline on high-entropy words with hover popover "Model Uncertainty: 42% — Verified via Z3 SMT Axioms"; monospace crypto footer "Proof-of-Agency #Block 4,821 [Verified]" + external-link icon.
  - Floating input container (bottom-centered, rounded-16, hairline, floating shadow): textarea placeholder "Message Synapse-OS or request application scaffold..."; left vfs:// attach icon; right model quick-toggle + dark circular send button.
- **Screen 3 — `SynapseForge.tsx`**: right slide-over (460px) over a slightly blurred workspace; header title + emerald "Wasm SFI Sandboxed (512MB RAM Limit)" pill + close X; collapsible VFS folder tree (project-root → frontend/src/App.tsx, backend/main.py, README.md, run.bat, run.sh) with selection opening a monospace code preview with line numbers; build/verification terminal pane (surface bg, JetBrains Mono 11px, the four log lines with agent/build/verify/ready); bottom pinned full-width dark `↓ DOWNLOAD PROJECT .ZIP` button + micro-caption.
- **Screen 4 — `AuditDrawer.tsx`**: slide-over/sheet; header "Zenith-Mesh Proof-of-Agency Ledger" + Substrate block height #Block 4,821; monospace state-root card (Merkle-Patricia root `0x9b3e...004f`); minimalist extrinsics table (Timestamp | Intent Digest τ_audit | Tool URI | ZK-Proof Root | Consensus Status) with emerald "Finalized" statuses; canary card "0 Perimeter Breaches Detected" green badge.
- `ui.tsx` — shared primitives: `Pill`/`Badge` (emerald/indigo/coral/ruby variants), `IconButton`, `Drawer` shell (right slide-over w/ backdrop blur + close), inline SVG icons. Keep interactive states (default/hover/focus/active) via Tailwind variants.

### Interactivity
- Auth button runs a short validating→success sequence, then reveals workspace.
- Forge and Audit open/close as overlays with backdrop blur; Kill-Switch shows a ruby confirm affordance.
- Model switcher and file-tree selection are stateful; send button appends the typed message.

## Aesthetic
Before writing UI, invoke `Skill('make:aesthetic-stance')` (no Make Kit present) and issue `create_make_theme` with a 1–2 sentence request describing the ChatGPT/Notion light-mode sovereign-intelligence console, then apply its guidance within the strict palette above (the brief's tokens take precedence over generic suggestions).

## Files
- Edit: `src/App.tsx`, `src/index.css`
- New: `src/components/{LuminaAuth,SynapseOS,NavRail,SynapseForge,AuditDrawer,ui}.tsx`

## Verification
- Rely on Vite hot reload (dev server already running on `$PORT`); load the preview and confirm each screen: auth success transition into workspace, chat stream with uncertainty popover + crypto footer, Forge drawer file preview + terminal + download bar, Audit drawer ledger table + canary card.
- Check the browser console via `figma logs` only if a concrete rendering error appears.
- Confirm responsive reflow: 3-column collapses gracefully below ~1024px (nav rail becomes top strip / hidden), drawers go full-width on narrow viewports.
