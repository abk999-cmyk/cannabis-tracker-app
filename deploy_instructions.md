# Cannabis Tracker - Production Deployment Guide

## Backend Deployment (Railway)

### Step 1: Deploy to Railway
1. Go to [Railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select this repository
4. Railway will automatically detect it's a Python app

### Step 2: Add PostgreSQL Database
1. In your Railway project dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will create a PostgreSQL database and provide connection details

### Step 3: Configure Environment Variables
In Railway dashboard, go to your Python service → Variables tab and add:

```
DB_HOST=<from Railway PostgreSQL service>
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<from Railway PostgreSQL service>
DB_PORT=5432
JWT_SECRET_KEY=<generate a secure random key>
FLASK_ENV=production
FRONTEND_URL=https://your-app-name.netlify.app
```

### Step 4: Get Backend URL
After deployment, Railway will provide a URL like: `https://your-app-name-production.up.railway.app`

## Frontend Deployment (Netlify)

### Step 1: Update API URL
Update the API_BASE_URL in `src/App.tsx` to point to your Railway backend URL

### Step 2: Build and Deploy
1. Run `npm run build` to create production build
2. Go to [Netlify.com](https://netlify.com) and sign up/login
3. Drag and drop the `build` folder to Netlify
4. Or connect your GitHub repo for automatic deployments

### Step 3: Configure Netlify
Update `netlify.toml` if needed for custom domain or redirects.

## Post-Deployment
1. Test user registration and login
2. Test creating entries and viewing analytics
3. Verify all functionality works across different devices
4. Set up monitoring and backups as needed

## Environment Variables Summary

**Required for Railway (Backend):**
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`
- `JWT_SECRET_KEY`
- `FLASK_ENV=production`
- `FRONTEND_URL`

**Railway will automatically set:**
- `PORT` (for the web service)

## Security Notes
- Always use strong, unique passwords for database
- Generate a secure JWT secret key (32+ characters)
- Enable HTTPS (Railway and Netlify provide this automatically)
- Consider adding rate limiting in production
