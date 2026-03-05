# Deployment guide (Hostinger static + external API)

## Summary
- Frontend (Vite SPA) is deployed on Hostinger static hosting.
- API (Node.js) is deployed on a managed service (e.g., Render).
- The SPA calls the API via `VITE_API_BASE_URL`.

## 1) Deploy API on Render
1. Push repository to GitHub/GitLab.
2. Render → New Web Service → select repo.
3. Environment: Node 18.
4. Build command: `npm ci`
5. Start command: `node server/index.js`
6. Environment variables:
   - `ADMIN_USERNAME=kobfestner`
   - `ADMIN_PASSWORD=KobFenster#2026!`
   - `SESSION_SECRET=<a long unique string>`
7. Deploy and note the URL, e.g., `https://your-app.onrender.com`
8. Test: `GET https://your-app.onrender.com/api/health`

## 2) Build SPA with API URL
Use the helper script:
```
npm run build:api -- --api=https://your-app.onrender.com
```
Result is generated in `dist/`.

Pack the build as a zip (Windows PowerShell):
```
npm run zip:dist
```
This creates `dist.zip`.

## 3) Upload SPA to Hostinger
1. hPanel → File Manager → `public_html` of your temporary website.
2. Upload `dist.zip` and extract contents into `public_html`.
   - Ensure `index.html`, `assets/` and `.htaccess` exist at `public_html`.
3. Browse: `https://<your-temporary-domain>/`
4. Admin:
   - `https://<your-temporary-domain>/admin`
   - Login with your credentials

## 4) Updates
1. Update code locally.
2. Rebuild with API URL:
```
npm run build:api -- --api=https://your-app.onrender.com
```
3. `npm run zip:dist`
4. Re-upload `dist.zip` to `public_html` and extract.

## Notes
- If you later move API behind your own domain, rebuild the SPA with the new base:
```
npm run build:api -- --api=https://api.yourdomain.com
```
- For security, prefer `ADMIN_PASSWORD_HASH` (bcrypt) in API environment rather than plaintext.

