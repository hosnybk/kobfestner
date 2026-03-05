import { useEffect, useMemo, useState } from 'react'
import MotionPage from '../components/MotionPage'
import type { CatalogProduct } from '../data/catalogProducts'
import { authMe, logout, listProducts, listGallery, createProduct, updateProduct, deleteProduct, uploadFile, createGalleryItem, deleteGalleryItem } from '../lib/adminApi'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type Category = 'fenster' | 'tueren' | 'rolllaeden' | 'raffstore'
type Filter = 'all' | Category

export default function AdminDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [gallery, setGallery] = useState<Array<{ id: number; category: string; image: string }>>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Partial<CatalogProduct> | null>(null)

  useEffect(() => {
    let active = true
    authMe().then((me) => {
      if (!active) return
      if (!me.authenticated) {
        navigate('/admin', { replace: true })
        return
      }
      Promise.all([listProducts(), listGallery()]).then(([p, g]) => {
        if (!active) return
        setProducts(p)
        setGallery(g)
        setIsLoading(false)
      })
    })
    return () => {
      active = false
    }
  }, [navigate])

  const filtered = useMemo(() => products.filter((p) => filter === 'all' || p.category === filter), [filter, products])

  const onUpload = async (file: File) => {
    const { url } = await uploadFile(file)
    return url
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
    const form = new FormData(event.currentTarget as HTMLFormElement)
    const category = String(form.get('category') || 'fenster') as Category
    const file = (form.get('image') as File) || null
    if (!file || !file.name) return
    const image = await onUpload(file)
    const item = await createGalleryItem({ category, image })
    setGallery((arr) => [...arr, item])
    ;(event.currentTarget as HTMLFormElement).reset()
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">{t('admin.dashboard.title')}</h1>
          <button className="glass-chip rounded-lg px-4 py-2" onClick={() => logout().then(() => navigate('/admin', { replace: true }))}>
            {t('admin.dashboard.logout')}
          </button>
        </div>

        <section className="glass-surface-strong rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">{t('admin.dashboard.products')}</h2>
            <div className="flex items-center gap-2">
              <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="glass-input rounded-lg px-3 py-1.5 text-sm">
                <option value="all">{t('admin.dashboard.allCategories')}</option>
                <option value="fenster">{t('catalog.filters.fenster')}</option>
                <option value="tueren">{t('catalog.filters.tueren')}</option>
                <option value="rolllaeden">{t('catalog.filters.rolllaeden')}</option>
                <option value="raffstore">{t('catalog.filters.raffstore')}</option>
              </select>
              <button className="glass-chip rounded-lg px-3 py-1.5 text-sm" onClick={() => setEditing({ category: 'tueren' as Category })}>{t('admin.dashboard.newProduct')}</button>
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
              <select className="glass-input rounded-lg px-3 py-2 text-sm" value={(editing.category as Category) || 'tueren'} onChange={(e) => setEditing({ ...editing, category: e.target.value as Category })}>
                <option value="fenster">Fenster</option>
                <option value="tueren">Türen</option>
                <option value="rolllaeden">Rollläden</option>
                <option value="raffstore">Raffstore</option>
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
    </MotionPage>
  )
}
