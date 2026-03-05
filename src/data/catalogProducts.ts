export const catalogCategories = ['all', 'fenster', 'tueren', 'rolllaeden', 'raffstore'] as const

export type CatalogCategory = (typeof catalogCategories)[number]

export type CatalogProduct = {
  id: number
  model: string
  category: Exclude<CatalogCategory, 'all'>
  image: string
  color: string
  glazing: string
  handle: string
  application: string
  datasheet?: string
}

export const productImageBasePath = '/products'

export const catalogProducts: CatalogProduct[] = [
  { id: 1, model: '6108', category: 'tueren', image: `${productImageBasePath}/6108.jpg`, color: 'RAL 7016 / Dekorfolie Golden Oak', glazing: '3D Edelstahl Lisenen', handle: 'PQ 40 x 20 - 160mm', application: 'Eingangstür', datasheet: `${productImageBasePath}/6108.jpg` },
  { id: 2, model: '6110', category: 'tueren', image: `${productImageBasePath}/6110.jpg`, color: 'RAL 9007 / Dekorfolie Montana', glazing: 'Satiniert, durchsichtige Streifen', handle: 'PS 10 - 1200mm', application: 'Eingangstür', datasheet: `${productImageBasePath}/6110.jpg` },
  { id: 3, model: '6122', category: 'tueren', image: `${productImageBasePath}/6122.jpg`, color: 'RAL 7016', glazing: 'Dekorfolie Woodec', handle: 'PQ 80, pulverbeschichtet RAL 9005', application: 'Fräsen', datasheet: `${productImageBasePath}/6122.jpg` },
  { id: 4, model: '1505', category: 'tueren', image: `${productImageBasePath}/1505.jpg`, color: 'Dekor Winchester', glazing: 'VSG', handle: 'PS 10 - 1200mm', application: 'Pulverbeschichtet RAL 9005' },
  { id: 5, model: '6111', category: 'tueren', image: `${productImageBasePath}/6111.jpg`, color: 'RAL 9016', glazing: 'Satiniert, durchsichtige Streifen', handle: 'PS 10 - 1200mm', application: 'Fräsen, Edelstahl' },
  { id: 6, model: 'BLS', category: 'tueren', image: `${productImageBasePath}/BLS.jpg`, color: 'RAL 9016 / pulverbeschichtet', glazing: 'Satiniert, durchsichtige Streifen', handle: 'PS 10 - 1200mm', application: 'Fräsen' },
  { id: 7, model: 'F-220', category: 'fenster', image: `${productImageBasePath}/F-220.jpg`, color: 'Anthrazit matt', glazing: '3-fach Wärmeschutz', handle: 'Alu-Griff standard', application: 'Neubau & Sanierung', datasheet: `${productImageBasePath}/F-220.jpg` },
  { id: 8, model: 'F-340', category: 'fenster', image: `${productImageBasePath}/F-340.jpg`, color: 'Weiß seidenmatt', glazing: 'Schallschutzglas', handle: 'Abschließbar', application: 'Mehrfamilienhaus' },
  { id: 9, model: 'R-80', category: 'rolllaeden', image: `${productImageBasePath}/R-80.jpg`, color: 'Silbergrau', glazing: 'N/A', handle: 'Motorsteuerung', application: 'Sonnenschutz & Sicherheit' },
  { id: 10, model: 'R-120 Smart', category: 'rolllaeden', image: `${productImageBasePath}/R-120-Smart.jpg`, color: 'Anthrazit', glazing: 'N/A', handle: 'Smart Home kompatibel', application: 'Automatisierte Steuerung' },
  { id: 11, model: 'RS-90', category: 'raffstore', image: `${productImageBasePath}/RS-90.jpg`, color: 'Graphit', glazing: 'N/A', handle: 'Elektroantrieb', application: 'Lichtsteuerung' },
  { id: 12, model: 'RS-ZIP', category: 'raffstore', image: `${productImageBasePath}/RS-ZIP.jpg`, color: 'Schwarz matt', glazing: 'N/A', handle: 'Windstabilisierung', application: 'Große Glasflächen' }
]
