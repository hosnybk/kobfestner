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

export async function fetchProducts(): Promise<CatalogProduct[]> {
  try {
    const res = await fetch(api('/api/products'), { headers: { accept: 'application/json' }, credentials: 'include' })
    if (!res.ok) throw new Error('Bad response')
    return (await res.json()) as CatalogProduct[]
  } catch {
    const { catalogProducts } = await import('../data/catalogProducts')
    return catalogProducts
  }
}

export async function fetchGallery(): Promise<Array<{ id: number; category: string; image: string }>> {
  try {
    const res = await fetch(api('/api/gallery/projects'), { headers: { accept: 'application/json' }, credentials: 'include' })
    if (!res.ok) throw new Error('Bad response')
    const items = (await res.json()) as Array<{ id: number; category: string; image: string }>
    return items.map((it) => ({ ...it, image: toAbsolute(it.image) }))
  } catch {
    const { galleryProjects } = await import('../data/galleryProjects')
    return galleryProjects
  }
}

export async function fetchCategories(): Promise<string[]> {
  try {
    const res = await fetch(api('/api/categories'), { headers: { accept: 'application/json' }, credentials: 'include' })
    if (!res.ok) throw new Error('Bad response')
    const arr = (await res.json()) as Array<{ id: string; enabled?: boolean }>
    return arr.filter((c) => c.enabled !== false).map((c) => c.id)
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
    const res = await fetch(api('/api/categories'), { headers: { accept: 'application/json' }, credentials: 'include' })
    if (!res.ok) throw new Error('Bad response')
    const arr = (await res.json()) as CategoryDetail[]
    return arr.map((c) => ({ ...c, image: c.image ? toAbsolute(c.image) : c.image }))
  } catch {
    // Fallback with images from homeContent if available
    const hc: { default?: { categories?: string[]; categoryImages?: Record<string, string> } } = await import('../data/homeContent.json')
    const images: Record<string, string> = hc.default?.categoryImages || {}
    const cats: string[] = hc.default?.categories || ['fenster', 'tueren', 'rolllaeden', 'raffstore']
    return cats.map((id) => ({ id, enabled: true, image: images[id] }))
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
  const res = await fetch(api('/api/contact'), { method: 'POST', headers, body: JSON.stringify(payload), credentials: 'include' })
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw new Error(b?.error || 'Contact submission failed')
  }
  return res.json()
}
