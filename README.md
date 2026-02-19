# ⚖️ LegalAI — AI-Powered Lawyer Consultation Platform

## 📌 Project Title
LegalAI — Smart AI + Blockchain Powered Legal Consultation Platform

---

## 📝 Project Description

LegalAI is a full-stack LegalTech platform that combines Artificial Intelligence and Blockchain technology to simplify legal document understanding and lawyer consultation.

Users can upload legal documents (PDFs or images), receive AI-powered clause analysis with risk scoring, and securely connect with verified lawyers for consultations. To ensure transparency and document integrity, the system stores document hashes on the Algorand Testnet using smart contracts.

LegalAI bridges the gap between complex legal language and everyday users while maintaining security, transparency, and trust.

---

## 🚨 Problem Statement

Legal documents are often:

- Complex and filled with difficult legal terminology  
- Risky to sign without expert review  
- Expensive to get analyzed by professionals  
- Hard to verify for authenticity  

Additionally:

- There is no transparent way to verify document integrity digitally.
- Many users struggle to find trusted and specialized lawyers.
- Legal consultations lack structured digital tracking.

---

## 💡 Our Solution

LegalAI provides:

- AI-powered clause detection and explanation  
- Automated risk assessment scoring  
- Recommendation engine for safer decision-making  
- Verified lawyer marketplace  
- Blockchain-based document hash verification  
- Secure appointment booking and tracking  

By combining AI + Algorand Blockchain, the platform ensures intelligent analysis and tamper-proof verification.

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
        ├── MongoDB Database  
        │       ├── Users  
        │       ├── Lawyers  
        │       ├── Appointments  
        │       └── Documents  
        │  
        ├── Python AI Service (FastAPI)  
        │       ├── OCR Processing (Tesseract)  
        │       └── NLP Clause Analysis (spaCy)  
        │  
        └── Algorand Smart Contract  
                └── Stores SHA-256 Document Hash  

---

## 🔐 Smart Contract + Frontend Interaction Flow

1. User uploads a legal document.  
2. Backend sends file to AI service.  
3. OCR extracts text from PDF/image.  
4. NLP analyzes clauses and assigns risk score.  
5. Backend generates SHA-256 hash of the document.  
6. Hash is stored on Algorand Testnet smart contract.  
7. Smart contract returns transaction confirmation.  
8. Frontend displays:
   - AI analysis report  
   - Risk score  
   - Blockchain verification status  
9. User can verify document anytime using Testnet explorer.  

---

## 🧰 Tech Stack

### 🔗 Blockchain
- AlgoKit  
- PyTEAL
- Algorand Testnet  
- AlgoExplorer  

### 🖥 Backend
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- JWT Authentication  
- bcrypt  

### 🤖 AI Service
- Python  
- FastAPI  
- Tesseract OCR  
- spaCy NLP  

### 🎨 Frontend
- React (Vite)  
- Tailwind CSS  
- Framer Motion  
- Axios  

---

## ⚙️ Installation & Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone <https://github.com/premsagar786/LegalAI.git>
cd LegalAI
```

---

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/legalconsult
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
ALGORAND_APP_ID=123456789
```

Run the backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:
http://localhost:5173

---

### 4️⃣ AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py
```

AI service runs on:
http://localhost:8000

---

### 5️⃣ Smart Contract Deployment (Algorand Testnet)

Install AlgoKit and deploy:

```bash
algokit init
algokit deploy
```

After deployment:
- Copy generated App ID  
- Update ALGORAND_APP_ID in backend `.env`  
- Restart backend  

---

## 📖 Usage Guide

### 👤 User Workflow

1. Register or Login  
2. Upload legal document (PDF/Image)  
3. System performs:
   - OCR extraction  
   - NLP clause analysis  
   - Risk scoring  
4. Document hash stored on blockchain  
5. View analysis dashboard  
6. Browse verified lawyers  
7. Book consultation  
8. Track appointment status  

---

## 📸 Screenshots

Create a folder named `screenshots` in root directory.

Add:
- dashboard.png  
- upload.png  
- analysis.png  
- lawyer-profile.png  
- blockchain-verification.png  

Example:

```markdown
![Dashboard](screenshots/dashboard.png)
![Upload](screenshots/upload.png)
![Analysis](screenshots/analysis.png)
![Lawyer Profile](screenshots/lawyer-profile.png)
![Blockchain Verification](screenshots/blockchain-verification.png)
```

---

## ⚠️ Known Limitations

- AI analysis does not replace licensed legal advice  
- Currently supports English language only  
- OCR accuracy depends on document clarity  
- Only document hash stored on blockchain (not full file)  
- No mobile application version yet  
- Testnet only (not deployed to Mainnet)  

---

## 👥 Team Members and Roles

### Prem Sagar Malhotra
- Full Stack Developer  
- Database & Blockchain Integration  
- AI Integration  

### Sehajpreet Singh
- Frontend Developer  
- Smart Contract Developer 

### Sahibjit Singh
- Backend Developer  

### Sukha Singh
-UI UX Integration   


## 🔮 Future Improvements

- Multilingual NLP support  
- AI legal chatbot assistant  
- Video consultation integration  
- Wallet-based authentication  
- Mainnet deployment  
- Mobile application  

---

## 📜 License

This project is licensed under the ISC License.

---

Built with ❤️ using AI + Algorand Blockchain
