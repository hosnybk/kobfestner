import { writeFile, mkdir } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let site = process.env.SITE_URL || process.env.VITE_SITE_URL || ''
for (const a of process.argv.slice(2)) {
  if (a.startsWith('--site=')) site = a.slice(7)
}
if (!site) site = 'https://bisque-dugong-112314.hostingersite.com'
if (site.endsWith('/')) site = site.slice(0, -1)

const urls = ['/', '/about', '/products', '/gallery', '/contact']
const xmlItems = urls
  .map(
    (u) => `<url><loc>${site}${u}</loc><changefreq>weekly</changefreq><priority>${u === '/' ? '1.0' : '0.8'}</priority></url>`
  )
  .join('')
const xml = `<?xml version="1.0" encoding="UTF-8"?>` + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xmlItems}</urlset>`
const distDir = join(dirname(__dirname), 'dist')
await mkdir(distDir, { recursive: true })
await writeFile(join(distDir, 'sitemap.xml'), xml)
await writeFile(join(distDir, 'robots.txt'), `User-agent: *\nDisallow: /admin\nDisallow: /admin/\nDisallow: /admin/*\nSitemap: ${site}/sitemap.xml\n`)
console.log('Sitemap and robots generated for', site)

