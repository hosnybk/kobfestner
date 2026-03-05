import type { CatalogProduct } from '../data/catalogProducts'

const json = (data: unknown) => JSON.stringify(data)
const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }
const cred: RequestInit = { credentials: 'include' }
function getApiBase(): string {
  const envObj = (import.meta as unknown as { env?: Record<string, string | undefined> }) || {}
  const base = envObj?.env?.VITE_API_BASE_URL || ''
  if (!base) return ''
  return base.endsWith('/') ? base.slice(0, -1) : base
}
const api = (path: string) => `${getApiBase()}${path}`

export async function authMe(): Promise<{ authenticated: boolean; username: string | null }> {
  const res = await fetch(api('/api/auth/me'), { ...cred })
  return res.json()
}

export async function login(username: string, password: string) {
  const res = await fetch(api('/api/auth/login'), { method: 'POST', body: json({ username, password }), headers, ...cred })
  if (!res.ok) throw new Error('Invalid credentials')
  return res.json()
}

export async function logout() {
  await fetch(api('/api/auth/logout'), { method: 'POST', ...cred })
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(api('/api/uploads'), { method: 'POST', body: form, credentials: 'include' })
  if (!res.ok) throw new Error('Upload failed')
  const out = await res.json()
  const base = getApiBase()
  const url: string = out?.url || ''
  const abs = url.startsWith('http') ? url : `${base}${url}`
  return { url: abs }
}

export async function listProducts(): Promise<CatalogProduct[]> {
  const res = await fetch(api('/api/products'), { ...cred })
  return res.json()
}
export async function createProduct(data: Partial<CatalogProduct>) {
  const res = await fetch(api('/api/products'), { method: 'POST', headers, body: json(data), ...cred })
  if (!res.ok) throw new Error('Create failed')
  return res.json()
}
export async function updateProduct(id: number, data: Partial<CatalogProduct>) {
  const res = await fetch(api(`/api/products/${id}`), { method: 'PUT', headers, body: json(data), ...cred })
  if (!res.ok) throw new Error('Update failed')
  return res.json()
}
export async function deleteProduct(id: number) {
  const res = await fetch(api(`/api/products/${id}`), { method: 'DELETE', ...cred })
  if (!res.ok) throw new Error('Delete failed')
}

export type GalleryProjectPayload = { id?: number; category: string; image: string }
export async function listGallery(): Promise<Array<{ id: number; category: string; image: string }>> {
  const res = await fetch(api('/api/gallery/projects'), { ...cred })
  return res.json()
}
export async function createGalleryItem(data: GalleryProjectPayload) {
  const res = await fetch(api('/api/gallery/projects'), { method: 'POST', headers, body: json(data), ...cred })
  if (!res.ok) throw new Error('Create failed')
  return res.json()
}
export async function deleteGalleryItem(id: number) {
  const res = await fetch(api(`/api/gallery/projects/${id}`), { method: 'DELETE', ...cred })
  if (!res.ok) throw new Error('Delete failed')
}
