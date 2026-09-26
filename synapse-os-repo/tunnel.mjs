import { spawn } from 'child_process';

// Determine active Vite port (checks 5174 then 5173)
async function findActivePort() {
  for (const port of [5174, 5173]) {
    try {
      const res = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(1000) });
      if (res.ok || res.status < 500) {
        return port;
      }
    } catch {}
  }
  return 5174; // default
}

async function startTunnel() {
  const port = await findActivePort();

  console.log('\n======================================================');
  console.log('       🌐 SYNAPSE-OS NGROK TEAM ACCESS TUNNEL');
  console.log('======================================================\n');
  console.log(`[1/2] Detected active Synapse-OS frontend on port: ${port}`);
  console.log(`[2/2] Starting ngrok tunnel for port ${port}...`);

  const ngrokProcess = spawn('ngrok', ['http', String(port)], {
    stdio: 'inherit',
    shell: true
  });

  // Fetch public URL after ngrok starts
  setTimeout(async () => {
    try {
      const res = await fetch('http://127.0.0.1:4040/api/tunnels', { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        const publicUrl = data.tunnels?.[0]?.public_url;
        if (publicUrl) {
          console.log('\n------------------------------------------------------');
          console.log(`🚀 PUBLIC SHARE LINK FOR TEAMMATES:`);
          console.log(`👉 ${publicUrl}`);
          console.log('------------------------------------------------------');
          console.log(`📊 Ngrok Web Dashboard: http://127.0.0.1:4040\n`);
        }
      }
    } catch {}
  }, 2000);

  ngrokProcess.on('close', (code) => {
    console.log(`\nngrok tunnel closed (code ${code}).`);
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    ngrokProcess.kill();
    process.exit(0);
  });
}

startTunnel();
