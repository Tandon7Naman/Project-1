# Security Guidelines for Tandon Legal Operations Dashboard

## Overview

This document outlines the security best practices and guidelines for the Tandon Associates legal operations platform.

## Authentication & Authorization

### Password Security
- All passwords must be hashed using bcrypt with at least 12 rounds
- Minimum password requirements:
  - 12 characters minimum length
  - Must contain uppercase, lowercase, numbers, and special characters
  - No dictionary words or common patterns
- Implement password expiration: 90 days
- Prevent password reuse: Last 5 passwords cannot be reused

### JWT Tokens
- Use HS256 algorithm with strong secret key (minimum 256 bits)
- Token expiration: 24 hours
- Refresh tokens should have 7-day expiration
- Include user ID and role in JWT payload
- Validate token signature on every request

### Session Management
- Implement secure session cookies:
  - HttpOnly flag: Always enabled
  - Secure flag: Enabled in production (HTTPS only)
  - SameSite: Set to 'Strict' or 'Lax'
- Session timeout: 30 minutes of inactivity
- Implement logout to invalidate sessions immediately

## Input Validation & XSS Protection

### Frontend Validation
- Use DOMPurify for sanitizing HTML content
- Validate all user input on the client side
- Never trust client-side validation alone

### Backend Validation
- Use Pydantic for request validation
- Whitelist allowed characters for each field
- Reject requests with invalid data types
- Implement proper error messages without system details

### XSS Prevention
- Escape all user input in HTML context
- Use Content Security Policy (CSP) headers
- Implement X-XSS-Protection header

## API Security

### Rate Limiting
- Login endpoint: 5 attempts per minute per IP
- General API endpoints: 100 requests per hour per user
- File upload endpoint: 10 requests per hour per user

### CORS Configuration
- Whitelist specific origins only
- Use credentials: true only for trusted origins
- Allow specific HTTP methods
- Validate Origin header on server

### API Response Security
- Never expose sensitive information in error messages
- Don't reveal whether a user exists (for login endpoint)
- Implement proper HTTP status codes
- Log security-relevant events

## Database Security

### Connection Security
- Use SSL/TLS for database connections
- Store credentials in environment variables
- Use connection pooling to prevent exhaustion

### SQL Injection Prevention
- Use parameterized queries exclusively
- Use SQLAlchemy ORM which handles escaping
- Never concatenate user input into SQL

### Data Encryption
- Encrypt sensitive fields (SSN, Document IDs, Case Details)
- Use AES-256 for encryption at rest
- Use TLS 1.3 for data in transit

## File Upload Security

### File Validation
- Whitelist allowed file types (.pdf, .docx, .xlsx, .doc, .xls)
- Validate file MIME type on server
- Scan files with malware detection
- Limit file size to 50MB

### File Storage
- Store files outside web root
- Generate random filenames
- Store original filename separately (encrypted)
- Implement access control for file retrieval

## HTTPS/SSL Configuration

### Certificate Management
- Use valid SSL certificate from trusted CA
- Certificate must include all domains
- Implement HSTS (Strict-Transport-Security)
- Use minimum TLS 1.2, prefer TLS 1.3

### Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## Logging & Monitoring

### Security Events to Log
- Login attempts (success and failure)
- Access to sensitive data
- Failed authentication attempts
- Administrative actions
- File uploads and downloads
- API errors

### Log Storage
- Store logs securely with restricted access
- Do not log passwords or tokens
- Implement log rotation (30-day retention)
- Use structured logging (JSON format)

## Vulnerability Management

### Dependency Updates
- Review and update dependencies monthly
- Use pip-audit to check for vulnerabilities
- Test updates in staging before production

### Code Review
- Implement mandatory peer code reviews
- Use static code analysis tools
- Perform security-focused reviews

## Incident Response

### Breach Notification
- Notify affected users within 24 hours
- Preserve evidence and logs
- Document incident details
- Coordinate with legal team

### Recovery
- Reset affected user passwords
- Invalidate active sessions
- Review access logs
- Implement additional monitoring

## Compliance & Standards

### Standards
- Adhere to OWASP Top 10
- Follow India IT Act security requirements
- Comply with data protection regulations

## Security Contact

For security issues, email: security@tandonassociates.com
Do not disclose security vulnerabilities publicly.
