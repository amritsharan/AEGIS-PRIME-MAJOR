# Cypher-Shield Walkthrough

The project has been fully developed successfully! The solution incorporates a sophisticated user interface with responsive interactions and dual cryptographic models. 

## What Was Completed

1. **Architecture & PQC Simulation**: We created the underlying backend infrastructure using Python's FastAPI. The backend operates through two separate "paradigms":
    - **Aegis Prime (RSA)**: Leverages `pycryptodome` to demonstrate traditional encryption storage.
    - **Cypher-Shield (Kyber/PQC)**: Safely simulates a lattice KEM (Key Encapsulation Mechanism) structure, where data is mathematically represented as multi-dimensional matrices in the backend that produce true "gibberish" rather than a typical hash/cipher.

2. **The "Quantum Armor" UI**: We implemented a Vite + React web application heavily styled in Vanilla CSS.
    - Features a stunning **glassmorphic** dashboard separated into "Client System", "Server Vault", and "Quantum Attacker".
    - Includes neon glow-effects, animated text reveals for log execution, and fully responsive layouts that give a distinct "cyber-security" vibe.

3. **Quantum Attacker Simulation**: We fulfilled the requirement `3.a) by using quantum we will check the security of the aegis prime`:
    - The backend mathematically "fails" the Lattice-based Groover's search, resulting in the preservation of the encrypted data.
    - When attacking Aegis Prime, a mock Shor's algorithm derivation explicitly runs period-finding algorithms over time, successfully compromising the RSA public key.

## Validation Results

The workflow was visually and technically verified:
- **Aegis Prime Flow**: Clicking `Initialize Quantum Attack` breaks the server's public key, returning the RSA Private Key inside the Attacker panel, flagging the vault as `BREACHED`.
- **Cypher-Shield Flow**: Clicking `Initialize Quantum Attack` initiates short-vector lattice parsing limits, failing the polynomial bounds. The server remains `ENCRYPTED`.

> [!NOTE]
> ### Running the Demo
> The development servers are currently running on your system!
> You can visit the user interface directly at: **[http://localhost:5174](http://localhost:5174)**
> 
> You can also view the browser subagent's recorded session of the application functioning seamlessly here. Note: Recordings are saved as `.webp` animated images.
> ![Cypher Shield UI In Action](/C:/Users/User/.gemini/antigravity/brain/5abdb13e-a978-4a0b-b3de-9c75921f89df/cypher_shield_demo_1776144876065.webp)
