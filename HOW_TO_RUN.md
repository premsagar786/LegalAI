# 🚀 How to Run All Services - Windows Guide

## ✅ All Services Are Currently Running!

Your complete development environment is now active:

### 1️⃣ Backend Server (Node.js + Express)
- **Status**: ✅ RUNNING
- **URL**: http://localhost:5000
- **API Endpoint**: http://localhost:5000/api
- **Location**: `server/`
- **Note**: MongoDB connection warning (see below)

### 2️⃣ Frontend (React + Vite)
- **Status**: ✅ RUNNING  
- **URL**: http://localhost:5173
- **Location**: `client/`
- **Access**: Open http://localhost:5173 in your browser

### 3️⃣ AI Service (Python + FastAPI)
- **Status**: ✅ RUNNING
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Location**: `ai-service/`

---

## 🔄 How to Start Services Manually (If Needed)

If you need to restart the services later, open **3 separate PowerShell terminals**:

### Terminal 1 - Backend
```powershell
cd "c:\Users\user\Desktop\PRANTI 2026\server"
npm run dev
```

### Terminal 2 - Frontend
```powershell
cd "c:\Users\user\Desktop\PRANTI 2026\client"
npm run dev
```

### Terminal 3 - AI Service
```powershell
cd "c:\Users\user\Desktop\PRANTI 2026\ai-service"
python main.py
```

---

## ⚠️ Important Notes

### MongoDB Connection Issue
Your backend is showing a MongoDB connection warning. To fix this:

1. **Option A: Use Local MongoDB**
   - Install MongoDB locally
   - Update `server/.env` with: `MONGODB_URI=mongodb://localhost:27017/legalconsult`

2. **Option B: Use MongoDB Atlas**
   - Whitelist your IP address in MongoDB Atlas
   - Check your connection string in `server/.env`

### Gemini API Warning
The AI service shows a deprecation warning for `google.generativeai`. This is just a warning and won't affect functionality, but consider updating to `google.genai` in the future.

---

## 🌐 Access Your Application

**Main Application**: http://localhost:5173

The frontend will automatically connect to:
- Backend API: http://localhost:5000/api
- AI Service: http://localhost:8000

---

## 🛑 How to Stop Services

Press `Ctrl + C` in each terminal window to stop the respective service.

---

## ❌ Common Issues on Windows

### Issue: "bash: run: command not found"
**Solution**: You're on Windows PowerShell, not bash. Don't type `bash` before commands.
- ❌ Wrong: `bash npm run dev`
- ✅ Correct: `npm run dev`

### Issue: Unicode/Emoji errors in Python
**Solution**: Already fixed! The AI service now uses ASCII-safe text instead of emojis.

### Issue: Port already in use
**Solution**: 
```powershell
# Find process using port 5000 (or 5173, 8000)
netstat -ano | findstr "5000"
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

## 📝 Quick Commands Reference

```powershell
# Check if ports are in use
netstat -ano | findstr "5000 5173 8000"

# Navigate to project root
cd "c:\Users\user\Desktop\PRANTI 2026"

# Install dependencies (if needed)
cd server && npm install
cd ../client && npm install
cd ../ai-service && pip install -r requirements.txt
```

---

**Made with ❤️ for PRANTI 2026 Final Year Project**
