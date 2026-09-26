# Cypher-Shield Implementation Plan

This plan outlines the architecture and execution strategy for building **Cypher-Shield**, a project demonstrating Post-Quantum Cryptography (PQC) and its resilience compared to traditional encryption (representing the legacy "Aegis Prime" system).

## Goal Description

The project aims to demonstrate:
1. How a typical server (Laptop Server) stores encrypted data.
2. The vulnerability of traditional encryption (RSA, used in Aegis Prime) to quantum attacks via Shor's Algorithm.
3. The resilience of the new "Cypher-Shield" architecture, which uses Lattice-based cryptography (Kyber) that produces "mathematical gibberish" that quantum computers cannot crack.

## User Review Required

> [!WARNING]  
> We need to establish clear boundaries for the "Quantum Action". Since actual large-scale RSA cracking via Quantum Computers is beyond current hardware capabilities, the attack will be an **emulation**. 
> We will use IBM `qiskit` to simulate the quantum breaking of a small RSA equivalent to show *how* it works, alongside a beautiful UI explaining the transition. Is this approach acceptable to fulfill requirement 3.a ("check the security of the aegis prime")?

> [!IMPORTANT]
> The UI will be built as a Single Page Application (React via Vite) leveraging Vanilla CSS to provide a highly stylized, futuristic, glassmorphic aesthetic (The "Quantum Armor" aesthetic) without relying on Tailwind.

## Proposed Architecture

This repository will contain two primary components:
1. **Backend Server (FastAPI)**: Represents both the un-hackable "User System" (which runs locally to encrypt/decrypt) and the "Laptop Server" which only stores ciphertexts.
2. **Frontend Website (React + Vanilla CSS)**: Provides the visual dashboard to trigger these operations and visualize the Quantum Attacker.

---

### Backend (Python / FastAPI)

The backend will expose APIs for both systems.

#### [NEW] `server/main.py`
The FastAPI application defining endpoints:
- `POST /aegis/encrypt`: Encrypts data using classic RSA.
- `POST /aegis/crack`: Runs a Qiskit/Shor's quantum algorithm simulation on a small key-space to prove Aegis Prime's vulnerability.
- `POST /cypher-shield/encrypt`: Encrypts data using Kyber PQC (Lattice-based).
- `POST /cypher-shield/crack`: Demonstrates the mathematical impossibility of Shor's/Grover's algorithms cracking the lattice, outputting failure.

#### [NEW] `server/crypto_utils.py`
Helper modules using:
- `kyber-py` for Post-Quantum KEM and lattice cryptography.
- Standard libraries or `pycryptodome` for RSA (Aegis Prime legacy).
- `qiskit` to construct a simulated quantum factorization circuit.

---

### Frontend (React / Vite)

The UI will feature a rich, dynamic aesthetic with three distinct zones: **The User System, The Vault (Server), and The Quantum Attacker**.

#### [NEW] `client/src/App.jsx`
The main dashboard components that organize the simulation state.

#### [NEW] `client/src/index.css`
A comprehensive Vanilla CSS stylesheet containing the "Quantum Armor" design system, using modern gradients, CSS grid/flexbox, glassmorphic overlays, and subtle micro-animations.

---

## Open Questions

> [!NOTE]  
> 1. Should we serve the React frontend as static files from the FastAPI backend, or run them as two entirely separate development servers for now? I recommend running the React Dev server separately for rapid UI iteration, and FastApi on port 8000.
> 2. Are there any specific colors or themes for "Cypher-Shield" you prefer? Unspecified, I will proceed with deep space blues, neon cybers-greens, and stark glowing borders.

## Verification Plan

### Automated Tests
- The React frontend builds and starts successfully.
- API endpoints return expected encryption gibberish (Lattice-based for Cypher).

### Manual Verification
- We will review the visual quality of the frontend dashboard to ensure it meets the "Wow" premium standard.
- We will click "Run Quantum Attack" and verify that it breaks the Aegis mock but fails against the Cypher-Shield mock.
