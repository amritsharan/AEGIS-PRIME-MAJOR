# 🚀 Synapse-OS: Quick Run Guide & Commands

Whenever you want to run this project, you need **two services running**:
1. **OmniRoute Neural Gateway** (Port 20128) - Powers the agentic AI inference, Forge code generation, and Model Mixer consensus.
2. **Synapse-OS Frontend** (Port 5173 / 5174) - The React 19 + Vite web interface.

---

## ⚡ Option 1: One-Click Automatic Start (Fastest)

Double-click the included batch script in the root directory:
```cmd
start.bat
```
*Or in PowerShell:*
```powershell
.\start.ps1
```
This automatically sets up your Node.js PATH and opens both services in separate terminal windows.

---

## 🛠️ Option 2: Run Manually in Two Terminals

### 🟢 Terminal 1: Start OmniRoute Neural Gateway
Open a PowerShell terminal and run:

```powershell
# 1. Ensure Node.js and global npm binaries are in PATH
$env:Path = "C:\Users\KUSHAL N\AppData\Local\Author Software\nvm\.nodejs;C:\Users\KUSHAL N\AppData\Local\Author Software\nvm;C:\Users\KUSHAL N\AppData\Roaming\npm;" + $env:Path

# 2. Configure OmniRoute environment
$env:CLAUDE_CONFIG_DIR = "$HOME\.claude-omniroute"
$env:ANTHROPIC_BASE_URL = "http://localhost:20128"
$env:ANTHROPIC_AUTH_TOKEN = "sk-52e4897eef6ec3a2-c6b4a5-a7142476"
$env:ANTHROPIC_MODEL = "SYNAPSE-OS FREE"

# 3. Launch OmniRoute
omniroute
```

> **Note:** OmniRoute will start and listen on `http://localhost:20128/`. Keep this terminal open.

---

### 🟢 Terminal 2: Start Synapse-OS Frontend
Open a second PowerShell terminal in this project folder (`d:\synapse-os-frontend--main`) and run:

```powershell
# 1. Ensure Node.js and npm are in PATH
$env:Path = "C:\Users\KUSHAL N\AppData\Local\Author Software\nvm\.nodejs;C:\Users\KUSHAL N\AppData\Local\Author Software\nvm;C:\Users\KUSHAL N\AppData\Roaming\npm;" + $env:Path

# 2. (Optional, only needed once if dependencies change)
# npm install

# 3. Launch the Vite Dev Server
npm run dev
```

> **Note:** The server will output a URL like `http://localhost:5173/` or `http://localhost:5174/`.  
> Open that URL in your browser to use Synapse-OS!

---

## 🌐 Option 3: Share Access with Teammates (via Ngrok)

To generate a secure, public HTTPS link that your teammates can access from anywhere:

### Method A: One-Click Tunnel (Fastest)
Double-click:
```cmd
tunnel.bat
```
This automatically detects whether Synapse-OS is on port 5173 or 5174 and outputs your teammate access link:
```
🚀 PUBLIC SHARE LINK FOR TEAMMATES:
👉 https://xxxx-xx-xx-xx.ngrok-free.app
```

### Method B: Via npm command
In your project terminal, run:
```bash
npm run tunnel
```

### Method C: Direct Ngrok Command
```bash
ngrok http 5174
```

> **Note for Teammates:**
> When your teammates open the `https://xxxx.ngrok-free.app` link for the first time, Ngrok will show a standard one-time prompt: **"Visit Site"**. Tell them to click **"Visit Site"**, and Synapse-OS will load immediately with live AI features and Forge builders working!

---

## 📋 Common Commands Reference

| Action | Command |
| :--- | :--- |
| **Install dependencies** | `npm install` |
| **Start dev server** | `npm run dev` |
| **Share with teammates (Ngrok)** | `npm run tunnel` *or* `tunnel.bat` |
| **Direct Ngrok command** | `ngrok http 5174` |
| **Build for production** | `npm run build` |
| **Preview production build** | `npm run preview` |
| **Run linter** | `npm run lint` |
| **Start OmniRoute Gateway** | `omniroute` |

---

## 💡 Troubleshooting

- **Error:** `'npm' is not recognized as an internal or external command`  
  **Fix:** Run this line in your terminal before running `npm`:  
  ```powershell
  $env:Path = "C:\Users\KUSHAL N\AppData\Local\Author Software\nvm\.nodejs;C:\Users\KUSHAL N\AppData\Local\Author Software\nvm;C:\Users\KUSHAL N\AppData\Roaming\npm;" + $env:Path
  ```

- **Ngrok "Host Header Not Allowed":**  
  Already handled! `vite.config.js` has been pre-configured with `server.host: true` and `server.allowedHosts: true` so ngrok connections are never blocked.

- **Port in use:**  
  Vite automatically detects if port `5173` is busy and selects `5174`. Check the terminal output for the exact active URL.
