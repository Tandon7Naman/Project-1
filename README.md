# Tandon Associates Dashboard (Demo)

A demo login + dashboard UI for a legal operations platform. This repository contains a single-page app with externalized assets.

## Quick Start

- Open `tandon_dashboard_login.html` in your browser.
- Demo credentials:
  - Email: `demo@lawfirm.com`
  - Password: `Demo@123`
- Explore sections via the left sidebar.

## Files

- `tandon_dashboard_login.html` — main HTML shell
- `styles.css` — all styles and responsive rules
- `app.js` — demo authentication, UI toggles, section navigation, session restore

## Accessibility Notes

- Semantic landmarks: `header`, `main`, `aside`, and `section` used for structure.
- ARIA attributes: `aria-controls`, `aria-label`, `aria-current` applied where helpful.
- Live region: main content updates announced via `aria-live="polite"`.
- Focus visibility: prominent `:focus-visible` styles for buttons and sidebar links.
- Reduced motion: respects `prefers-reduced-motion` to disable animations/transitions.
- Forms: labels linked via `for`, inputs include `autocomplete`, `inputmode`, and `autocapitalize` settings.

## Security Checklist (for Production)

This demo uses client-side auth with `localStorage` and hardcoded users. For production:

- Authentication & Sessions: implement server-side auth, hashed passwords (bcrypt/argon2), and session management.
- Cookies: use secure, httpOnly cookies with appropriate `SameSite`.
- Content Security Policy (CSP): enforce a strict CSP, avoid inline scripts/styles or use nonces.
- Input Validation: validate and sanitize on the server; add rate limiting.
- Clickjacking: set `frame-ancestors` (or `X-Frame-Options`) to restrict embedding.
- Transport Security: enforce HTTPS, HSTS, and secure caching headers.
- 2FA: only display as enabled when implemented; otherwise mark as demo.

## Performance Tips

- Asset caching: externalized `styles.css` and `app.js` for browser caching.
- Minification: consider minifying CSS/JS for production.
- Cache busting: append versions (e.g., `styles.css?v=1`) or use a build pipeline.
- Tables & lists: paginate or virtualize large datasets.

## Notes

- All data is sample/dummy; no backend is included.
- Replace emojis with a consistent icon set if preferred.
