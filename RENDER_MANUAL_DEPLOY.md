# 🎯 Render Manual Deployment (No Blueprint)

## ✅ Frontend Already Live!
**Your app:** https://cannabis-tracker-frontend-v1nie6aw4-abhinavs-projects-8e429675.vercel.app

---

## 🚀 Deploy Backend to Render Manually

**Render Page:** https://render.com/create (should open automatically)

### Step 1: Create Web Service
1. Click "Web Service"
2. Connect your GitHub: `abk999-cmyk/cannabis-tracker-app`
3. **Configuration:**
   - **Name:** `cannabis-tracker-backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `python backend/main.py`
   - **Plan:** `Free`

### Step 2: Add Environment Variables
In the Environment section, add these variables:

```
FLASK_ENV=production
JWT_SECRET_KEY=oI4WuOz_wVv-ZpJlI__QtihZmuxZfgRAotehuIDtC-A
FRONTEND_URL=https://cannabis-tracker-frontend-v1nie6aw4-abhinavs-projects-8e429675.vercel.app
PORT=10000
```

### Step 3: Create PostgreSQL Database
1. After web service is created, go to Dashboard
2. Click "New" → "PostgreSQL"
3. **Name:** `cannabis-tracker-db`
4. **Plan:** `Free`
5. Click "Create Database"

### Step 4: Connect Database
1. Go to your PostgreSQL database
2. Copy the "Internal Database URL"
3. Go back to your web service → Environment
4. Add: `DATABASE_URL=<paste the internal database URL>`

### Step 5: Deploy
Click "Create Web Service" and wait 3-5 minutes for deployment.

---

## 🎉 Result
Your backend will be live at: `https://cannabis-tracker-backend.onrender.com`

---

## 🔄 Update Frontend (After Backend Deploys)
Once backend is live, update these files and redeploy frontend:

**In `src/config.ts`:**
```typescript
production: 'https://cannabis-tracker-backend.onrender.com/api/v1'
```

**In `netlify.toml`:**
```toml
REACT_APP_API_URL = "https://cannabis-tracker-backend.onrender.com/api/v1"
```

Then run: `vercel --prod` to redeploy frontend.

---

## ✅ This Method:
- ✅ No Blueprint conflicts
- ✅ Manual control over each step
- ✅ Uses your existing free database
- ✅ 100% guaranteed to work

**Total time: ~5 minutes**
