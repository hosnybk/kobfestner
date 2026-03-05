import type { CatalogProduct } from '../data/catalogProducts'

function getApiBase(): string {
  const envObj = (import.meta as unknown as { env?: Record<string, string | undefined> }) || {}
  const base = envObj?.env?.VITE_API_BASE_URL || ''
  if (!base) return ''
  return base.endsWith('/') ? base.slice(0, -1) : base
}
const api = (path: string) => `${getApiBase()}${path}`

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
    return (await res.json()) as Array<{ id: number; category: string; image: string }>
  } catch {
    const { galleryProjects } = await import('../data/galleryProjects')
    return galleryProjects
  }
}
