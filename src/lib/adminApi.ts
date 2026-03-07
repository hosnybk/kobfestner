import type { CatalogProduct } from '../data/catalogProducts'

const json = (data: unknown) => JSON.stringify(data)
const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }
const cred: RequestInit = { credentials: 'include' }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  const status = `${res.status} ${res.statusText || ''}`.trim()
  const contentType = res.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      const body = (await res.json().catch(() => null)) as unknown
      let msg = ''
      if (typeof body === 'string') {
        msg = body
      } else if (isRecord(body)) {
        if (typeof body.error === 'string' && body.error) msg = body.error
        else if (typeof body.message === 'string' && body.message) msg = body.message
        else msg = JSON.stringify(body)
      } else if (body) {
        msg = JSON.stringify(body)
      }
      return msg ? `${msg} (${status})` : `${fallback} (${status})`
    }
    const text = await res.text().catch(() => '')
    return text ? `${text} (${status})` : `${fallback} (${status})`
  } catch {
    return `${fallback} (${status})`
  }
}

async function assertOk(res: Response, fallback: string): Promise<void> {
  if (res.ok) return
  throw new Error(await readErrorMessage(res, fallback))
}

export async function authMe(): Promise<{ authenticated: boolean; username: string | null }> {
  const res = await fetch(api('/api/auth/me'), {
    ...cred,
    cache: 'no-store',
    headers: { ...headers, 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' }
  })
  if (!res.ok) return { authenticated: false, username: null }
  return res.json()
}

export async function login(username: string, password: string) {
  const res = await fetch(api('/api/auth/login'), {
    method: 'POST',
    body: json({ username, password }),
    headers,
    ...cred,
    cache: 'no-store'
  })
  await assertOk(res, 'Invalid credentials')
  return res.json()
}

export async function logout() {
  await fetch(api('/api/auth/logout'), { method: 'POST', ...cred })
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(api('/api/uploads'), { method: 'POST', body: form, credentials: 'include' })
  await assertOk(res, 'Upload failed')
  const out = await res.json()
  const base = getApiBase()
  const url: string = out?.url || ''
  const abs = url.startsWith('http') ? url : `${base}${url}`
  return { url: abs }
}

export type AdminCategory = { id: string; enabled: boolean; image?: string }
export async function listCategories(): Promise<AdminCategory[]> {
  const res = await fetch(api('/api/categories'), { ...cred })
  return res.json()
}
export async function createCategory(id: string, image?: string): Promise<AdminCategory> {
  const res = await fetch(api('/api/categories'), { method: 'POST', headers, body: json({ id, image }), ...cred })
  await assertOk(res, 'Create category failed')
  return res.json()
}
export async function updateCategory(id: string, payload: Partial<AdminCategory>): Promise<AdminCategory> {
  const res = await fetch(api(`/api/categories/${id}`), { method: 'PUT', headers, body: json(payload), ...cred })
  await assertOk(res, 'Update category failed')
  return res.json()
}
export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(api(`/api/categories/${id}`), { method: 'DELETE', ...cred })
  await assertOk(res, 'Delete category failed')
}

export async function listProducts(): Promise<CatalogProduct[]> {
  const res = await fetch(api('/api/products'), { ...cred })
  return res.json()
}
export async function createProduct(data: Partial<CatalogProduct>) {
  const res = await fetch(api('/api/products'), { method: 'POST', headers, body: json(data), ...cred })
  await assertOk(res, 'Create failed')
  return res.json()
}
export async function updateProduct(id: number, data: Partial<CatalogProduct>) {
  const res = await fetch(api(`/api/products/${id}`), { method: 'PUT', headers, body: json(data), ...cred })
  await assertOk(res, 'Update failed')
  return res.json()
}
export async function deleteProduct(id: number) {
  const res = await fetch(api(`/api/products/${id}`), { method: 'DELETE', ...cred })
  await assertOk(res, 'Delete failed')
}

export type ContactMessage = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  service?: string
  message: string
  createdAt: string
}
export async function listContactMessages(): Promise<ContactMessage[]> {
  const res = await fetch(api('/api/contact'), { ...cred })
  await assertOk(res, 'List failed')
  return res.json()
}
export async function deleteContactMessage(id: number): Promise<void> {
  const res = await fetch(api(`/api/contact/${id}`), { method: 'DELETE', ...cred })
  await assertOk(res, 'Delete failed')
}

export type GalleryProjectPayload = { id?: number; category: string; image: string }
export async function listGallery(): Promise<Array<{ id: number; category: string; image: string }>> {
  const res = await fetch(api('/api/gallery/projects'), { ...cred })
  return res.json()
}
export async function createGalleryItem(data: GalleryProjectPayload) {
  const res = await fetch(api('/api/gallery/projects'), { method: 'POST', headers, body: json(data), ...cred })
  await assertOk(res, 'Create failed')
  return res.json()
}
export async function deleteGalleryItem(id: number) {
  const res = await fetch(api(`/api/gallery/projects/${id}`), { method: 'DELETE', ...cred })
  await assertOk(res, 'Delete failed')
}
