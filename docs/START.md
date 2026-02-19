# Quick Start Guide

## Starting the Application

### Option 1: Start Everything (Recommended)

Open 3 terminals and run:

**Terminal 1 - Backend Server:**
```powershell
cd server
npm run dev
```
Server will start at: http://localhost:5000

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
```
Frontend will start at: http://localhost:5173

**Terminal 3 - AI Service (Optional):**
```powershell
cd ai-service
pip install -r requirements.txt
python main.py
```
AI Service will start at: http://localhost:8000

### Option 2: Frontend Only (Demo Mode)

If you just want to see the UI working:
```powershell
cd client
npm run dev
```

The frontend will work with mock data when the backend is not available.

## Default Test Users

After starting the backend, you can register new users or use these test accounts:

- **User**: Register at /register with role "User"
- **Lawyer**: Register at /register with role "Lawyer"
- **Admin**: Create manually in database

## Features to Test

1. **Home Page** - View the landing page with features
2. **Document Analysis** - Upload a PDF/image and get AI analysis
3. **Lawyer Search** - Browse and filter verified lawyers
4. **User Dashboard** - View documents and appointments (after login)

## Troubleshooting

### MongoDB Connection Error
Make sure MongoDB is running:
```powershell
# If using local MongoDB
mongod
```

Or update the connection string in `server/.env` to use MongoDB Atlas.

### Port Already in Use
Change the port in the respective `.env` file.

### AI Service Not Working
The app works without the AI service - it will use mock analysis data.
