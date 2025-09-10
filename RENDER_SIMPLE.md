# 🎯 Super Simple Render Deployment

## ✅ Frontend Already Live!
Your app: https://cannabis-tracker-frontend-v1nie6aw4-abhinavs-projects-8e429675.vercel.app

## 🚀 Deploy Backend to Render (5 minutes)

### Step 1: Connect GitHub
1. On Render page (should be open), click "Web Service"
2. Connect your GitHub account
3. Select repository: `abk999-cmyk/cannabis-tracker-app`

### Step 2: Configure Service
Fill in these settings:
- **Name**: `cannabis-tracker-backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python backend/main.py`

### Step 3: Add Environment Variables
```
FLASK_ENV=production
JWT_SECRET_KEY=oI4WuOz_wVv-ZpJlI__QtihZmuxZfgRAotehuIDtC-A
FRONTEND_URL=https://cannabis-tracker-frontend-v1nie6aw4-abhinavs-projects-8e429675.vercel.app
PORT=10000
```

### Step 4: Create Database
1. After web service deploys, click "New" → "PostgreSQL"
2. Name: `cannabis-tracker-db`
3. Copy the Internal Database URL
4. Add to web service environment: `DATABASE_URL=<the URL>`

### Step 5: Deploy!
Click "Create Web Service" - Done in 3 minutes!

## 🎉 Result
- Frontend: ✅ Vercel (already working)
- Backend: 🔄 Render (deploying now)
- Database: 🔄 PostgreSQL on Render

**Your app will be fully live at the existing frontend URL!**
