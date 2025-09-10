# 🎯 PythonAnywhere Deployment (100% Free)

## ✅ Frontend Already Live!
**Your app:** https://cannabis-tracker-frontend-v1nie6aw4-abhinavs-projects-8e429675.vercel.app

---

## 🚀 Deploy Backend to PythonAnywhere (Completely Free)

### Step 1: Sign Up
1. Go to: https://www.pythonanywhere.com/registration/register/beginner/
2. Create free account (no credit card needed!)
3. Choose username (e.g., `abhinavcannabis`)

### Step 2: Upload Code
1. Go to "Files" tab in PythonAnywhere dashboard
2. Click "Upload a file" 
3. Upload this project as ZIP or use Git:
   ```bash
   git clone https://github.com/abk999-cmyk/cannabis-tracker-app.git
   ```

### Step 3: Set Up Web App
1. Go to "Web" tab → "Add a new web app"
2. Choose "Flask" → "Python 3.10"
3. **Flask app location:** `/home/yourusername/cannabis-tracker-app/backend/main.py`
4. **Working directory:** `/home/yourusername/cannabis-tracker-app`

### Step 4: Install Dependencies
1. Go to "Consoles" tab → "Bash"
2. Run:
   ```bash
   cd cannabis-tracker-app
   pip3.10 install --user -r requirements.txt
   ```

### Step 5: Configure Environment Variables
1. Go to "Web" tab → your app
2. Scroll to "Environment variables"
3. Add:
   ```
   FLASK_ENV=production
   JWT_SECRET_KEY=oI4WuOz_wVv-ZpJlI__QtihZmuxZfgRAotehuIDtC-A
   FRONTEND_URL=https://cannabis-tracker-frontend-v1nie6aw4-abhinavs-projects-8e429675.vercel.app
   ```

### Step 6: Set Up Database
1. Go to "Databases" tab
2. Create PostgreSQL database (free tier included!)
3. Note the connection details
4. Add `DATABASE_URL` to environment variables

### Step 7: Deploy
1. Click "Reload" button in Web tab
2. Your app will be live at: `https://yourusername.pythonanywhere.com`

---

## 🎉 Why PythonAnywhere is Perfect:
- ✅ Completely free (no credit card)
- ✅ Built for Python/Flask
- ✅ Includes free PostgreSQL database
- ✅ Simple file upload/Git integration
- ✅ Reliable hosting

---

**Total time: ~10 minutes**
**Cost: $0 forever**
