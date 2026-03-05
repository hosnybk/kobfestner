import express from 'express'
import cors from 'cors'
import session from 'express-session'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json')
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
}

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'))
const writeJson = async (file, data) => fs.writeFile(file, JSON.stringify(data, null, 2))

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(UPLOADS_DIR))
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(DIST_DIR))
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-change-me'
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
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

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' })
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
    // eslint-disable-next-line no-console
    console.log(`API server running on http://localhost:${PORT}`)
  })
})
