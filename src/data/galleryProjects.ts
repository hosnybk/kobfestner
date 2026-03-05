export const galleryCategories = ['all', 'fenster', 'tueren', 'rolllaeden', 'raffstore'] as const

export type GalleryCategory = (typeof galleryCategories)[number]

export type GalleryProject = {
  id: number
  category: Exclude<GalleryCategory, 'all'>
  image: string
}

export const galleryImageBasePath = '/gallery'

export const galleryProjects: GalleryProject[] = [
  { id: 1, category: 'fenster', image: `${galleryImageBasePath}/1.jpg` },
  { id: 2, category: 'tueren', image: `${galleryImageBasePath}/2.jpg` },
  { id: 3, category: 'rolllaeden', image: `${galleryImageBasePath}/3.jpg` },
  { id: 4, category: 'raffstore', image: `${galleryImageBasePath}/4.jpg` },
  { id: 5, category: 'fenster', image: `${galleryImageBasePath}/5.jpg` },
  { id: 6, category: 'tueren', image: `${galleryImageBasePath}/6.jpg` },
  { id: 7, category: 'rolllaeden', image: `${galleryImageBasePath}/7.jpg` },
  { id: 8, category: 'raffstore', image: `${galleryImageBasePath}/8.jpg` }
]
