export type PdfCatalog = {
  id: number
  title: string
  subtitle: string
  cover: string
  pdf: string
}

export const pdfCatalogs: PdfCatalog[] = [
  { id: 1, title: 'Katalog Eingangstüren', subtitle: 'Despiro (DE)', cover: '/catalog-covers/1.jpg', pdf: '/catalogs/Katalog_Eingangsturen-Despiro_DE.pdf' },
  { id: 2, title: 'Katalog Innentüren', subtitle: 'Innenbereich (DE)', cover: '/catalog-covers/2.jpg', pdf: '/catalogs/Katalog_Innenturen_DE.pdf' },
  { id: 3, title: 'Katalog Holz', subtitle: 'Holzserie (DE)', cover: '/catalog-covers/3.jpg', pdf: '/catalogs/Katalog_Holz_DE.pdf' },
  { id: 4, title: 'Katalog Stahl', subtitle: 'Stahltüren (DE)', cover: '/catalog-covers/4.jpg', pdf: '/catalogs/Katalog_Stahl_DE.pdf' },
  { id: 5, title: 'Katalog Aluminium', subtitle: 'Aluminiumserie (DE)', cover: '/catalog-covers/5.jpg', pdf: '/catalogs/Katalog_Aluminium_DE.pdf' },
  { id: 6, title: 'Katalog Garagentor', subtitle: 'Garagentore (DE)', cover: '/catalog-covers/6.jpg', pdf: '/catalogs/Katalog_Garagentor_DE.pdf' },
  { id: 7, title: 'Katalog Fassadenjalousien', subtitle: 'Sonnenschutz (DE)', cover: '/catalog-covers/7.jpg', pdf: '/catalogs/Katalog_Fassadenjalousien_DE.pdf' },
  { id: 8, title: 'Katalog Produkt mini', subtitle: 'Produktauswahl (DE)', cover: '/catalog-covers/8.jpg', pdf: '/catalogs/Katalog_Produkt-mini_DE.pdf' }
]
