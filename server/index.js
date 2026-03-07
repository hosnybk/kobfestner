import express from 'express'
import cors from 'cors'
import session from 'express-session'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Load env from server/.env when running locally (Render uses real env vars)
dotenv.config({ path: path.join(__dirname, '.env') })
const DATA_DIR = path.join(__dirname, 'data')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json')
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json')
const CONTACT_FILE = path.join(DATA_DIR, 'contact_messages.json')
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const DIST_DIR = path.join(__dirname, '..', 'dist')

const ensureDataFiles = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const defaultProducts = [
    { id: 1, model: '6108', category: 'tueren', image: '/products/6108.jpg', color: 'RAL 7016 / Dekorfolie Golden Oak', glazing: '3D Edelstahl Lisenen', handle: 'PQ 40 x 20 - 160mm', application: 'Eingangstür' },
    { id: 2, model: '6110', category: 'tueren', image: '/products/6110.jpg', color: 'RAL 9007 / Dekorfolie Montana', glazing: 'Satiniert, durchsichtige Streifen', handle: 'PS 10 - 1200mm', application: 'Eingangstür' },
    { id: 7, model: 'F-220', category: 'fenster', image: '/products/F-220.jpg', color: 'Anthrazit matt', glazing: '3-fach Wärmeschutz', handle: 'Alu-Griff standard', application: 'Neubau & Sanierung' }
  ]
  const defaultGallery = [
    { id: 1, category: 'fenster', image: '/gallery/1.jpg' },
    { id: 2, category: 'tueren', image: '/gallery/2.jpg' },
    { id: 3, category: 'rolllaeden', image: '/gallery/3.jpg' }
  ]
  try { await fs.access(PRODUCTS_FILE) } catch { await fs.writeFile(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2)) }
  try { await fs.access(GALLERY_FILE) } catch { await fs.writeFile(GALLERY_FILE, JSON.stringify(defaultGallery, null, 2)) }
  try {
    await fs.access(CATEGORIES_FILE)
  } catch {
    const defaultCategories = [
    { id: 'fenster', enabled: true, image: '/categories/fenster.jpg' },
    { id: 'tueren', enabled: true, image: '/categories/tueren.webp' },
    { id: 'rolllaeden', enabled: true, image: '/categories/rolllaeden.png' },
    { id: 'raffstore', enabled: true, image: '/categories/raffstore.webp' },
    { id: 'garagentor', enabled: true, image: '/categories/garagentor.svg' }
  ]
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2))
  }
  try { await fs.access(CONTACT_FILE) } catch { await fs.writeFile(CONTACT_FILE, '[]') }
}

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'))
const writeJson = async (file, data) => fs.writeFile(file, JSON.stringify(data, null, 2))

const app = express()
app.set('etag', false)
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(UPLOADS_DIR))
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
  app.use(express.static(DIST_DIR))
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-change-me'
const IS_PROD = process.env.NODE_ENV === 'production'
// On Render/Hostinger, we might be behind a proxy (HTTPS) but node sees HTTP.
// 'trust proxy' 1 is needed.
app.set('trust proxy', 1)

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
      httpOnly: true,
      // In dev (localhost), use 'lax'. In prod (HTTPS), use 'none' for cross-site or 'lax' for same-site.
      // Since frontend/backend are on same domain in prod (served by express), 'lax' is fine and safer.
      // Only if frontend is on different domain (e.g. Vercel) we need 'none'.
      // Here we serve static files from same origin in prod.
      sameSite: 'lax', 
      secure: IS_PROD // Secure only in prod
    }
  })
)

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kobfestner'
let ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''
if (!ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD) {
  ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
}
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user === ADMIN_USERNAME) return next()
  return res.status(401).json({ error: 'Unauthorized' })
}

// Uploads
await fs.mkdir(UPLOADS_DIR, { recursive: true })
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    cb(null, `${Date.now()}_${safe}`)
  }
})
const upload = multer({ storage })

