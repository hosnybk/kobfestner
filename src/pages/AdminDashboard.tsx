import { useEffect, useMemo, useState } from 'react'
import MotionPage from '../components/MotionPage'
import type { CatalogProduct } from '../data/catalogProducts'
import { authMe, logout, listProducts, listGallery, createProduct, updateProduct, deleteProduct, uploadFile, createGalleryItem, deleteGalleryItem, listCategories, createCategory, updateCategory, deleteCategory, listContactMessages, type AdminCategory } from '../lib/adminApi'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type Category = string
type Filter = 'all' | string

export default function AdminDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [gallery, setGallery] = useState<Array<{ id: number; category: string; image: string }>>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Partial<CatalogProduct> | null>(null)
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const enabledCategories = categories.filter((c) => c.enabled).map((c) => c.id)
  const [messagesCount, setMessagesCount] = useState<number>(0)
  const [actionError, setActionError] = useState<string | null>(null)

  const getErrMsg = (e: unknown): string => {
    if (e instanceof Error && e.message) return e.message
    if (typeof e === 'string') return e
    try {
      return JSON.stringify(e)
    } catch {
      return String(e)
    }
  }

  useEffect(() => {
    let active = true
    authMe().then((me) => {
      console.log('Auth check result:', me)
      if (!active) return
      if (!me.authenticated) {
        navigate('/admin', { replace: true })
        return
      }
      Promise.all([listProducts(), listGallery(), listCategories(), listContactMessages()])
        .then(([p, g, cats, msgs]) => {
          if (!active) return
          setProducts(p)
          setGallery(g)
          setCategories(cats)
          setMessagesCount(Array.isArray(msgs) ? msgs.length : 0)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('Dashboard load error:', err)
          // Still show dashboard even if some data fails
          setIsLoading(false)
        })
    }).catch(e => {
       console.error('Auth check failed:', e)
       navigate('/admin', { replace: true })
    })
    return () => {
      active = false
    }
  }, [navigate])

  const filtered = useMemo(() => products.filter((p) => filter === 'all' || p.category === filter), [filter, products])

  useEffect(() => {
    let alive = true
    const poll = async () => {
      try {
        const me = await authMe()
        if (!alive || !me.authenticated) return
        const msgs = await listContactMessages()
        if (!alive) return
        setMessagesCount(Array.isArray(msgs) ? msgs.length : 0)
      } catch {
        // ignore polling errors (e.g., logged out)
      }
    }
    poll()
    const id = window.setInterval(poll, 60_000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [])

  const onUpload = async (file: File) => {
    try {
      setActionError(null)
      const { url } = await uploadFile(file)
      return url
    } catch (e) {
      const msg = getErrMsg(e)
      setActionError(msg)
      throw e
    }
  }

  const onSaveProduct = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editing) return
    const isUpdate = Boolean(editing.id)
    const payload = { ...editing } as Partial<CatalogProduct>
    if (isUpdate) {
      const saved = await updateProduct(editing.id as number, payload)
      setProducts((arr) => arr.map((p) => (p.id === saved.id ? saved : p)))
    } else {
      const saved = await createProduct(payload)
      setProducts((arr) => [...arr, saved])
    }
    setEditing(null)
  }

  const onDeleteProduct = async (id: number) => {
    await deleteProduct(id)
    setProducts((arr) => arr.filter((p) => p.id !== id))
  }

  const onCreateGallery = async (event: React.FormEvent) => {
    event.preventDefault()
    const formEl = event.currentTarget as HTMLFormElement
    const form = new FormData(formEl)
    const category = String(form.get('category') || 'fenster') as Category
    const file = (form.get('image') as File) || null
    if (!file || !file.name) return
    const image = await onUpload(file)
    const item = await createGalleryItem({ category, image })
    setGallery((arr) => [...arr, item])
    formEl.reset()
  }

  if (isLoading) {
    return (
      <MotionPage>
        <div className="container py-10 sm:py-14">
          <p className="text-neutral-700">{t('admin.dashboard.loading')}</p>
        </div>
      </MotionPage>
    )
  }

  return (
    <MotionPage>
      <div className="container py-10 sm:py-14 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold text-neutral-900">{t('admin.dashboard.title')}</h1>
          <div className="flex items-center gap-2">
            <button className="glass-chip rounded-lg px-4 py-2 inline-flex items-center gap-2" onClick={() => navigate('/admin/messages')}>
              <span>{t('admin.messages.title')}</span>
              {messagesCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-600 px-1.5 text-[11px] font-bold text-white">
                  {messagesCount}
                </span>
              )}
            </button>
            <LanguageSwitcher />
            <button className="glass-chip rounded-lg px-4 py-2" onClick={() => logout().then(() => navigate('/admin', { replace: true }))}>
              {t('admin.dashboard.logout')}
            </button>
          </div>
        </div>
        {actionError && (
          <div className="glass-surface-strong rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <section className="glass-surface-strong rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">{t('admin.dashboard.products')}</h2>
            <div className="flex items-center gap-2">
              <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="glass-input rounded-lg px-3 py-1.5 text-sm">
                <option value="all">{t('admin.dashboard.allCategories')}</option>
                {enabledCategories.map((c) => (
                  <option key={c} value={c}>{t(`catalog.filters.${c}`) || c}</option>
                ))}
              </select>
              <button className="glass-chip rounded-lg px-3 py-1.5 text-sm" onClick={() => setEditing({ category: (enabledCategories[0] || 'tueren') } as Partial<CatalogProduct>)}>{t('admin.dashboard.newProduct')}</button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <article key={p.id} className="glass-surface rounded-xl overflow-hidden">
                <img src={p.image} alt={p.model} className="h-36 w-full object-cover" onError={(e) => (e.currentTarget.src = '/vite.svg')} />
                <div className="p-3 space-y-1">
                  <p className="text-sm font-semibold">{p.model} • {p.category}</p>
                  <div className="flex gap-2">
                    <button className="glass-chip rounded-lg px-3 py-1 text-xs" onClick={() => setEditing(p)}>{t('admin.dashboard.edit')}</button>
                    <button className="glass-chip rounded-lg px-3 py-1 text-xs" onClick={() => onDeleteProduct(p.id)}>{t('admin.dashboard.delete')}</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-surface-strong rounded-2xl p-5">
          <h2 className="text-xl font-semibold text-neutral-900">{t('admin.dashboard.gallery')}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((g) => (
              <article key={g.id} className="glass-surface rounded-xl overflow-hidden">
                <img src={g.image} alt={`${g.category} ${g.id}`} className="h-36 w-full object-cover" onError={(e) => (e.currentTarget.src = '/vite.svg')} />
                <div className="p-3 flex items-center justify-between">
                  <span className="text-sm">{g.category}</span>
                  <button className="glass-chip rounded-lg px-3 py-1 text-xs" onClick={() => deleteGalleryItem(g.id).then(() => setGallery((arr) => arr.filter((x) => x.id !== g.id)))}>{t('admin.dashboard.delete')}</button>
                </div>
              </article>
            ))}
          </div>
          <form className="mt-4 flex flex-wrap items-end gap-2" onSubmit={onCreateGallery}>
            <select name="category" className="glass-input rounded-lg px-3 py-2 text-sm">
              <option value="fenster">{t('catalog.filters.fenster')}</option>
              <option value="tueren">{t('catalog.filters.tueren')}</option>
              <option value="rolllaeden">{t('catalog.filters.rolllaeden')}</option>
              <option value="raffstore">{t('catalog.filters.raffstore')}</option>
            </select>
            <input name="image" type="file" accept="image/*" className="glass-input rounded-lg px-3 py-2 text-sm" />
            <button type="submit" className="glass-chip rounded-lg px-3 py-2 text-sm font-semibold">{t('admin.dashboard.add')}</button>
          </form>
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <article className="glass-surface max-w-2xl w-full rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/70 px-4 py-3">
              <h3 className="text-lg font-semibold text-neutral-900">{editing.id ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button className="glass-chip rounded-lg px-3 py-1 text-sm" onClick={() => setEditing(null)}>Fermer</button>
            </div>
            <form className="p-4 grid gap-3 sm:grid-cols-2" onSubmit={onSaveProduct}>
              <input className="glass-input rounded-lg px-3 py-2 text-sm" placeholder="Modèle" value={editing.model || ''} onChange={(e) => setEditing({ ...editing, model: e.target.value })} />
              <select className="glass-input rounded-lg px-3 py-2 text-sm" value={(editing.category as unknown as string) || enabledCategories[0] || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value } as Partial<CatalogProduct>)}>
                {enabledCategories.map((c) => (
                  <option key={c} value={c}>{t(`catalog.filters.${c}`) || c}</option>
                ))}
              </select>
              <input className="glass-input rounded-lg px-3 py-2 text-sm" placeholder="Image URL" value={editing.image || ''} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
              <input className="glass-input rounded-lg px-3 py-2 text-sm" placeholder="Couleur" value={editing.color || ''} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
              <input className="glass-input rounded-lg px-3 py-2 text-sm" placeholder="Vitrage" value={editing.glazing || ''} onChange={(e) => setEditing({ ...editing, glazing: e.target.value })} />
              <input className="glass-input rounded-lg px-3 py-2 text-sm" placeholder="Poignée" value={editing.handle || ''} onChange={(e) => setEditing({ ...editing, handle: e.target.value })} />
              <input className="glass-input rounded-lg px-3 py-2 text-sm" placeholder="Application" value={editing.application || ''} onChange={(e) => setEditing({ ...editing, application: e.target.value })} />
              <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setEditing({ ...editing, image: await onUpload(f) }) }} />
              <input className="glass-input rounded-lg px-3 py-2 text-sm sm:col-span-2" placeholder="Datasheet URL" value={editing.datasheet || ''} onChange={(e) => setEditing({ ...editing, datasheet: e.target.value })} />
              <input type="file" accept="image/*,application/pdf" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setEditing({ ...editing, datasheet: await onUpload(f) }) }} />
              <div className="sm:col-span-2 flex items-center gap-2">
                <button type="submit" className="glass-chip rounded-lg px-4 py-2 font-semibold">{editing.id ? t('admin.dashboard.save') : t('admin.dashboard.create')}</button>
                {editing.id && <button type="button" className="glass-chip rounded-lg px-4 py-2" onClick={() => onDeleteProduct(editing.id as number)}>{t('admin.dashboard.delete')}</button>}
              </div>
            </form>
          </article>
        </div>
      )}
      <section className="container pb-12">
        <div className="glass-surface-strong rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-neutral-900">{t('admin.categories.title')}</h2>
            <form className="flex items-center gap-2 flex-wrap" onSubmit={async (e) => {
              e.preventDefault()
              const formEl = e.currentTarget as HTMLFormElement
              const form = new FormData(formEl)
              const id = String(form.get('id') || '').trim().toLowerCase()
              const imageFile = (form.get('image') as File) || null
              if (!id) return
              try {
                let imageUrl: string | undefined
                if (imageFile && imageFile.name) {
                  const up = await uploadFile(imageFile)
                  imageUrl = up.url
                }
                const created = await createCategory(id, imageUrl)
                setCategories((arr) => [...arr, created])
                formEl.reset()
              } catch (err) {
                console.error('Category creation failed:', err)
                const msg = getErrMsg(err)
                setActionError(msg)
                alert(`Error: ${msg}`)
              }
            }}>
              <input name="id" placeholder={t('admin.categories.slugPlaceholder')} className="glass-input rounded-lg px-3 py-1.5 text-sm w-32" />
              <input name="image" type="file" accept="image/*" className="glass-input rounded-lg px-3 py-1.5 text-sm w-48" />
              <button type="submit" className="glass-chip rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-white/50 transition-colors">{t('admin.categories.add')}</button>
            </form>
          </div>
          <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div key={c.id} className="glass-surface flex flex-col gap-3 rounded-xl p-4 transition-all hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white/50 flex items-center justify-center">
                       {c.image ? (
                         <img src={c.image} alt={c.id} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                       ) : (
                         <span className="text-xs text-gray-400">No img</span>
                       )}
                    </div>
                    <div>
                      <span className="block text-sm font-bold capitalize">{c.id}</span>
                      <label className="inline-flex items-center gap-2 text-xs text-gray-600 mt-1 cursor-pointer select-none">
                        <input type="checkbox" className="accent-blue-600 h-3 w-3" checked={c.enabled !== false} onChange={async (e) => {
                          const next = await updateCategory(c.id, { enabled: e.target.checked })
                          setCategories((arr) => arr.map((x) => (x.id === c.id ? next : x)))
                        }} />
                        <span>{c.enabled !== false ? t('admin.categories.enabled') : t('admin.categories.disabled')}</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <label className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span>{t('admin.categories.image')}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      try {
                        const up = await uploadFile(f)
                        const next = await updateCategory(c.id, { image: up.url })
                        setCategories((arr) => arr.map((x) => (x.id === c.id ? next : x)))
                      } catch (err) {
                        console.error('Category update failed:', err)
                        const msg = getErrMsg(err)
                        setActionError(msg)
                        alert(`Upload failed: ${msg}`)
                      } finally {
                        e.currentTarget.value = ''
                      }
                    }} />
                  </label>
                  <button className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1" onClick={async () => {
                    if (!confirm(`Delete category "${c.id}" ?`)) return
                    await deleteCategory(c.id)
                    setCategories((arr) => arr.filter((x) => x.id !== c.id))
                  }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    {t('admin.categories.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-600">Note: Renaming une catégorie n’est pas supporté ici.</p>
        </div>
      </section>
    </MotionPage>
  )
}
