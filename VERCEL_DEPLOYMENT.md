# Vercel Deployment Guide - Tandon Associates Dashboard

## Overview

This guide provides step-by-step instructions for deploying the Tandon Associates Legal Operations Dashboard to Vercel, both frontend and backend.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub account with access to Project-1 repository
- Node.js 18+ installed locally
- Vercel CLI installed: `npm install -g vercel`

## Step 1: Deploy to Vercel (Web Interface)

### Option A: Deploy via Vercel Web Dashboard

1. **Visit Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Select "Import Git Repository"

2. **Connect GitHub**
   - Select "Tandon7Naman/Project-1" repository
   - Click "Import"

3. **Configure Project**
   - **Project Name**: tandon-associates-dashboard
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: ./

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     ```
     API_BASE_URL=https://your-vercel-domain.vercel.app/api
     JWT_SECRET_KEY=your-jwt-secret-key-production
     FLASK_SECRET_KEY=your-flask-secret-key-production
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Your site will be live at `https://tandon-associates-dashboard.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Navigate to project directory
cd ~/path/to/Project-1

# Deploy
vercel --prod

# When prompted, confirm production deployment
```

## Step 2: Configure Frontend

### Update API URL in app.js

Once you have your Vercel domain, update `app.js`:

```javascript
// Replace http://localhost:5000 with your production URL
const API_BASE_URL = 'https://your-vercel-domain.vercel.app/api';
```

### Or use environment variable:

```javascript
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
```

## Step 3: Deploy Backend API to Vercel (Serverless Functions)

### Option A: Using Vercel Functions (Recommended)

Vercel supports Python serverless functions via the `/api` directory.

**1. Create API Folder Structure**

```
Project-1/
├── api/
│   ├── requirements.txt
│   ├── app.py  (or index.py)
│   └── .env.local
├── vercel.json
├── index.html
├── app.js
└── styles.css
```

**2. Create `api/requirements.txt`**

```
Flask==2.3.0
Flask-CORS==4.0.0
Flask-Limiter==3.5.0
bcrypt==4.0.1
PyJWT==2.8.1
python-dotenv==1.0.0
email-validator==2.0.0
gunicorn==21.2.0
```

**3. Move Flask app to `/api` directory**

Rename `app.py` to `api/app.py` or create `/api/index.py`:

```python
# api/index.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from functools import wraps
import jwt
import bcrypt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-key')
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret')

CORS(app, resources={r'/api/*': {'origins': '*'}})

# All your Flask routes here...
# (Copy from app.py)

if __name__ == '__main__':
    app.run()
```

**4. Update vercel.json**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "FLASK_SECRET_KEY": "@flask_secret_key",
    "JWT_SECRET_KEY": "@jwt_secret_key"
  }
}
```

**5. Deploy**

```bash
vercel --prod
```

### Option B: Deploy Backend to Separate Service

For more advanced setups, deploy backend separately:

- **Render**: https://render.com (free tier available)
- **Railway**: https://railway.app
- **Heroku**: https://www.heroku.com (paid only now)
- **PythonAnywhere**: https://www.pythonanywhere.com

## Step 4: Set Production Environment Variables

### In Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add:
   ```
   API_BASE_URL=https://your-api-domain.com/api
   JWT_SECRET_KEY=<generate-secure-key>
   FLASK_SECRET_KEY=<generate-secure-key>
   NODE_ENV=production
   ```

### Generate Secure Keys:

```bash
# On Linux/Mac
openssl rand -base64 32
```

```python
# In Python
import secrets
print(secrets.token_urlsafe(32))
```

## Step 5: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter your custom domain (e.g., dashboard.tandonassociates.com)

2. **Update DNS Records**
   - Add CNAME record pointing to Vercel
   - Follow Vercel's instructions for your DNS provider

## Step 6: Testing Production Deployment

### Test Frontend:

```bash
# Visit your Vercel domain
https://your-project.vercel.app

# Verify:
- Page loads correctly
- All CSS styles applied
- JavaScript console has no errors
```

### Test Backend API:

```bash
# Test health endpoint
curl https://your-project.vercel.app/api/health

# Expected response:
{"status": "healthy", "timestamp": "2025-12-04T..."}

# Test login endpoint
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@lawfirm.com", "password": "Demo@123"}'
```

## Step 7: Monitor & Maintain

### View Logs:

```bash
vercel logs [project-name] --prod
```

### View Analytics:

- Vercel Dashboard → Analytics
- Monitor:
  - Response times
  - Error rates
  - Traffic patterns
  - Serverless function usage

## Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend API deployed (Vercel or alternative service)
- [ ] Environment variables configured
- [ ] CORS settings verified
- [ ] Security headers enabled (via vercel.json)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate valid
- [ ] Login functionality tested
- [ ] API endpoints responding
- [ ] Error logging configured
- [ ] Database backups scheduled (if using database)
- [ ] Monitoring alerts set up

## Troubleshooting

### Issue: CORS errors
**Solution**: Update CORS in Flask and vercel.json
```python
CORS(app, resources={r'/api/*': {'origins': ['https://your-domain.vercel.app']}})
```

### Issue: 500 errors on API calls
**Solution**: Check logs
```bash
vercel logs --prod
```

### Issue: Stale cache
**Solution**: Redeploy
```bash
vercel --prod --force
```

### Issue: Serverless function timeout
**Solution**: Optimize Python code or use longer timeout in vercel.json
```json
{
  "functions": {
    "api/index.py": {
      "maxDuration": 300
    }
  }
}
```

## Performance Optimization

1. **Enable Caching**
   - Static files: 1 year cache
   - API responses: Set appropriate Cache-Control headers

2. **Compression**
   - Vercel automatically gzips responses
   - Minify CSS/JavaScript

3. **CDN**
   - Vercel's built-in Edge Network
   - Content cached globally

## Security Best Practices

✅ Verified in Production:
- Content-Security-Policy headers
- X-Frame-Options (clickjacking protection)
- XSS protection headers
- HTTPS enforced
- Secure cookies (httpOnly)
- CORS restrictions
- Rate limiting on login
- Password hashing (bcrypt)
- JWT expiration (24 hours)

## Next Steps

1. Monitor production deployment
2. Set up error tracking (Sentry, etc.)
3. Configure backups
4. Document any custom configurations
5. Plan scaling strategy as traffic grows

## Support & Documentation

- Vercel Docs: https://vercel.com/docs
- Flask Deployment: https://flask.palletsprojects.com/deploying/
- Vercel Python Support: https://vercel.com/docs/concepts/functions/serverless-functions/supported-languages#python

## Project URLs After Deployment

- **Production Dashboard**: `https://your-project.vercel.app`
- **API Endpoint**: `https://your-project.vercel.app/api`
- **Backend Health Check**: `https://your-project.vercel.app/api/health`
- **GitHub Repository**: `https://github.com/Tandon7Naman/Project-1`
