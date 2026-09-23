# 🌌 Zenith-Mesh Protocol

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/amritsharan/Zenith-mesh)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Substrate Ready](https://img.shields.io/badge/Substrate-Compatible-e6007a.svg)](https://substrate.io/)

> **IEEE Zenith-Mesh Specification Compliance**  
> A decentralized, cryptographically verifiable sovereign AI agent protocol, Substrate ledger runtime simulator, Byzantine-robust Federated Learning mesh, and forensic evidence vault.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Mathematical & Cryptographic Specifications](#-mathematical--cryptographic-specifications)
  - [1. Proof-of-Agency (PoA) Intent Digest](#1-proof-of-agency-poa-intent-digest)
  - [2. Merkle-Patricia Trie (MPT) State Root](#2-merkle-patricia-trie-mpt-state-root)
  - [3. Differential Privacy Noise Injection](#3-differential-privacy-noise-injection)
  - [4. Byzantine-Robust Coordinate-Wise Median Filtering](#4-byzantine-robust-coordinate-wise-median-filtering)
  - [5. Forensic Incident Attribution Tuple](#5-forensic-incident-attribution-tuple)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
- [Modules Overview](#-modules-overview)
- [Directory Structure](#-directory-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**Zenith-Mesh** provides a zero-trust, verifiable substrate for autonomous AI agent networks. As AI agents execute privileged system calls, financial disbursements, and capability invocations, standard authorization models fail to guarantee intent authenticity or prevent payload manipulation.

Zenith-Mesh solves this by implementing:
- **Proof-of-Agency (PoA)** intent commitments linked to Zero-Knowledge Poseidon roots.
- **Substrate Blockchain Runtime** tracking state transitions via Merkle-Patricia Tries (MPT) with GRANDPA deterministic finality.
- **Byzantine-Robust Federated Learning (FL)** protecting global model weight updates against malicious gradient poisoning using Gaussian Differential Privacy ($\epsilon, \delta$) and Coordinate-Wise Median Aggregation.
- **Forensic Evidence Vault** generating immutable cryptographic incident tuples ($\tau_{incident}$) upon anomaly detection.

---

## ✨ Key Features

### 🛡️ 1. Proof-of-Agency & Substrate Ledger Integration
- **Canonical Digest Verification**: Generates cryptographic intent hashes ($\tau_{audit}$) combining agent zero-knowledge commitments, Wasm sandbox IDs, capability URIs, payload digests, and epoch timestamps.
- **Substrate Runtime Integration**: Produces block headers aligned with Substrate Aura consensus slot allocation and Substrate frame pallet specifications.
- **Interactive Tampering & Chain Integrity Verification**: Simulated attacker mutation vectors demonstrate instant chain invalidation and cryptographic alert triggers.
- **Substrate Rust Frame Pallet Code Inspector**: Includes real-time preview of native Rust code for PoA intent runtime execution.

### 🧠 2. HyperSpace Federated Learning Mesh
- **Differential Privacy ($\epsilon, \delta$)**: Adds calibrated Gaussian noise ($\Delta \tilde{W}$) to parameter gradients (e.g. LoRA tuning vectors) protecting model privacy.
- **Byzantine Resilience**: Implements coordinate-wise median filtering to reject extreme poisoning attacks from malicious nodes while preserving update fidelity.
- **Interactive Epoch Simulation**: Visualizes gradient aggregation and global model parameter convergence across multiple training rounds.

### 🚨 3. Forensic Evidence Vault
- **Cryptographic Threat Attribution**: Generates immutable incident tuples ($\tau_{incident}$) capturing attacker IP, TCP fingerprint, canary trigger ID, and capture timestamp.
- **Substrate Block Indexing**: Ties security incidents to specific ledger block heights for auditing and post-mortem analysis.

### ⚡ 4. Client Integration Code Generator
- **Multi-Language SDK Synthesis**: Generates ready-to-run integration snippets in TypeScript/JavaScript and Python for client-side intent calculation and node dispatching.

---

## 📐 Mathematical & Cryptographic Specifications

### 1. Proof-of-Agency (PoA) Intent Digest
The canonical proof-of-agency intent hash $\tau_{audit}$ is calculated according to Equation 1 of the IEEE Zenith-Mesh specification:

$$\tau_{audit} = \text{SHA256}\Big( \text{POA} \parallel C_{ZK} \parallel \text{Agent}_{UUID} \parallel H(\text{Tool}_{URI}) \parallel H(\Phi_{output}) \parallel T_{epoch} \Big)$$

Where:
- $C_{ZK}$: Poseidon zero-knowledge commitment root from authorization layers.
- $\text{Agent}_{UUID}$: Wasm sandbox identifier.
- $\text{Tool}_{URI}$: Target capability resource identifier.
- $\Phi_{output}$: Synthesized payload evaluated by logic safety shields.
- $T_{epoch}$: Monotonic system timestamp.

### 2. Merkle-Patricia Trie (MPT) State Root
State root $R_{state}$ aggregates leaf nodes $L_i = \text{SHA256}(\text{Key} \parallel \text{NibblePath} \parallel \tau_{audit})$:

$$R_{state} = \text{MerkleRoot}(L_1, L_2, \dots, L_N)$$

### 3. Differential Privacy Noise Injection
Gradient noise injection follows Equation 5:

$$\Delta \tilde{W} = \Delta W + \mathcal{N}(0, \sigma^2 I)$$

Where scale parameter $\sigma$ is computed from privacy parameters $\epsilon$ and $\delta$ with sensitivity $\Delta S$:

$$\sigma = \frac{\Delta S \cdot \sqrt{2 \ln(1.25 / \delta)}}{\epsilon}$$

### 4. Byzantine-Robust Coordinate-Wise Median Filtering
Aggregated gradient at coordinate index $j$ across $M$ nodes follows Equation 6:

$$[\Delta W^*]_j = \text{median}\Big( [\Delta W_1]_j, [\Delta W_2]_j, \dots, [\Delta W_M]_j \Big)$$

### 5. Forensic Incident Attribution Tuple
Incident attribution record $\tau_{incident}$ follows Equation 8:

$$\tau_{incident} = \text{SHA256}\Big( \text{INCIDENT} \parallel \text{Attacker}_{IP} \parallel \text{Fingerprint}_{TCP} \parallel \text{Canary}_{ID} \parallel T_{capture} \Big)$$

---

## 🏗️ System Architecture

```
                               +----------------------------------+
                               |     Zenith-Mesh UI Dashboard     |
                               +----------------------------------+
                                                |
        +---------------------------------------+---------------------------------------+
        |                                       |                                       |
        v                                       v                                       v
+-----------------------+              +-----------------------+              +-----------------------+
|  Proof-of-Agency      |              |  HyperSpace FL        |              |  Forensic Evidence    |
|  Intent Engine        |              |  Mesh Engine          |              |  Vault                |
+-----------------------+              +-----------------------+              +-----------------------+
        |                                       |                                       |
        v                                       v                                       v
+-----------------------+              +-----------------------+              +-----------------------+
|  Merkle-Patricia      |              |  Gaussian DP &        |              |  Immutable Incident   |
|  Trie State Root      |              |  Byzantine Filter     |              |  Attribution Tuple    |
+-----------------------+              +-----------------------+              +-----------------------+
        |                                       |                                       |
        +---------------------------------------+---------------------------------------+
                                                |
                                                v
                               +----------------------------------+
                               |    Substrate Ledger Simulator    |
                               |    (Aura Consensus & GRANDPA)    |
                               +----------------------------------+
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/amritsharan/Zenith-mesh.git
cd Zenith-mesh
npm install
```

### Development Server

Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Production Build

To compile TypeScript and build the optimized production distribution:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 📂 Directory Structure

```
Zenith-mesh/
├── public/                  # Static assets
├── src/
│   ├── utils/
│   │   └── crypto.ts        # Cryptographic primitives (PoA, MPT, DP, Byzantine Median)
│   ├── App.tsx              # Main dashboard application UI & state management
│   ├── index.css            # Tailored dark-mode cyber design tokens & styling
│   └── main.tsx             # React entry point
├── index.html               # Main HTML entry
├── package.json             # Project dependencies and npm scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite bundler configuration
└── README.md                # Project documentation
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
