import express from 'express'
import cors from 'cors'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { kv } from '@vercel/kv'
import { put } from '@vercel/blob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, 'data')
const UPLOADS_DIR = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads')
const DIST_DIR = path.join(__dirname, 'dist')

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json')
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json')
const CONTACT_FILE = path.join(DATA_DIR, 'contact.json')

// --- DATA ACCESS LAYER ---
// Abstract storage to switch between File System (Dev) and Vercel KV (Prod)

const DB = {
  products: 'products',
  gallery: 'gallery',
  categories: 'categories',
  contact: 'contact'
}

// Default Data
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
const defaultCategories = [
  { id: 'fenster', enabled: true, image: '/categories/fenster.jpg' },
  { id: 'tueren', enabled: true, image: '/categories/tueren.webp' },
  { id: 'rolllaeden', enabled: true, image: '/categories/rolllaeden.png' },
  { id: 'raffstore', enabled: true, image: '/categories/raffstore.webp' },
  { id: 'garagentor', enabled: true, image: '/categories/garagentor.svg' }
]

// Read Data
const readData = async (key, file) => {
  if (process.env.VERCEL) {
    // Vercel KV
    try {
      const data = await kv.get(key)
      if (!data && key === DB.products) return defaultProducts
      if (!data && key === DB.gallery) return defaultGallery
      if (!data && key === DB.categories) return defaultCategories
      return data || []
    } catch (e) {
      console.error('KV Read Error:', e)
      return []
    }
  } else {
    // Local FS
    try {
      return JSON.parse(await fs.readFile(file, 'utf8'))
    } catch {
      // Return defaults if file missing
      if (key === DB.products) return defaultProducts
      if (key === DB.gallery) return defaultGallery
      if (key === DB.categories) return defaultCategories
      return []
    }
  }
}

// Write Data
const writeData = async (key, file, data) => {
  if (process.env.VERCEL) {
    // Vercel KV
    await kv.set(key, data)
  } else {
    // Local FS
    await fs.writeFile(file, JSON.stringify(data, null, 2))
  }
}

// Ensure Data (Local Only)
const ensureDataFiles = async () => {
  if (process.env.VERCEL) {
     // Ensure /tmp/uploads exists on Vercel
     try { await fs.mkdir(UPLOADS_DIR, { recursive: true }) } catch {}
     return
  }
  
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
  try { await fs.access(PRODUCTS_FILE) } catch { await fs.writeFile(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2)) }
  try { await fs.access(GALLERY_FILE) } catch { await fs.writeFile(GALLERY_FILE, JSON.stringify(defaultGallery, null, 2)) }
  try { await fs.access(CATEGORIES_FILE) } catch { await fs.writeFile(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2)) }
  try { await fs.access(CONTACT_FILE) } catch { await fs.writeFile(CONTACT_FILE, '[]') }
}


const app = express()
app.set('etag', false)
app.use(cors({ origin: true, credentials: true }))
// Increase payload limit for Base64 image uploads
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
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

app.use(cookieParser(SESSION_SECRET))

// Only use session in dev or Hostinger. Vercel uses JWT cookie.
if (!process.env.VERCEL) {
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax', 
        secure: IS_PROD
      }
    })
  )
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kobfestner'
let ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''
if (!ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD) {
  ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
}

const verifyToken = (req) => {
  const token = req.cookies?.auth_token
  if (!token) return null
  try {
    const decoded = jwt.verify(token, SESSION_SECRET)
    return decoded.user === ADMIN_USERNAME ? decoded.user : null
  } catch {
    return null
  }
}

const requireAuth = (req, res, next) => {
  // Check session (Hostinger/Dev)
  if (req.session && req.session.user === ADMIN_USERNAME) return next()
  
  // Check JWT (Vercel)
  if (process.env.VERCEL) {
    const user = verifyToken(req)
    if (user) {
      req.user = user
      return next()
    }
  }
  
  return res.status(401).json({ error: 'Unauthorized' })
}

