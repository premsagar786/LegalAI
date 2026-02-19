# ⚖️ LegalAI — AI-Powered Lawyer Consultation Platform

## 📌 Project Title

**LegalAI — Smart AI + Blockchain Powered Legal Consultation Platform**

---

## 📝 Project Description

LegalAI is a production-ready LegalTech platform that enables users to upload legal documents, receive AI-powered clause analysis with risk assessment, and securely connect with verified lawyers for consultation.

The platform integrates Artificial Intelligence (OCR + NLP) with Algorand Blockchain smart contracts to provide secure, transparent, and tamper-proof document verification.

It simplifies complex legal language, improves accessibility to legal services, and enhances trust through blockchain-backed verification.

---

## 🚨 Problem Statement

Legal documents are often:

- Difficult to understand due to complex legal language  
- Risky to sign without proper review  
- Expensive to get reviewed by professionals  
- Hard to verify for authenticity  

Additionally:

- There is no transparent system for document integrity verification.
- Legal consultations lack secure digital tracking.
- Users struggle to find verified and specialized lawyers easily.

---

## 💡 Our Solution

LegalAI provides:

- AI-powered document clause analysis  
- Automated risk scoring and recommendations  
- Verified lawyer marketplace  
- Secure blockchain-based document hash storage (Algorand Testnet)  
- Smart appointment booking system  

---

## 🌐 Live Demo

Live Application URL:  
https://your-live-demo-link.com

---

## 🎥 LinkedIn Demo Video

LinkedIn Demo Video URL:  
https://linkedin.com/your-demo-video-link

---

## ⛓ Blockchain Details

Network: Algorand Testnet  
App ID (Testnet): 123456789  
Testnet Explorer Link:  
https://testnet.algoexplorer.io/application/123456789  

---

## 🏗 Architecture Overview

### System Architecture

Frontend (React + Vite)
        │
        ▼
Node.js Backend (Express API)
        │
        ├── MongoDB (Users, Lawyers, Appointments)
        │
        ├── Python AI Service (FastAPI)
        │       ├── OCR Processing
        │       └── NLP Clause Analysis
        │
        └── Algorand Smart Contract
                └── Stores Document Hash

---

## 🔐 Smart Contract + Frontend Interaction

1. User uploads a document.
2. Backend extracts text using OCR.
3. NLP engine analyzes clauses and assigns risk scores.
4. A SHA-256 hash of the document is generated.
5. The hash is stored on Algorand Testnet via smart contract.
6. Frontend displays:
   - AI analysis
   - Risk score
   - Blockchain verification status
7. Users can verify document authenticity anytime using the Testnet explorer.

---

## 🧰 Tech Stack

### Blockchain
- AlgoKit
- Smart Contract Language: PyTEAL
- Algorand Testnet
- AlgoExplorer

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt

### AI Service
- Python
- FastAPI
- Tesseract OCR
- spaCy NLP

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion
- Axios

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd LegalAI
