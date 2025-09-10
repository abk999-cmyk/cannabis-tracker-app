# 🚀 Complete Cannabis Tracker - Render Deployment

## 🎯 Deploy Everything to Render (One Platform)

We'll deploy both frontend and backend to Render for a complete solution.

### Step 1: Deploy Backend + Database

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect GitHub repo: `abk999-cmyk/cannabis-tracker-app`
4. Configure:
   - **Name**: `cannabis-tracker-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python backend/main.py`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   FLASK_ENV=production
   JWT_SECRET_KEY=oI4WuOz_wVv-ZpJlI__QtihZmuxZfgRAotehuIDtC-A
   FRONTEND_URL=https://cannabis-tracker-frontend.onrender.com
   PORT=10000
   ```

6. Click "Create Web Service"

### Step 2: Add PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `cannabis-tracker-db`
   - **Plan**: Free
3. Click "Create Database"
4. Copy the **Internal Database URL**
5. Go back to your web service → Environment
6. Add: `DATABASE_URL=<paste the database URL>`

### Step 3: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect same GitHub repo: `abk999-cmyk/cannabis-tracker-app`
3. Configure:
   - **Name**: `cannabis-tracker-frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Free

4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://cannabis-tracker-backend.onrender.com/api/v1
   ```

5. Click "Create Static Site"

## 🎉 Final Result

Your complete Cannabis Tracker will be live at:
- **App**: https://cannabis-tracker-frontend.onrender.com
- **API**: https://cannabis-tracker-backend.onrender.com

## ✅ Features Included

- 🔐 User registration & authentication
- 📊 Cannabis consumption tracking
- 📈 Analytics dashboard with charts
- 🎭 Mood & effects tracking
- 📱 Mobile-responsive design
- 🔒 Secure PostgreSQL database
- 💰 100% free hosting

**Total deployment time: ~10 minutes**
**Total cost: $0/month**
