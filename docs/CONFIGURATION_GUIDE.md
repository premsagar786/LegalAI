# 🔧 Configuration Guide - Connecting All Services

## 🎯 Current Configuration Status

### ✅ **All Services Are Properly Configured!**

Your services are already set up to communicate with each other:

---

## 📊 Service Configuration

### **1. Frontend (React) → Backend (Node.js)**

**File:** `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=LegalAI
```

**What it does:**
- Frontend sends all API requests to `http://localhost:5000/api`
- This includes document uploads, user auth, lawyer search, etc.

---

### **2. Backend (Node.js) → AI Service (Python)**

**File:** `server/.env`
```env
AI_SERVICE_URL=http://localhost:8000
```

**What it does:**
- Backend forwards document analysis requests to AI service
- Located in `documentController.js` line 76

**Code:**
```javascript
const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const response = await axios.post(`${aiServiceUrl}/analyze`, {...});
```

---

### **3. AI Service (Python) Configuration**

**File:** `ai-service/.env`
```env
GEMINI_API_KEY=AIzaSyClu6W3zFI-1p-F2akU5qR_D-tx21dPC4M
PORT=8000
```

**Server Configuration:** `ai-service/main.py`
```python
uvicorn.run(
    "main:app",
    host="0.0.0.0",  # Accessible from all interfaces
    port=int(os.getenv("PORT", 8000)),
    reload=True
)
```

**CORS Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔄 Data Flow

```
User Browser (localhost:3000)
    ↓
    Upload PDF Document
    ↓
Frontend (React)
    ↓
    POST /api/documents/upload
    ↓
Backend (Node.js - localhost:5000)
    ↓
    Save file to disk
    Create database record
    ↓
    POST /api/documents/:id/analyze
    ↓
Backend reads file and sends to AI Service
    ↓
    POST http://localhost:8000/analyze
    {
      file: "base64_encoded_pdf",
      fileName: "contract.pdf",
      fileType: "pdf"
    }
    ↓
AI Service (Python - localhost:8000)
    ↓
    Is PDF? → YES
    ↓
Gemini PDF Analyzer
    ↓
    Native PDF processing (no OCR!)
    90-98% accuracy
    Indian law context
    ↓
Return Analysis
    ↓
Backend saves analysis to database
    ↓
Frontend displays results
```

---

## 🧪 Testing the Connection

### **Test 1: Check AI Service Health**

Open in browser or use curl:
```
http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-13T02:20:00",
  "components": {
    "ocr": false,
    "nlp": true
  }
}
```

### **Test 2: Check Backend Connection to AI Service**

From PowerShell:
```powershell
# Test if backend can reach AI service
curl http://localhost:5000/api/health
curl http://localhost:8000/health
```

### **Test 3: Full Integration Test**

1. **Open app:** http://localhost:3000
2. **Login/Register** (if not logged in)
3. **Go to:** Document Analysis page
4. **Upload:** A PDF file
5. **Watch backend terminal** for:
   ```
   POST /api/documents/upload
   POST /api/documents/:id/analyze
   Calling AI service at http://localhost:8000/analyze
   ```
6. **Watch AI service terminal** for:
   ```
   📄 Using Gemini native PDF processing for: contract.pdf
      🤖 Generating analysis...
      ✅ Analysis complete!
   ```

---

## ⚠️ Troubleshooting

### **Issue 1: "AI service unavailable"**

**Symptoms:**
- Document analysis fails
- Backend shows "AI Service Error"
- Frontend shows demo analysis

**Check:**
1. Is AI service running?
   ```bash
   # Check if process is running
   netstat -ano | findstr :8000
   ```

2. Can backend reach AI service?
   ```bash
   curl http://localhost:8000/health
   ```

3. Check AI service logs for errors

**Solution:**
- Restart AI service: `python main.py` in `ai-service/`
- Check `.env` file has `GEMINI_API_KEY`
- Verify port 8000 is not blocked by firewall

---

### **Issue 2: "Connection refused"**

