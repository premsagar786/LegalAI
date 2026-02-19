# AI-Powered Lawyer Consultation Platform

A production-ready legal-tech platform that helps users understand legal documents and connect with verified lawyers.

![LegalAI Banner](https://via.placeholder.com/1200x400/6366f1/ffffff?text=LegalAI+-+AI-Powered+Legal+Platform)

## 🎯 Overview

This platform enables users to:
- **Upload legal documents** (PDFs, scanned images, camera photos)
- **Get AI-powered analysis** using OCR and NLP
- **Understand complex clauses** with risk assessments
- **Connect with verified lawyers** for consultations
- **Book appointments** and track consultations

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Node.js API    │────▶│  Python AI      │
│  (Vite + React) │     │  (Express)      │     │  (FastAPI)      │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │    MongoDB      │
                        │    Database     │
                        │                 │
                        └─────────────────┘
```

## 📁 Project Structure

```
PRANTI 2026/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React contexts (Auth, Theme)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── App.jsx         # Main app with routing
│   │   └── index.css       # Global styles
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, upload, error handling
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   └── server.js       # Main server entry
│   └── package.json
│
├── ai-service/             # Python AI Service
│   ├── main.py             # FastAPI application
│   ├── ocr_processor.py    # Tesseract OCR module
│   ├── nlp_analyzer.py     # NLP analysis module
│   └── requirements.txt
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ (for frontend and backend)
- **Python** 3.9+ (for AI service)
- **MongoDB** (local or Atlas)
- **Tesseract OCR** (optional, for advanced OCR)

### Installation

#### 1. Clone the repository

```bash
git clone <repository-url>
cd "PRANTI 2026"
```

#### 2. Install Backend Dependencies

```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/legalconsult
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
```

#### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

#### 4. Install AI Service Dependencies (Optional)

```bash
cd ../ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Running the Application

#### Start all services:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Terminal 3 - AI Service (Optional):**
```bash
cd ai-service
python main.py
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **AI Service**: http://localhost:8000

## 🎨 Features

### User Module
- ✅ User registration and authentication
- ✅ JWT-based secure sessions
- ✅ Role-based access (User, Lawyer, Admin)
- ✅ Profile management

### Document Analysis
- ✅ Upload PDF and image files
- ✅ OCR text extraction
- ✅ NLP-based clause detection
- ✅ Risk assessment and scoring
- ✅ Recommendations generation

### Lawyer Module
- ✅ Lawyer profiles with specializations
- ✅ Search and filter lawyers
- ✅ Ratings and reviews
- ✅ Availability management

### Admin Module
- ✅ Dashboard with statistics
- ✅ Lawyer verification
- ✅ User management

## 🔐 Security

- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Secure file uploads with validation
- CORS protection
- Helmet.js security headers

## 🎨 UI/UX

- **Dark/Light Mode**: System-aware theme switching
- **Responsive Design**: Works on all devices
- **Animations**: Smooth transitions with Framer Motion
- **Modern UI**: Glassmorphism, gradients, premium feel

## 📚 API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Get current user |

### Documents
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/documents/upload` | POST | Upload document |
| `/api/documents/:id/analyze` | POST | Analyze document |
| `/api/documents` | GET | Get user's documents |

### Lawyers
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lawyers` | GET | Get verified lawyers |
| `/api/lawyers/:id` | GET | Get lawyer profile |
| `/api/lawyers/specializations` | GET | Get specialization list |

### Appointments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/appointments` | POST | Create appointment |
| `/api/appointments` | GET | Get appointments |
| `/api/appointments/:id/status` | PUT | Update status |

## 🔮 Future Enhancements

- [ ] Multilingual document analysis
- [ ] AI legal chatbot
- [ ] Video consultation integration
- [ ] Blockchain document verification
- [ ] Mobile applications

## 👨‍💻 Author

**Prem Sagar Malhotra**
- GitHub: [@premsagar786](https://github.com/premsagar786)
- LinkedIn: [Prem Sagar Malhotra](https://www.linkedin.com/in/prem-sagar-malhotra-99428a348)

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Made with ❤️ for Final Year Project 2026
</p>
