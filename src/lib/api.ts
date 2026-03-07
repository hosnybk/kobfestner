import type { CatalogProduct } from '../data/catalogProducts'

function getApiBase(): string {
  // On Vercel, the frontend and API are on the same domain, so empty string is best
  if (window.location.hostname.includes('vercel.app')) {
    return ''
  }
  const envObj = (import.meta as unknown as { env?: Record<string, string | undefined> }) || {}
  const base = envObj?.env?.VITE_API_BASE_URL || ''
  if (!base) return ''
  return base.endsWith('/') ? base.slice(0, -1) : base
}
const api = (path: string) => `${getApiBase()}${path}`
const toAbsolute = (url: string): string => {
  if (!url || /^https?:\/\//i.test(url)) return url
  if (url.startsWith('/uploads/')) {
    const base = getApiBase()
    return base ? `${base}${url}` : url
  }
  return url
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toLocalizedText(value: unknown): { de?: string; en?: string } | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return { de: value, en: value }
  if (isRecord(value)) {
    const de = typeof value.de === 'string' ? value.de : undefined
    const en = typeof value.en === 'string' ? value.en : undefined
    if (!de && !en) return undefined
    return { de, en }
  }
  return undefined
}

const DEMO_IMAGE = '/vite.svg'

export async function fetchProducts(): Promise<CatalogProduct[]> {
  try {
    const res = await fetch(api('/api/products'), { headers: { accept: 'application/json' }, credentials: 'include', cache: 'no-store' })
    if (!res.ok) throw new Error('Bad response')
    const items = (await res.json()) as unknown
    if (!isArray(items) || items.length === 0) throw new Error('Empty')

    return (items as CatalogProduct[]).map((p) => ({
      ...p,
      image: p.image ? toAbsolute(p.image) : DEMO_IMAGE,
      datasheet: p.datasheet ? toAbsolute(p.datasheet) : p.datasheet
    }))
  } catch {
    const { catalogProducts } = await import('../data/catalogProducts')
    return catalogProducts.map((p) => ({ ...p, image: DEMO_IMAGE }))
  }
}

export async function fetchGallery(): Promise<Array<{ id: number; category: string; image: string; title?: { de?: string; en?: string }; description?: { de?: string; en?: string }; location?: { de?: string; en?: string } }>> {
  try {
    const res = await fetch(api('/api/gallery/projects'), { headers: { accept: 'application/json' }, credentials: 'include', cache: 'no-store' })
    if (!res.ok) throw new Error('Bad response')
    const items = (await res.json()) as unknown
    if (!isArray(items) || items.length === 0) throw new Error('Empty')

    return (items as Array<Record<string, unknown>>).map((raw) => {
      const it = raw as { id: number; category: string; image: string; title?: unknown; description?: unknown; location?: unknown }
      return {
        id: Number(it.id),
        category: String(it.category || ''),
        image: it.image ? toAbsolute(String(it.image)) : DEMO_IMAGE,
        title: toLocalizedText(it.title),
        description: toLocalizedText(it.description),
        location: toLocalizedText(it.location)
      }
    })
  } catch {
    const { galleryProjects } = await import('../data/galleryProjects')
    return galleryProjects.map((g) => ({ ...g, image: DEMO_IMAGE }))
  }
}

export async function fetchCategories(): Promise<string[]> {
  try {
    const res = await fetch(api('/api/categories'), { headers: { accept: 'application/json' }, credentials: 'include', cache: 'no-store' })
    if (!res.ok) throw new Error('Bad response')
    const arr = (await res.json()) as unknown
    if (!isArray(arr)) throw new Error('Bad response')
    const out = (arr as Array<{ id: string; enabled?: boolean }>).filter((c) => c.enabled !== false).map((c) => c.id)
    if (out.length === 0) throw new Error('Empty')
    return out
  } catch {
    // Fallback to static list
    const mod: { catalogCategories?: readonly string[] } = await import('../data/catalogProducts')
    const staticCats: string[] = mod.catalogCategories ? [...mod.catalogCategories] : ['fenster', 'tueren', 'rolllaeden', 'raffstore']
    return staticCats
  }
}

export type CategoryDetail = { id: string; enabled?: boolean; image?: string }
export async function fetchCategoriesDetailed(): Promise<CategoryDetail[]> {
  try {
    const res = await fetch(api('/api/categories'), { headers: { accept: 'application/json' }, credentials: 'include', cache: 'no-store' })
    if (!res.ok) throw new Error('Bad response')
    const arr = (await res.json()) as unknown
    if (!isArray(arr) || arr.length === 0) throw new Error('Empty')
    return (arr as CategoryDetail[]).map((c) => ({ ...c, image: c.image ? toAbsolute(c.image) : DEMO_IMAGE }))
  } catch {
    // Fallback with images from homeContent if available
    const hc: { default?: { categories?: string[]; categoryImages?: Record<string, string> } } = await import('../data/homeContent.json')
    const cats: string[] = hc.default?.categories || ['fenster', 'tueren', 'rolllaeden', 'raffstore']
    return cats.map((id) => ({ id, enabled: true, image: DEMO_IMAGE }))
  }
}

export type ContactPayload = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  service?: string
  message: string
}
export async function sendContact(payload: ContactPayload): Promise<{ ok: boolean }> {
  const headers = { 'content-type': 'application/json' }
  const res = await fetch(api('/api/contact'), { method: 'POST', headers, body: JSON.stringify(payload), credentials: 'include', cache: 'no-store' })
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw new Error(b?.error || 'Contact submission failed')
  }
  return res.json()
}
