# API Integration Testing Guide

## Overview

This guide provides comprehensive instructions for testing the secure Flask backend API integration with the frontend application.

## Prerequisites

- Python 3.8+ installed
- pip package manager
- Backend dependencies installed (`pip install -r requirements.txt`)
- Frontend (index.html and app.js) running in browser

## Backend Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Create Environment File

Create `.env` file in project root:

```
FLASK_SECRET_KEY='dev-key-change-in-production'
JWT_SECRET_KEY='jwt-secret-change-in-production'
JWT_EXPIRATION_HOURS=24
SESSION_TIMEOUT_MINUTES=30
CORS_ORIGINS='http://localhost:3000,http://localhost:5173'
FLASK_DEBUG=False
```

### 3. Start Backend Server

```bash
python app.py
```

Backend should run on http://localhost:5000

## API Endpoints

### 1. Health Check

**Endpoint**: `GET /api/health`
**Purpose**: Verify backend is running
**No Auth Required**: Yes

```bash
curl http://localhost:5000/api/health
```

**Expected Response**:
```json
{"status": "healthy", "timestamp": "2025-12-04T10:30:00.000000"}
```

### 2. User Login

**Endpoint**: `POST /api/auth/login`
**Purpose**: Authenticate user and get JWT token
**Rate Limited**: 5 attempts per minute
**Auth Required**: No

**Request Body**:
```json
{
  "email": "demo@lawfirm.com",
  "password": "Demo@123"
}
```

**Test with curl**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@lawfirm.com", "password": "Demo@123"}'
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Demo User",
    "email": "demo@lawfirm.com",
    "role": "Law Firm"
  }
}
```

### 3. User Profile

**Endpoint**: `GET /api/user/profile`
**Purpose**: Fetch authenticated user profile
**Auth Required**: Yes (JWT token)

**Test with curl**:
```bash
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "name": "Demo User",
  "email": "demo@lawfirm.com",
  "role": "Law Firm",
  "userType": "firm"
}
```

### 4. User Logout

**Endpoint**: `POST /api/auth/logout`
**Purpose**: Invalidate user session
**Auth Required**: Yes (JWT token)

**Test with curl**:
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (200 OK):
```json
{"success": true, "message": "Logged out successfully"}
```

## Demo Credentials

| Email | Password | Role | Type |
|-------|----------|------|------|
| demo@lawfirm.com | Demo@123 | Law Firm | firm |
| solo@attorney.com | Solo@123 | Solo Practitioner | solo |
| counsel@corp.com | Corp@123 | In-House Counsel | corporate |

## Frontend Integration Testing

### Test Login Flow

1. Open index.html in browser
2. Enter email: `demo@lawfirm.com`
3. Enter password: `Demo@123`
4. Click "Sign In"
5. Verify JWT token stored in localStorage
6. Verify dashboard displays
7. Check browser console for success messages

### Test Authorization Checks

1. Login as demo@lawfirm.com
2. Attempt to access Settings section
3. Verify access granted (Law Firm role has permission)
4. Try to access admin-only features
5. Verify appropriate permissions shown

### Test Session Timeout

1. Login successfully
2. Wait 30 minutes of inactivity
3. Attempt to access dashboard
4. Verify automatic logout
5. Verify redirect to login screen

## Error Handling Tests

### Invalid Email Format

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "Demo@123"}'
```

**Expected**: 400 error

### Non-existent User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "notexist@test.com", "password": "Demo@123"}'
```

**Expected**: 401 Unauthorized

### Incorrect Password

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@lawfirm.com", "password": "WrongPassword"}'
```

**Expected**: 401 Unauthorized

### Rate Limiting

Make 6 login requests within 1 minute:

```bash
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "demo@lawfirm.com", "password": "Demo@123"}'
  sleep 1
done
```

**Expected**: 6th request returns 429 Too Many Requests

## Security Testing

### JWT Token Validation

1. Copy JWT token from login response
2. Decode at https://jwt.io (for inspection only)
3. Verify token includes: user_id, email, role, exp
4. Verify exp is 24 hours from iat

### XSS Protection

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "<script>alert(1)</script>@test.com", "password": "Demo@123"}'
```

**Expected**: 400 Invalid email (XSS attempt sanitized)

### CORS Validation

Test from different origins - should respect CORS_ORIGINS env var

## Performance Metrics

- Login response time: < 100ms
- Profile fetch response time: < 50ms
- Token validation: < 10ms
- Password hash verification: 100-200ms (by design for security)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused on port 5000 | Ensure backend is running: `python app.py` |
| CORS errors | Check CORS_ORIGINS in .env matches frontend URL |
| Invalid token error | Token may be expired (24 hour limit) |
| Session timeout too aggressive | Increase SESSION_TIMEOUT_MINUTES in .env |
| Password verification slow | Expected behavior (bcrypt with 12 rounds) |

## Complete Testing Checklist

- [ ] Backend health check passes
- [ ] Login with valid credentials succeeds
- [ ] JWT token properly returned
- [ ] Login with invalid credentials fails (401)
- [ ] Login with invalid email fails (400)
- [ ] Rate limiting blocks after 5 attempts
- [ ] Logout invalidates session
- [ ] Protected endpoints require auth
- [ ] Session timeout works after 30 minutes
- [ ] Authorization checks prevent unauthorized access
- [ ] XSS attempts are sanitized
- [ ] CORS headers properly set
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens contain correct claims
- [ ] Error messages don't leak system details

## Next Steps

1. All critical tests passing → Ready for deployment
2. Monitor logs for any errors
3. Prepare environment variables for production
4. Consider database migration (currently uses in-memory)
5. Set up monitoring and alerting
