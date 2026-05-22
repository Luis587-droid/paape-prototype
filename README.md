# Privacy-Aware Access Policy Engine (PAAPE)

## Overview
This repository contains the prototype implementation for the research paper: **"Security and Privacy Tradeoffs in Web 3.0 Authentication: A Zero‑Knowledge Proof Approach for Selective Identity Disclosure."**

The PAAPE framework demonstrates how Web 3.0 users can authenticate to decentralized applications using **Selective Identity Disclosure**. By leveraging Zero-Knowledge Proofs (zk-SNARKs), users can cryptographically prove they satisfy a specific access policy (e.g., `Age >= 18`) without revealing their underlying personal data or identity attributes.

## Tech Stack
*   **Zero-Knowledge Circuits:** Circom & Groth16 (compiled via Remix IDE)
*   **Smart Contracts:** Solidity `^0.8.0`
*   **Blockchain Environment:** Hardhat (Local PoA Simulation)
*   **Automation & Testing:** Node.js, Ethers.js v6

## Repository Structure
*   `contracts/AccessPolicy.sol`: The on-chain "Policy Engine" that stores the access rule, validates the policy parameters to prevent replay attacks, and calls the cryptographic verifier.
*   `contracts/verifier.sol`: The auto-generated Groth16 verifier contract containing the elliptic curve pairing logic.
*   `verifierCalldata.json`: The hardcoded, pre-compiled zero-knowledge proof payload generated from the user's private data.
*   `engine.js`: The primary execution script that deploys the contracts to the local Hardhat network, submits the proof, and measures gas usage and verification latency.

## How to Run the Prototype

1. **Install Dependencies:**
   Ensure Node.js (v22+) is installed, then run:
   ```bash
   npm install
2. **Run the Proof of Concept:**
   ```bash
   node engine.js