// Uploads
const storage = multer.memoryStorage() // Use memory storage for Vercel compatibility
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

  // Debug: Log environment status (DO NOT log actual passwords in real production logs if possible, but helpful for debugging now)
  console.log('Auth check:', { 
    inputUser: username, 
    expectedUser: ADMIN_USERNAME, 
    hasHash: Boolean(ADMIN_PASSWORD_HASH),
    envPassLength: process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.length : 0
  })

  if (username !== ADMIN_USERNAME) return res.status(401).json({ error: 'Invalid credentials (user)' })
  
  // Fallback for debugging if hash fails or is missing on Vercel
  if (!ADMIN_PASSWORD_HASH) {
     console.error('Server password not configured properly')
     return res.status(500).json({ error: 'Server password not configured' })
  }

  // Debug hash comparison
  const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  if (!ok) {
    console.error('Password mismatch. Hash:', ADMIN_PASSWORD_HASH.substring(0, 10) + '...')
    return res.status(401).json({ error: 'Invalid credentials (pass)' })
  }

  // Success!
  // Set session for Hostinger/Dev
  if (req.session) {
    req.session.user = ADMIN_USERNAME
    await new Promise((resolve) => req.session.save(resolve))
  }

  // Set JWT Cookie for Vercel
  const token = jwt.sign({ user: ADMIN_USERNAME }, SESSION_SECRET, { expiresIn: '2h' })
  
  // Use res.cookie only if available (Express)
  if (res.cookie) {
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000 // 2 hours
    })
  } else {
    // Fallback: Set header manually if res.cookie is missing (unlikely in Express but safe)
    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=7200; SameSite=Lax${IS_PROD ? '; Secure' : ''}`)
  }

  res.json({ ok: true, username: ADMIN_USERNAME })
})
app.post('/api/auth/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {})
  }
  res.clearCookie('auth_token')
  res.json({ ok: true })
})
app.get('/api/auth/me', (req, res) => {
  res.set('Cache-Control', 'no-store')
  
  let username = null
  if (req.session && req.session.user === ADMIN_USERNAME) {
    username = req.session.user
  } else if (process.env.VERCEL) {
    username = verifyToken(req)
  }

  console.log('Session check:', { username, sessionID: req.sessionID })
  res.json({ authenticated: Boolean(username), username })
})

// Products
app.get('/api/products', async (_req, res) => {
  const items = await readData(DB.products, PRODUCTS_FILE)
  res.json(items)
})
app.get('/api/products/:id', async (req, res) => {
  const items = await readData(DB.products, PRODUCTS_FILE)
  const item = items.find((p) => p.id === Number(req.params.id))
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})
app.post('/api/products', requireAuth, upload.single('image'), async (req, res) => {
  const items = await readData(DB.products, PRODUCTS_FILE)
  const newItem = {
    id: Date.now(),
    ...req.body,
    image: req.file ? `/uploads/${req.file.filename}` : req.body.image
  }
  items.push(newItem)
  await writeData(DB.products, PRODUCTS_FILE, items)
  res.status(201).json(newItem)
})
app.delete('/api/products/:id', requireAuth, async (req, res) => {
  let items = await readData(DB.products, PRODUCTS_FILE)
  items = items.filter((p) => String(p.id) !== String(req.params.id))
  await writeData(DB.products, PRODUCTS_FILE, items)
  res.json({ ok: true })
})
app.put('/api/products/:id', requireAuth, upload.single('image'), async (req, res) => {
  let items = await readData(DB.products, PRODUCTS_FILE)
  const idx = items.findIndex((p) => String(p.id) === String(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  
  items[idx] = {
    ...items[idx],
    ...req.body,
    image: req.file ? `/uploads/${req.file.filename}` : items[idx].image
  }
  await writeData(DB.products, PRODUCTS_FILE, items)
  res.json(items[idx])
})

// Categories
app.get('/api/categories', async (_req, res) => {
  const items = await readData(DB.categories, CATEGORIES_FILE)
  res.json(items)
})
app.post('/api/categories', requireAuth, async (req, res) => {
  const { id, image } = req.body || {}
  const slug = String(id || '').trim().toLowerCase()
  if (!/^[a-z0-9-]+$/.test(slug)) return res.status(400).json({ error: 'Invalid id' })
  const items = await readData(DB.categories, CATEGORIES_FILE)
  if (items.find((c) => c.id === slug)) return res.status(409).json({ error: 'Already exists' })
  const entry = { id: slug, enabled: true, image: typeof image === 'string' ? image : '' }
  items.push(entry)
  await writeData(DB.categories, CATEGORIES_FILE, items)
  res.status(201).json(entry)
})
app.put('/api/categories/:id', requireAuth, async (req, res) => {
  const items = await readData(DB.categories, CATEGORIES_FILE)
  const idx = items.findIndex((c) => c.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  items[idx] = { ...items[idx], ...req.body }
  await writeData(DB.categories, CATEGORIES_FILE, items)
  res.json(items[idx])
})
app.delete('/api/categories/:id', requireAuth, async (req, res) => {
  const items = await readData(DB.categories, CATEGORIES_FILE)
  const next = items.filter((c) => c.id !== req.params.id)
  if (next.length === items.length) return res.status(404).json({ error: 'Not found' })
  await writeData(DB.categories, CATEGORIES_FILE, next)
  res.status(204).end()
})

// Gallery
app.get('/api/gallery/projects', async (_req, res) => {
  const items = await readData(DB.gallery, GALLERY_FILE)
  res.json(items)
})
app.post('/api/gallery/projects', requireAuth, upload.single('image'), async (req, res) => {
  const items = await readData(DB.gallery, GALLERY_FILE)
  const newItem = {
    id: Date.now(),
    category: req.body.category,
    image: req.file ? `/uploads/${req.file.filename}` : ''
  }
  items.push(newItem)
  await writeData(DB.gallery, GALLERY_FILE, items)
  res.status(201).json(newItem)
})
app.delete('/api/gallery/projects/:id', requireAuth, async (req, res) => {
  let items = await readData(DB.gallery, GALLERY_FILE)
  items = items.filter((g) => String(g.id) !== String(req.params.id))
  await writeData(DB.gallery, GALLERY_FILE, items)
  res.json({ ok: true })
})

// Contact Messages
app.get('/api/contact', requireAuth, async (_req, res) => {
  const items = await readData(DB.contact, CONTACT_FILE)
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  res.json(items)
})
app.delete('/api/contact/:id', requireAuth, async (req, res) => {
  let items = await readData(DB.contact, CONTACT_FILE)
  items = items.filter((c) => String(c.id) !== String(req.params.id))
  await writeData(DB.contact, CONTACT_FILE, items)
  res.json({ ok: true })
})
app.post('/api/contact', async (req, res) => {
  const entry = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() }
  
  // Save to DB
  let items = await readData(DB.contact, CONTACT_FILE)
  items.push(entry)
  await writeData(DB.contact, CONTACT_FILE, items)

  // Send Email
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
  } catch (e) {
    console.error('Email error:', e)
  }
  // Vercel: Data is not persisted, but email is sent.
  res.status(201).json({ ok: true })
})


// Upload endpoint (auth required)
app.post('/api/uploads', requireAuth, (req, res, next) => {
  // Debug logging
  console.log('Upload request start')
  next()
}, upload.single('file'), async (req, res) => {
  console.log('Upload file processed:', req.file)
  
  if (!req.file) {
    console.error('Upload error: No file received')
    return res.status(400).json({ error: 'No file' })
  }
  
  try {
    if (process.env.VERCEL) {
       console.log('Vercel environment detected. File in memory.')
       
       if (!req.file.buffer) {
          throw new Error('File buffer missing')
       }

       // Upload to Vercel Blob (CDN)
       try {
         const blob = await put(req.file.originalname, req.file.buffer, {
           access: 'public',
           token: process.env.BLOB_READ_WRITE_TOKEN
         })
         console.log('Upload successful (Vercel Blob):', blob.url)
         return res.status(201).json({ url: blob.url })
       } catch (blobError) {
         console.error('Vercel Blob upload failed:', blobError)
         
         // Fallback to Base64 Data URI if Blob fails (or token missing)
         console.log('Falling back to Base64 Data URI')
         const base64 = req.file.buffer.toString('base64')
         const mime = req.file.mimetype
         const dataUrl = `data:${mime};base64,${base64}`
         return res.status(201).json({ url: dataUrl })
       }
    }

    // Local environment: Write buffer to disk
    const ext = path.extname(req.file.originalname)
    const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`
    const filepath = path.join(UPLOADS_DIR, filename)
    
    await fs.writeFile(filepath, req.file.buffer)
    const url = `/uploads/${filename}`
    
    console.log('Upload successful (local disk):', url)
    res.status(201).json({ url })
  } catch (err) {
    console.error('Upload processing error:', err)
    res.status(500).json({ error: 'Upload failed internal' })
  }
})

// SPA fallback in production (all non-API routes)
if (process.env.NODE_ENV === 'production') {
  app.get(/^\/(?!api\/).*$/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

const PORT = process.env.PORT || 5174

// Export for Vercel
if (process.env.VERCEL) {
  // On Vercel, we can't write to filesystem (except /tmp which is ephemeral)
  // We need to mock ensureDataFiles or handle it gracefully
} else {
  ensureDataFiles().then(() => {
    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`)
    })
  })
}

export default app
