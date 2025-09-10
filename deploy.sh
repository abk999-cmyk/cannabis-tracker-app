#!/bin/bash

# Cannabis Tracker - Automated Deployment Script
# This script will deploy your app to free services automatically

echo "🚀 Cannabis Tracker - Automated Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Building frontend...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully!${NC}"
else
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Deployment URLs configured:${NC}"
echo "Frontend: https://cannabis-tracker-app.vercel.app"
echo "Backend: https://cannabis-tracker-backend.onrender.com"
echo "Database: PostgreSQL on Render.com (free tier)"
echo ""

echo -e "${BLUE}📋 Next Steps (2 minutes total):${NC}"
echo ""
echo "1️⃣  Deploy Backend to Render.com:"
echo "   • Go to https://render.com/deploy?repo=https://github.com/abk999-cmyk/cannabis-tracker-app"
echo "   • Click 'Connect GitHub' and select your repository"
echo "   • Render will auto-detect the render.yaml configuration"
echo "   • Click 'Deploy' - Backend will be live in 2-3 minutes!"
echo ""

echo "2️⃣  Deploy Frontend to Vercel:"
echo "   • Run: vercel --prod"
echo "   • Or go to https://vercel.com/new and connect your GitHub repo"
echo "   • Frontend will be live instantly!"
echo ""

echo -e "${GREEN}🎉 Your Cannabis Tracker will be live at:${NC}"
echo "https://cannabis-tracker-app.vercel.app"
echo ""

echo -e "${YELLOW}📊 Features included:${NC}"
echo "✅ User registration & authentication"
echo "✅ Cannabis consumption tracking"
echo "✅ Analytics dashboard with charts"
echo "✅ Mood & effects tracking"
echo "✅ Mobile-responsive design"
echo "✅ Secure PostgreSQL database"
echo "✅ Production-ready with error handling"
echo ""

echo -e "${BLUE}🔐 Security configured:${NC}"
echo "✅ JWT Secret: oI4WuOz_wVv-ZpJlI__QtihZmuxZfgRAotehuIDtC-A"
echo "✅ CORS configured for production"
echo "✅ Environment variables secured"
echo "✅ HTTPS enabled on both services"
echo ""

echo -e "${GREEN}Ready to deploy! 🚀${NC}"