// Friendly root page (dev only) or serve SPA in production
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (_req, res) => {
    res.status(200).send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>KOB API</title>
<style>body{font-family:system-ui,Segoe UI,Arial,sans-serif;padding:2rem;color:#0f172a}a{color:#0369a1;text-decoration:none}</style></head>
<body>
  <h1>KOB Fenster API</h1>
  <p>API en cours d'exécution. Endpoints utiles :</p>
  <ul>
    <li><a href="/api/health">/api/health</a></li>
    <li><a href="/api/products">/api/products</a></li>
    <li><a href="/api/gallery/projects">/api/gallery/projects</a></li>
  </ul>
  <p>En développement, l'app front tourne sur <code>http://localhost:5173</code> et proxy <code>/api</code> vers ce serveur.</p>
</body></html>`)
  })
}

// Convenience redirect
app.get('/api', (_req, res) => res.redirect('/api/health'))

app.get('/api/health', (_req, res) => {
  const configured = Boolean(ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD)
  res.json({ ok: true, authConfigured: configured, username: ADMIN_USERNAME })
})

// Auth
app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt body:', req.body)
  const { username, password } = req.body || {}
  if (!username || !password) {
    console.error('Missing credentials', { username, password })
    return res.status(400).json({ error: 'Missing credentials' })
  }
  if (username !== ADMIN_USERNAME) return res.status(401).json({ error: 'Invalid credentials' })
  if (!ADMIN_PASSWORD_HASH) return res.status(500).json({ error: 'Server password not configured' })
  const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  req.session.user = ADMIN_USERNAME
  res.json({ ok: true, username: ADMIN_USERNAME })
})
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }))
})
app.get('/api/auth/me', (req, res) => {
  res.set('Cache-Control', 'no-store')
  console.log('Session check:', req.sessionID, req.session)
  res.json({ authenticated: req.session?.user === ADMIN_USERNAME, username: req.session?.user || null })
})

// Products
app.get('/api/products', async (_req, res) => {
  const items = await readJson(PRODUCTS_FILE)
  res.json(items)
})

app.get('/api/products/:id', async (req, res) => {
  const items = await readJson(PRODUCTS_FILE)
  const item = items.find((p) => p.id === Number(req.params.id))
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

app.post('/api/products', requireAuth, async (req, res) => {
  const items = await readJson(PRODUCTS_FILE)
  const nextId = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1
  const newItem = { id: nextId, ...req.body }
  items.push(newItem)
  await writeJson(PRODUCTS_FILE, items)
  res.status(201).json(newItem)
})

app.put('/api/products/:id', requireAuth, async (req, res) => {
  const items = await readJson(PRODUCTS_FILE)
  const idx = items.findIndex((p) => p.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  items[idx] = { ...items[idx], ...req.body, id: Number(req.params.id) }
  await writeJson(PRODUCTS_FILE, items)
  res.json(items[idx])
})

app.delete('/api/products/:id', requireAuth, async (req, res) => {
  const items = await readJson(PRODUCTS_FILE)
  const next = items.filter((p) => p.id !== Number(req.params.id))
  await writeJson(PRODUCTS_FILE, next)
  res.status(204).end()
})

// Categories
app.get('/api/categories', async (_req, res) => {
  const items = await readJson(CATEGORIES_FILE)
  res.json(items)
})
app.post('/api/categories', requireAuth, async (req, res) => {
  const { id, image } = req.body || {}
  const slug = String(id || '').trim().toLowerCase()
  if (!/^[a-z0-9-]+$/.test(slug)) return res.status(400).json({ error: 'Invalid id' })
  const items = await readJson(CATEGORIES_FILE)
  if (items.find((c) => c.id === slug)) return res.status(409).json({ error: 'Already exists' })
  const entry = { id: slug, enabled: true, image: typeof image === 'string' ? image : '' }
  items.push(entry)
  await writeJson(CATEGORIES_FILE, items)
  res.status(201).json(entry)
})
app.put('/api/categories/:id', requireAuth, async (req, res) => {
  const items = await readJson(CATEGORIES_FILE)
  const idx = items.findIndex((c) => c.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const enabled = typeof req.body?.enabled === 'boolean' ? req.body.enabled : items[idx].enabled
  const image = typeof req.body?.image === 'string' ? req.body.image : items[idx].image
  items[idx] = { ...items[idx], enabled, image }
  await writeJson(CATEGORIES_FILE, items)
  res.json(items[idx])
})
app.delete('/api/categories/:id', requireAuth, async (req, res) => {
  const items = await readJson(CATEGORIES_FILE)
  const next = items.filter((c) => c.id !== req.params.id)
  if (next.length === items.length) return res.status(404).json({ error: 'Not found' })
  await writeJson(CATEGORIES_FILE, next)
  res.status(204).end()
})

// Gallery
app.get('/api/gallery/projects', async (_req, res) => {
  res.json(await readJson(GALLERY_FILE))
})

app.post('/api/gallery/projects', requireAuth, async (req, res) => {
  const items = await readJson(GALLERY_FILE)
  const nextId = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1
  const newItem = { id: nextId, ...req.body }
  items.push(newItem)
  await writeJson(GALLERY_FILE, items)
  res.status(201).json(newItem)
})
app.delete('/api/gallery/projects/:id', requireAuth, async (req, res) => {
  const items = await readJson(GALLERY_FILE)
  const next = items.filter((p) => p.id !== Number(req.params.id))
  await writeJson(GALLERY_FILE, next)
  res.status(204).end()
})

// Contact form
app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, phone, service, message } = req.body || {}
  const errors = []
  if (!firstName || typeof firstName !== 'string') errors.push('firstName')
  if (!lastName || typeof lastName !== 'string') errors.push('lastName')
  if (!email || typeof email !== 'string') errors.push('email')
  if (!message || typeof message !== 'string') errors.push('message')
  if (errors.length) return res.status(400).json({ error: 'Invalid payload', fields: errors })
  const entry = {
    id: Date.now(),
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: String(email).trim(),
    phone: String(phone || '').trim(),
    service: String(service || '').trim(),
    message: String(message).trim(),
    createdAt: new Date().toISOString()
  }
  const items = await readJson(CONTACT_FILE)
  items.push(entry)
  await writeJson(CONTACT_FILE, items)
  try {
    const host = process.env.SMTP_HOST
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const port = Number(process.env.SMTP_PORT || '587')
    if (host && user && pass) {
      const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
      const to = process.env.NOTIFY_EMAIL || 'kob.fenster@outlook.de'
      const subject = `Neuer Kontakt: ${entry.firstName} ${entry.lastName}`
      const text = `Von: ${entry.firstName} ${entry.lastName}\nE-Mail: ${entry.email}\nTelefon: ${entry.phone}\nService: ${entry.service}\n\n${entry.message}\n\n${entry.createdAt}`
      await transporter.sendMail({ from: `"KOB Fenster" <${user}>`, to, subject, text })
    }
  } catch {}
  res.status(201).json({ ok: true })
})
app.get('/api/contact', requireAuth, async (_req, res) => {
  const items = await readJson(CONTACT_FILE)
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  res.json(items)
})
app.delete('/api/contact/:id', requireAuth, async (req, res) => {
  const items = await readJson(CONTACT_FILE)
  const next = items.filter((m) => String(m.id) !== String(req.params.id))
  await writeJson(CONTACT_FILE, next)
  res.status(204).end()
})

// Upload endpoint (auth required)
app.post('/api/uploads', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  const url = `/uploads/${req.file.filename}`
  res.status(201).json({ url })
})

// SPA fallback in production (all non-API routes)
if (process.env.NODE_ENV === 'production') {
  app.get(/^\/(?!api\/).*$/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

const PORT = process.env.PORT || 5174
ensureDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`)
  })
})
