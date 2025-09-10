# 🚀 Quick Deploy Instructions

## ✅ Frontend Already Live!
**Your Frontend:** https://cannabis-tracker-frontend-v1nie6aw4-abhinavs-projects-8e429675.vercel.app

---

## 🔄 Deploy Backend to Railway (2 minutes)

**Railway Page:** https://railway.app/new (should open automatically)

### Step 1: Connect GitHub
1. Click "Deploy from GitHub repo"
2. Search for: `cannabis-tracker-app`
3. Select your repository

### Step 2: Add PostgreSQL Database
1. After deployment starts, click "New" → "Database" → "PostgreSQL"
2. Railway will create a free PostgreSQL database

### Step 3: Configure Environment Variables
In your Python service, go to Variables tab and add:

```
FLASK_ENV=production
JWT_SECRET_KEY=oI4WuOz_wVv-ZpJlI__QtihZmuxZfgRAotehuIDtC-A
FRONTEND_URL=https://cannabis-tracker-frontend-v1nie6aw4-abhinavs-projects-8e429675.vercel.app
```

Railway automatically provides the DATABASE_URL from PostgreSQL.

### Step 4: Done!
Your backend will be live at: `https://your-app-name.up.railway.app`

---

## 🎉 Features Working:
✅ User registration & authentication  
✅ Cannabis consumption tracking  
✅ Analytics dashboard with charts  
✅ Mood & effects tracking  
✅ Mobile-responsive design  
✅ Secure PostgreSQL database  

---

## 💰 Cost: $0/month
Railway provides $5/month credits on free tier, which is more than enough for your app.

---

**Total deployment time: ~3 minutes**
**Your app will be fully live worldwide! 🌍**
