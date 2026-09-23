# HackX ⚖️⚡
> **Transparent, Evidence-Based Hackathon Evaluation**  
> *"AI-assisted. Human-decided. Blockchain-auditable."*

[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20Python%203.11+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Polygon Amoy](https://img.shields.io/badge/Blockchain-Polygon%20Amoy%20Testnet-8247E5?logo=polygon)](https://amoy.polygonscan.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 The Core Problem

Hackathon judging today faces three critical vulnerabilities:
1. **Unsubstantiated Pitch Claims**: Teams pitch complex architectures, concurrency breakthroughs, or ML model accuracy without verified repo evidence. Judges lack time to audit codebases during tight judging windows.
2. **Evaluator Bias & Hallucination**: Subjective divergence where judges award top scores to unsupported features or downgrade solid implementations due to fatigue or misalignment.
3. **Black-Box Tampering**: Scores stored in centralized databases can be modified after the fact with zero cryptographic audit trail or accountability.

---

## 🛡️ The VeriJudge Solution: Three Architectural Pillars

```
                  ┌─────────────────────────────────────────────────────────┐
                  │               Participant Submission                    │
                  │   (GitHub Repository, Commit SHA, Architecture Diagram) │
                  └───────────────────────────┬─────────────────────────────┘
                                              │
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. AI Evidence Agent                                                                   │
│  • Decomposes project claims into atomic, testable propositions.                       │
│  • Performs semantic AST & file mapping against GitHub repo tree.                     │
│  • Tags claims: [Supported] [Partially Supported] [Unsupported] [Needs Human Review]   │
│  • Never hallucinates: explicitly tags missing evidence.                              │
└─────────────────────────────────────┬──────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. Autonomous Score Guardrails                                                         │
│  • Monitors live judge rubric scoring (0–25 per category, 100 total).                  │
│  • Detects evidence divergence (e.g., 24/25 in Tech Quality when concurrency claims    │
│    are marked [Unsupported]).                                                          │
│  • Triggers non-blocking Guardrail Challenge: requests written justification.          │
│  • Human judges retain final authority — AI advises, never overrides.                  │
└─────────────────────────────────────┬──────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. Canonical Serialization & Polygon Amoy Anchoring                                    │
│  • Constructs deterministic canonical JSON payload (sorted keys, ISO timestamps).      │
│  • Computes Ethereum-standard Keccak-256 cryptographic digest.                         │
│  • Anchors hash to EvaluationAnchor.sol smart contract on Polygon Amoy.               │
│  • Integrity Center continuously detects any database tampering in real time.          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features by User Role

### 👩‍💻 Participant Experience
- **Submission Workspace**: Input project title, description, live demo URL, GitHub repository, and specific architectural claims.
- **Claim Extraction Manager**: Add, tag, and inspect atomic claims before submission.
- **Team Management**: Invite teammates, assign engineering roles (Frontend, Backend, ML, Design).
- **Transparent Feedback**: View finalized, locked rubric scores and AI verification breakdowns once results are officially published.

### ⚖️ Judge Evaluation Workspace
- **Evidence-First Scoring**: Side-by-side view of extracted claims, source file paths, confidence scores, and code snippets.
- **Interactive Scoring Console**: Real-time category score sliders (Technical Quality, Innovation, Evidence & Rigor, Practical Impact).
- **Guardrail Interventions**: Modal dialogues triggering when high scores are awarded to unsupported claims, prompting evidence justifications.
- **Decision Replay**: Audit trail showing timeline of AI extraction, scoring draft, guardrail intervention, justification, and final submission.

### 🏛️ Organizer Command Center
- **Cross-Judge Anomaly Detection**: Automatic statistical analysis (mean, median, standard deviation, category divergence) detecting outliers (e.g., a judge awarding 96/100 when peers averaged 73/100).
- **Integrity Center & Tampering Simulation**:
  - Real-time cryptographic validation comparing database state against Polygon Amoy on-chain records.
  - **Live Demo Tamper Button**: Modifies database score to simulate database breach.
  - **Zero False-Positive Restore**: Reverts database values and shows instant cryptographic re-verification.
  - **Results Lockout**: Prevents result publication if any cryptographic tampering violation is detected.
- **Append-Only Audit Log**: Immutable system logs recording every authentication, evaluation event, and smart contract transaction.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Framer Motion, Recharts |
| **Backend** | FastAPI (Python 3.11+), SQLAlchemy Async (aiosqlite & asyncpg), Pydantic v2, PyJWT, bcrypt |
| **Cryptography** | Pure Python Keccak-256 (EVM-standard specification), SHA-256, Canonical JSON serializer |
| **Blockchain** | Solidity (`EvaluationAnchor.sol`), Hardhat, Polygon Amoy Testnet |
| **Containerization** | Docker, Docker Compose, PostgreSQL 16 Alpine |

---

## 🎬 3-Minute Live Demo Script

Follow these steps to demonstrate the complete VeriJudge platform:

### 1. One-Click Demo Access
1. Visit `http://localhost:3000/login`.
2. Click **"Demo Organizer"** to log in as Dr. Victor Vance.
3. Observe the live status: **1 Hackathon Active (InnovateX 2026)**, **3 Teams**, **5 Judges**, and **All Cryptographic Proofs Verified**.

### 2. Inspecting AI Evidence Extraction
1. Switch role to **Judge** using the top navigation switcher, or log in as **Dr. Aris Vance** (`judge.aris@innovatex.io` / `password123`).
2. Navigate to **Assigned Teams** → select **"GenX AI - Smart Campus Assistant"**.
3. View the 12 extracted claims with their AI tags (`Supported`, `Partially Supported`, `Unsupported`).
4. Click on an evidence card to inspect GitHub file references (`src/backend/retrieval.py#L45-L82`).

### 3. Triggering Autonomous Score Guardrails
1. In the scoring sliders, award **24 / 25** to **Technical Quality**.
2. Notice the warning alert: *"Technical Quality has unsupported claims regarding high-throughput concurrency."*
3. Click **"Submit Final Evaluation"**.
4. A **Guardrail Challenge Modal** appears:
   - AI highlights the discrepancy between the high score and the missing benchmark evidence.
   - Enter your justification: *"Verified custom load test script demonstrated during in-person booth demo."*
   - Confirm submission.

### 4. Polygon Blockchain Anchoring
1. The evaluation is canonized into deterministic JSON, hashed with Keccak-256, and anchored to **Polygon Amoy**.
2. A cryptographic receipt appears with Transaction Hash and Block Number.

### 5. Demonstrating Database Tampering & Immediate Detection
1. Switch back to **Organizer** role and visit `/organizer/integrity`.
2. Notice the system status is **"ALL EVALUATIONS VERIFIED"** (green).
3. Click **"Simulate Database Tampering"**:
   - The backend modifies an evaluation score directly in SQL (+7.0 points) without on-chain interaction.
   - The dashboard turns **RED: "INTEGRITY VIOLATION DETECTED"**.
   - Inspect the **Tamper Diff Viewer**: compares Live Database Canonical Hash vs. Immutable On-Chain Hash.
   - Notice the **"Publish Final Results"** button is automatically locked to protect hackathon validity.
4. Click **"Restore Database Records"**:
   - Scores are restored, Keccak-256 hashes re-align, and the system turns green again.

### 6. Public Cryptographic Verification & Decision Replay
1. Click **"Verify Cryptographic Proof"** or visit `/evaluation/<id>/verify`.
2. View the independent on-chain verification card and explorer link.
3. Click **"Decision Replay"** (`/evaluation/<id>/replay`) to view the chronological, step-by-step decision trail from raw submission to on-chain anchor.

---

## 💻 Local Setup Guide

### Option 1: Quick Start with Docker Compose (Recommended)

Make sure you have Docker and Docker Compose installed:

```bash
# Clone the repository
git clone https://github.com/your-org/hackjudge.git
cd hackjudge

# Start backend, frontend, and PostgreSQL in one command
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`
- Default DB: Pre-seeded with **InnovateX 2026** demo dataset.

---

### Option 2: Manual Local Development

#### 1. Backend Setup (FastAPI & Python)
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database & seed demo data
python -c "import asyncio; from app.database import init_db; from app.seed_data import seed_database; asyncio.run(init_db()); asyncio.run(seed_database())"

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (Next.js 15)
```bash
cd frontend

# Install packages
npm install

# Start Next.js development server
npm run dev
```
Visit `http://localhost:3000` in your browser.

#### 3. Smart Contract Verification (Optional / Blockchain)
```bash
cd blockchain

# Install dependencies
npm install

# Run smart contract unit tests
npx hardhat test

# Deploy to Polygon Amoy Testnet (requires private key & MATIC)
npx hardhat run scripts/deploy.js --network amoy
```

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests
```bash
cd backend
pytest -v
```
Verifies:
- Pure Keccak-256 EVM compatibility test vectors
- Deterministic JSON canonicalizer sorting
- Role-based authorization & demo JWT generation
- AI claim extraction & classification logic
- Scoring guardrail triggers & justification validation
- Blockchain anchoring & tamper detection logic

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Pre-loaded Context |
|---|---|---|---|
| **Organizer** | `organizer@innovatex.io` | `password123` | Full administrative control, rubric editor, integrity center |
| **Judge 1** | `judge.aris@innovatex.io` | `password123` | Assigned to GenX AI & EcoTrack |
| **Judge 2** | `judge.sarah@innovatex.io` | `password123` | High-rigor evaluator |
| **Judge 3 (Anomaly)** | `judge.marcus@innovatex.io` | `password123` | Evaluated MedLink (outlier score 96 vs 73/74) |
| **Participant** | `alex@genx.ai` | `password123` | Lead of GenX AI ("Smart Campus Assistant") |

*Tip: You can also use the 1-click login buttons on `/login` or the role switcher in the navigation bar.*

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