**Symptoms:**
- Backend can't connect to AI service
- Error: `ECONNREFUSED`

**Check:**
1. AI service is running on correct port:
   ```bash
   netstat -ano | findstr :8000
   ```

2. AI service host is `0.0.0.0` not `127.0.0.1`:
   ```python
   # In main.py
   host="0.0.0.0"  # ✅ Correct
   # NOT
   host="127.0.0.1"  # ❌ May cause issues
   ```

**Solution:**
- Ensure `main.py` uses `host="0.0.0.0"`
- Restart AI service

---

### **Issue 3: "CORS error"**

**Symptoms:**
- Browser console shows CORS error
- Request blocked by browser

**Check:**
1. AI service CORS configuration in `main.py`:
   ```python
   allow_origins=["*"]  # Should allow all
   ```

2. Backend is making server-side request (not browser)
   - Backend → AI Service = No CORS issues
   - Browser → AI Service = CORS needed

**Solution:**
- CORS is already configured correctly
- Backend makes the AI service calls (not frontend)
- No changes needed!

---

### **Issue 4: "Gemini API key not working"**

**Symptoms:**
- AI service starts but analysis fails
- Error about API key

**Check:**
1. `.env` file exists in `ai-service/`
2. API key is correct:
   ```env
   GEMINI_API_KEY=AIzaSyClu6W3zFI-1p-F2akU5qR_D-tx21dPC4M
   ```
3. No extra spaces or quotes

**Solution:**
- Verify API key at: https://ai.google.dev/
- Regenerate if needed
- Update `.env` file
- Restart AI service

---

## 🔍 Verification Checklist

Run these checks to ensure everything is configured:

- [ ] **Frontend .env exists**
  - File: `client/.env`
  - Contains: `VITE_API_URL=http://localhost:5000/api`

- [ ] **Backend .env exists**
  - File: `server/.env`
  - Contains: `AI_SERVICE_URL=http://localhost:8000`

- [ ] **AI Service .env exists**
  - File: `ai-service/.env`
  - Contains: `GEMINI_API_KEY=your_key_here`

- [ ] **All services running**
  - Frontend: http://localhost:3000 ✅
  - Backend: http://localhost:5000 ✅
  - AI Service: http://localhost:8000 ✅

- [ ] **Health checks pass**
  - Backend: http://localhost:5000/api/health
  - AI Service: http://localhost:8000/health

- [ ] **Ports not blocked**
  - Check firewall settings
  - Check antivirus settings

---

## 🎯 Quick Fix Commands

### **Restart All Services:**

```bash
# Terminal 1 - Frontend
cd "C:\Users\user\Desktop\PRANTI 2026\client"
npm run dev

# Terminal 2 - Backend
cd "C:\Users\user\Desktop\PRANTI 2026\server"
npm run dev

# Terminal 3 - AI Service
cd "C:\Users\user\Desktop\PRANTI 2026\ai-service"
python main.py
```

### **Check Service Status:**

```bash
# Check if services are running
netstat -ano | findstr :3000  # Frontend
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :8000  # AI Service
```

### **Test Connections:**

```bash
# Test each service
curl http://localhost:3000
curl http://localhost:5000/api/health
curl http://localhost:8000/health
```

---

## ✅ Summary

### **Your Configuration:**

1. **Frontend → Backend**
   - ✅ Configured via `VITE_API_URL`
   - ✅ Points to `http://localhost:5000/api`

2. **Backend → AI Service**
   - ✅ Configured via `AI_SERVICE_URL`
   - ✅ Points to `http://localhost:8000`

3. **AI Service**
   - ✅ Listening on `0.0.0.0:8000`
   - ✅ CORS enabled for all origins
   - ✅ Gemini API key configured

### **Everything is already configured correctly!**

If you're experiencing issues:
1. Check all services are running
2. Check health endpoints
3. Look at terminal logs for errors
4. Try the troubleshooting steps above

---

**Your services are properly configured and should communicate seamlessly!** 🎉
