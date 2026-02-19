# 🔧 Fix Login Issue - MongoDB Connection Problem

## 🔴 Problem
Users cannot login because MongoDB Atlas is not accessible. Error: `MongooseError: Operation users.findOne() buffering timed out after 10000ms`

---

## ✅ Solution 1: Whitelist Your IP in MongoDB Atlas (RECOMMENDED)

### Step 1: Get Your Current IP Address
1. Open your browser and go to: https://whatismyipaddress.com/
2. Copy your **IPv4 address** (example: 103.152.34.56)

### Step 2: Login to MongoDB Atlas
1. Go to: https://cloud.mongodb.com/
2. Login with your credentials
3. Select your project: **legalai**

### Step 3: Whitelist Your IP
1. Click on **"Network Access"** in the left sidebar
2. Click **"Add IP Address"** button
3. Choose one of these options:

   **Option A: Add Your Current IP (More Secure)**
   - Click "Add Current IP Address"
   - Or manually enter your IP from Step 1
   - Click "Confirm"

   **Option B: Allow Access from Anywhere (Less Secure, for Development)**
   - Enter IP: `0.0.0.0/0`
   - Description: "Allow all IPs (development only)"
   - Click "Confirm"

4. Wait 1-2 minutes for changes to take effect

### Step 4: Restart Your Backend Server
```powershell
# Stop the current server (Ctrl+C in the terminal)
# Then restart it:
cd "c:\Users\user\Desktop\PRANTI 2026\server"
npm run dev
```

### Step 5: Test Login
1. Open http://localhost:5174
2. Try to login or register
3. You should see: `✅ MongoDB Connected: legalai.rvs1h5d.mongodb.net`

---

## ✅ Solution 2: Use Local MongoDB (Alternative)

If you don't want to use MongoDB Atlas, install MongoDB locally:

### Step 1: Install MongoDB Community Edition
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run on: `mongodb://localhost:27017`

### Step 2: Update .env File
Edit `server/.env` and change line 2:
```env
MONGODB_URI=mongodb://localhost:27017/legalconsult
```

### Step 3: Restart Server
```powershell
cd "c:\Users\user\Desktop\PRANTI 2026\server"
npm run dev
```

---

## ✅ Solution 3: Create Test User Without Database (Quick Fix)

If you just want to test the app without fixing MongoDB:

### Modify the auth controller to use a mock user:

Edit `server/src/controllers/authController.js` and add a fallback test user.

**Note:** This is only for testing and should NOT be used in production!

---

## 🔍 How to Verify It's Fixed

After applying any solution, check the server logs for:

✅ **Success:**
```
✅ MongoDB Connected: legalai.rvs1h5d.mongodb.net
```

❌ **Still Broken:**
```
❌ MongoDB Connection Error: ...
⚠️  Server will continue without database connection
```

---

## 📝 Current MongoDB Configuration

**Connection String:**
```
mongodb+srv://sagarprem2006_dbuser:1536Premsagar%40@legalai.rvs1h5d.mongodb.net/legalconsult?retryWrites=true&w=majority&appName=legalai
```

**Cluster:** legalai.rvs1h5d.mongodb.net
**Database:** legalconsult
**Username:** sagarprem2006_dbuser
**Password:** 1536Premsagar@ (URL encoded as %40)

---

## 🚀 Recommended Action

**For Development:** Use Solution 1, Option B (Allow all IPs: 0.0.0.0/0)
**For Production:** Use Solution 1, Option A (Whitelist specific IPs)

---

**After fixing, users will be able to:**
- ✅ Register new accounts
- ✅ Login successfully
- ✅ Upload documents
- ✅ Book appointments
- ✅ Access all database features
