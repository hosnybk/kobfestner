import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      brand: 'KOB Fenster',
      nav: {
        home: 'Home',
        about: 'About',
        products: 'Products',
        gallery: 'Gallery',
        contact: 'Contact',
        menuToggle: 'Toggle navigation menu',
        call: 'Call'
      },
      home: {
        hero: {
          title: 'High-performance windows and doors for modern living',
          subtitle: 'Discover custom solutions for insulation, design, and comfort with a reliable installation service.',
          catalogButton: 'View catalog',
          quoteButton: 'Request a quote'
        },
        categories: {
          title: 'Our categories',
          catalogLink: 'Catalog',
          galleryLink: 'Gallery',
          items: {
            fenster: { title: 'Fenster' },
            tueren: { title: 'Türen' },
            rolllaeden: { title: 'Rollläden' },
            raffstore: { title: 'Raffstore' }
          }
        },
        testimonials: {
          title: 'Customer testimonials',
          googleLabel: 'Google Review',
          verified: 'Verified review'
        },
        cta: {
          title: 'Contact us',
          addressLabel: 'Address',
          addressValue: 'Kranenstraße 19, 65375 Oestrich-Winkel, Germany',
          mailLabel: 'Email',
          socialLabel: 'Social networks',
          hoursLabel: 'Working hours',
          hoursValue: 'Mon - Fri: 08:00 - 18:00'
        },
        map: {
          title: 'Find us on Google Maps',
          openButton: 'Open in Maps'
        },
        showcase: {
          title: 'Preview of our work',
          subtitle: 'A quick visual strip of recent style inspirations. Replace these with your own project photos anytime.',
          button: 'View gallery'
        },
        icons: {
          radiator: 'Radiator',
          panorama: 'Panorama',
          smartHome: 'Smart Home',
          store: 'Store',
          hoverCatalog: 'View catalog'
        }
      },
      galleryPage: {
        badge: 'Gallery',
        title: 'Our completed projects',
        subtitle: 'A visual mockup for your portfolio. You can replace these examples with your real projects at any time.',
        filters: {
          all: 'All',
          fenster: 'Fenster',
          tueren: 'Türen',
          rolllaeden: 'Rollläden',
          raffstore: 'Raffstore'
        },
        items: {
          1: {
            city: 'Wiesbaden',
            title: 'PVC window renovation',
            description: 'Replacement project with improved insulation and a cleaner contemporary facade.'
          },
          2: {
            city: 'Mainz',
            title: 'Modern entrance door',
            description: 'Secure main door with elegant finish and precise installation details.'
          },
          3: {
            city: 'Frankfurt',
            title: 'Rollläden installation',
            description: 'Thermal and privacy upgrade for a family house with motorized operation.'
          },
          4: {
            city: 'Rheingau',
            title: 'Raffstore facade shading',
            description: 'Adjustable sun shading solution for better comfort and architecture harmony.'
          },
          5: {
            city: 'Darmstadt',
            title: 'Large format window set',
            description: 'Custom dimensions and acoustic optimization for a renovated apartment.'
          },
          6: {
            city: 'Koblenz',
            title: 'Design door replacement',
            description: 'Premium entry concept combining security, aesthetics and longevity.'
          },
          7: {
            city: 'Eltville',
            title: 'Smart Rollläden system',
            description: 'Connected shutter setup with simple control and robust outdoor performance.'
          },
          8: {
            city: 'Oestrich-Winkel',
            title: 'Raffstore new construction',
            description: 'Clean contemporary lines with efficient daylight regulation for modern living.'
          }
        },
        cta: {
          title: 'Do you have a similar project?',
          subtitle: 'Share your idea and get a personalized recommendation from our team.',
          button: 'Request a quote'
        }
      },
      catalog: {
        badge: 'Catalog',
        title: 'Explore our product range',
        subtitle: 'Discover a complete selection of doors, windows, shutters, and raffstore systems adapted to modern residential projects.',
        model: 'Model',
        cataloguesTitle: 'Catalogues',
        pdfTag: 'PDF',
        filters: {
          all: 'All',
          fenster: 'Fenster',
          tueren: 'Türen',
          rolllaeden: 'Rollläden',
          raffstore: 'Raffstore'
        },
        specs: {
          color: 'Color',
          glazing: 'Glazing',
          application: 'Application',
          handle: 'Handle'
        },
        viewDatasheet: 'View datasheet'
      },
      about: {
        hero: {
          title: 'About us',
          subtitle: 'At KOB Fenster we combine precision and design: modern solutions, durable finishing and reliable installation.',
          highlights: {
            quality: 'Premium quality',
            custom: 'Custom fabrication',
            delivery: 'Delivery & installation'
          },
          stats: {
            experience: { value: '10+ Years', label: 'Experience' },
            projects: { value: '300+', label: 'Completed projects' },
            rating: { value: '4.9/5', label: 'Customer satisfaction' }
          }
        },
        services: {
          badge: 'Our services',
          title: 'Comprehensive window & door services',
          subtitle: 'Partner with a company dedicated to excellence in window and door installations, ensuring each project is handled with precision and care.',
          items: {
            custom: {
              title: 'Custom window installation',
              description: 'Expertly crafted windows tailored to your specific needs.'
            },
            door: {
              title: 'Door installation & replacement',
              description: 'High-quality doors designed for security and style.'
            },
            energy: {
              title: 'Energy-efficient solutions',
              description: 'Windows and doors that enhance energy savings year-round.'
            },
            repair: {
              title: 'Window & door repair',
              description: 'Reliable repairs ensuring long-lasting functionality and aesthetics.'
            },
            consulting: {
              title: 'Consultation & design services',
              description: 'Personalized guidance to match your home’s unique style.'
            },
            commercial: {
              title: 'Commercial windows & doors',
              description: 'Durable, efficient solutions for businesses of all sizes.'
            }
          }
        },
        story: {
          title: 'Driven by passion for doors',
          tabs: {
            withUs: 'With us',
            technology: 'Technology',
            newProducts: 'New products'
          },
          content: {
            withUs: {
              title: 'You can do more with us',
              text: 'KOB Fenster designs and manufactures high-quality products where each detail matters. Our doors and windows are built to deliver performance, aesthetics, and long-term comfort.'
            },
            technology: {
              title: 'Technology that lasts',
              text: 'We use modern production methods and tested components to ensure insulation, security, and a flawless finish in every project.'
            },
            newProducts: {
              title: 'Always evolving products',
              text: 'Our catalog is continuously enriched with new models, finishes, and smart options to match current architecture trends.'
            }
          }
        },
        cards: {
          mission: {
            title: 'Our mission',
            text: 'Bring aesthetics, performance, and durability together for your home.'
          },
          values: {
            title: 'Our values',
            text: 'Advice, transparency, and uncompromising quality from start to finish.'
          },
          why: {
            title: 'Why KOB Fenster?',
            items: [
              'Certified products with manufacturer warranty',
              'Installation by qualified technicians',
              'Fast, reliable support'
            ]
          }
        }
      },
      contact: {
        badge: 'Contact',
        title: 'Fenster, Türen, Rollläden and Raffstore service',
        subtitle: 'Tell us about your project and we will get back to you quickly with clear recommendations and a tailored quote.',
        quickContact: {
          title: 'Quick contact',
          phone: '+49 6123 456 789',
          email: 'kontakt@kob-fenster.de',
          address: 'Kranenstraße 19, 65375 Oestrich-Winkel, Germany',
          hours: 'Mon - Fri: 08:00 - 18:00',
          mapButton: 'Open in Maps'
        },
        formTitle: 'Contact form',
        formSubtitle: 'Fill in your details and we will respond as soon as possible.',
        form: {
          firstName: 'First name',
          lastName: 'Last name',
          email: 'Email',
          phone: 'Phone number',
          service: 'Select a service',
          message: 'Your message',
          submit: 'Send'
        },
        mapTitle: 'KOB Fenster location'
      },
      catalogViewer: {
        defaultTitle: 'Catalog',
        modes: {
          reader: 'Reader',
          flipbook: '3D Flipbook'
        },
        page: 'Page {{current}} / {{total}}',
        openPdf: 'Open PDF',
        loading: 'Loading catalog...',
        error: 'Unable to load catalog.',
        thumbnailAlt: 'Thumbnail {{page}}'
      },
      footer: {
        tagline: 'Premium windows & doors',
        ctaTitle: 'Let’s make your custom product!',
        ctaButton: 'Contact us today',
        quickLinks: 'Quick links',
        latestNews: 'Get the latest trending news',
        emailPlaceholder: 'Enter your email',
        madeByPrefix: 'Made by',
        madeBySuffix: 'with love'
      },
      admin: {
        login: {
          title: 'Administration',
          subtitle: 'Log in to access the secure area.',
          username: 'Username',
          password: 'Password',
          submit: 'Sign in',
          success: 'Login successful.',
          error: 'Invalid credentials'
        },
        dashboard: {
          title: 'Dashboard',
          products: 'Products',
          gallery: 'Gallery',
          newProduct: 'New product',
          logout: 'Sign out',
          allCategories: 'All categories',
          add: 'Add',
          edit: 'Edit',
          delete: 'Delete',
          save: 'Save',
          create: 'Create',
          close: 'Close',
          loading: 'Loading…'
        }
      }
    }
  },
  de: {
    translation: {
      brand: 'KOB Fenster',
      nav: {
        home: 'Startseite',
        about: 'Über uns',
        products: 'Produkte',
        gallery: 'Galerie',
        contact: 'Kontakt',
        menuToggle: 'Navigationsmenü umschalten',
        call: 'Anrufen'
      },
      home: {
        hero: {
          title: 'Hochwertige Fenster und Türen für modernes Wohnen',
          subtitle: 'Entdecken Sie maßgeschneiderte Lösungen für Dämmung, Design und Komfort mit zuverlässiger Montage.',
          catalogButton: 'Katalog ansehen',
          quoteButton: 'Angebot anfordern'
        },
        categories: {
          title: 'Unsere Kategorien',
          catalogLink: 'Katalog',
          galleryLink: 'Galerie',
          items: {
            fenster: { title: 'Fenster' },
            tueren: { title: 'Türen' },
            rolllaeden: { title: 'Rollläden' },
            raffstore: { title: 'Raffstore' }
          }
        },
        testimonials: {
          title: 'Kundenstimmen',
          googleLabel: 'Google Bewertung',
          verified: 'Verifizierte Bewertung'
        },
        cta: {
          title: 'Kontaktieren Sie uns',
          addressLabel: 'Adresse',
          addressValue: 'Kranenstraße 19, 65375 Oestrich-Winkel, Deutschland',
          mailLabel: 'E-Mail',
          socialLabel: 'Soziale Netzwerke',
          hoursLabel: 'Öffnungszeiten',
          hoursValue: 'Mo - Fr: 08:00 - 18:00'
        },
        map: {
          title: 'Finden Sie uns auf Google Maps',
          openButton: 'In Maps öffnen'
        },
        showcase: {
          title: 'Einblick in unsere Arbeiten',
          subtitle: 'Ein schneller visueller Streifen mit aktuellen Stilbeispielen. Diese Bilder können Sie jederzeit durch eigene Projektfotos ersetzen.',
          button: 'Galerie ansehen'
        },
        icons: {
          radiator: 'Heizkörper',
          panorama: 'Panorama',
          smartHome: 'Smart Home',
          store: 'Store',
          hoverCatalog: 'Zum Katalog'
        }
      },
      galleryPage: {
        badge: 'Galerie',
        title: 'Unsere realisierten Projekte',
        subtitle: 'Eine visuelle Muster-Galerie. Sie können diese Beispiele jederzeit durch Ihre eigenen Arbeiten ersetzen.',
        filters: {
          all: 'Alle',
          fenster: 'Fenster',
          tueren: 'Türen',
          rolllaeden: 'Rollläden',
          raffstore: 'Raffstore'
        },
        items: {
          1: {
            city: 'Wiesbaden',
            title: 'PVC-Fenster Sanierung',
            description: 'Austauschprojekt mit besserer Dämmung und einer modernen, sauberen Fassadenoptik.'
          },
          2: {
            city: 'Mainz',
            title: 'Moderne Haustür',
            description: 'Sichere Eingangstür mit eleganter Oberfläche und präziser Montage.'
          },
          3: {
            city: 'Frankfurt',
            title: 'Rollläden Montage',
            description: 'Upgrade für Wärmeschutz und Privatsphäre in einem Einfamilienhaus.'
          },
          4: {
            city: 'Rheingau',
            title: 'Raffstore Fassadenlösung',
            description: 'Verstellbarer Sonnenschutz für mehr Komfort und harmonische Architektur.'
          },
          5: {
            city: 'Darmstadt',
            title: 'Großformatige Fensteranlage',
            description: 'Maßgefertigte Elemente mit verbesserter Schalldämmung für die Modernisierung.'
          },
          6: {
            city: 'Koblenz',
            title: 'Design-Tür Austausch',
            description: 'Premium-Eingangskonzept mit Fokus auf Sicherheit, Ästhetik und Langlebigkeit.'
          },
          7: {
            city: 'Eltville',
            title: 'Smart Rollläden System',
            description: 'Vernetzte Rollladenlösung mit einfacher Bedienung und robuster Leistung.'
          },
          8: {
            city: 'Oestrich-Winkel',
            title: 'Raffstore Neubau',
            description: 'Klare moderne Linien mit effizienter Tageslichtsteuerung für modernes Wohnen.'
          }
        },
        cta: {
          title: 'Haben Sie ein ähnliches Projekt?',
          subtitle: 'Teilen Sie uns Ihre Idee mit und erhalten Sie eine persönliche Empfehlung.',
          button: 'Angebot anfordern'
        }
      },
      catalog: {
        badge: 'Katalog',
        title: 'Entdecken Sie unser Produktsortiment',
        subtitle: 'Ein kompletter Überblick über Türen, Fenster, Rollläden und Raffstore-Lösungen für moderne Wohnprojekte.',
        model: 'Modell',
        cataloguesTitle: 'Kataloge',
        pdfTag: 'PDF',
        filters: {
          all: 'Alle',
          fenster: 'Fenster',
          tueren: 'Türen',
          rolllaeden: 'Rollläden',
          raffstore: 'Raffstore'
        },
        specs: {
          color: 'Farbe',
          glazing: 'Glas',
          application: 'Applikation',
          handle: 'Griff'
        },
        viewDatasheet: 'Datenblatt ansehen'
      },
      about: {
        hero: {
          title: 'Über uns',
          subtitle: 'Bei KOB Fenster verbinden wir Präzision und Design: moderne Lösungen, hochwertige Verarbeitung und zuverlässige Montage.',
          highlights: {
            quality: 'Premium Qualität',
            custom: 'Maßanfertigung',
            delivery: 'Lieferung & Montage'
          },
          stats: {
            experience: { value: '10+ Jahre', label: 'Erfahrung' },
            projects: { value: '300+', label: 'Projekte abgeschlossen' },
            rating: { value: '4.9/5', label: 'Kundenzufriedenheit' }
          }
        },
        services: {
          badge: 'Unsere Leistungen',
          title: 'Umfassende Fenster- und Türservices',
          subtitle: 'Arbeiten Sie mit einem Team, das sich auf exzellente Fenster- und Türlösungen spezialisiert hat und jedes Projekt mit Präzision und Sorgfalt umsetzt.',
          items: {
            custom: {
              title: 'Individuelle Fenstermontage',
              description: 'Präzise gefertigte Fenster, abgestimmt auf Ihre Anforderungen.'
            },
            door: {
              title: 'Türmontage & Austausch',
              description: 'Hochwertige Türen für Sicherheit, Komfort und Stil.'
            },
            energy: {
              title: 'Energieeffiziente Lösungen',
              description: 'Fenster und Türen, die Ihre Energiekosten dauerhaft senken.'
            },
            repair: {
              title: 'Fenster- & Türreparatur',
              description: 'Zuverlässige Reparaturen für langfristige Funktion und Ästhetik.'
            },
            consulting: {
              title: 'Beratung & Designservice',
              description: 'Individuelle Beratung passend zum Stil Ihres Zuhauses.'
            },
            commercial: {
              title: 'Gewerbliche Fenster & Türen',
              description: 'Robuste und effiziente Lösungen für Unternehmen jeder Größe.'
            }
          }
        },
        story: {
          title: 'Aus Leidenschaft zu Türen',
          tabs: {
            withUs: 'Mit uns',
            technology: 'Technologie',
            newProducts: 'Neue Produkte'
          },
          content: {
            withUs: {
              title: 'Sie können mehr mit uns',
              text: 'KOB Fenster entwickelt und fertigt hochwertige Produkte, bei denen jedes Detail zählt. Unsere Türen und Fenster stehen für Leistung, Ästhetik und langfristigen Wohnkomfort.'
            },
            technology: {
              title: 'Technologie mit Langlebigkeit',
              text: 'Wir setzen auf moderne Fertigung und geprüfte Komponenten, damit Dämmung, Sicherheit und Verarbeitung dauerhaft überzeugen.'
            },
            newProducts: {
              title: 'Kontinuierlich neue Produkte',
              text: 'Unser Sortiment wird laufend mit neuen Modellen, Oberflächen und smarten Lösungen erweitert – passend zu aktuellen Architekturtrends.'
            }
          }
        },
        cards: {
          mission: {
            title: 'Unsere Mission',
            text: 'Ästhetik, Leistung und Langlebigkeit in Ihrem Zuhause vereinen.'
          },
          values: {
            title: 'Unsere Werte',
            text: 'Beratung, Transparenz und kompromisslose Qualität von Anfang bis Ende.'
          },
          why: {
            title: 'Warum KOB Fenster?',
            items: [
              'Zertifizierte Produkte mit Herstellergarantie',
              'Montage durch qualifizierte Techniker',
              'Schneller, zuverlässiger Support'
            ]
          }
        }
      },
      contact: {
        badge: 'Kontakt',
        title: 'Fenster, Türen, Rollläden und Raffstore Service',
        subtitle: 'Teilen Sie uns Ihr Projekt mit, wir melden uns schnell mit klaren Empfehlungen und einem passenden Angebot zurück.',
        quickContact: {
          title: 'Schnellkontakt',
          phone: '+49 6123 456 789',
          email: 'kontakt@kob-fenster.de',
          address: 'Kranenstraße 19, 65375 Oestrich-Winkel, Deutschland',
          hours: 'Mo - Fr: 08:00 - 18:00',
          mapButton: 'In Maps öffnen'
        },
        formTitle: 'Kontaktformular',
        formSubtitle: 'Füllen Sie die Felder aus, wir antworten Ihnen so schnell wie möglich.',
        form: {
          firstName: 'Vorname',
          lastName: 'Nachname',
          email: 'E-Mail',
          phone: 'Handynummer',
          service: 'Service auswählen',
          message: 'Ihre Nachricht',
          submit: 'Absenden'
        },
        mapTitle: 'Standort KOB Fenster'
      },
      catalogViewer: {
        defaultTitle: 'Katalog',
        modes: {
          reader: 'Lesemodus',
          flipbook: '3D Flipbook'
        },
        page: 'Seite {{current}} / {{total}}',
        openPdf: 'PDF öffnen',
        loading: 'Katalog wird geladen...',
        error: 'Katalog konnte nicht geladen werden.',
        thumbnailAlt: 'Miniatur {{page}}'
      },
      footer: {
        tagline: 'Premium Fenster & Türen',
        ctaTitle: 'Lassen Sie uns Ihr individuelles Produkt umsetzen!',
        ctaButton: 'Kontaktieren Sie uns',
        quickLinks: 'Schnellzugriff',
        latestNews: 'Aktuelle Trends erhalten',
        emailPlaceholder: 'E-Mail eingeben',
        madeByPrefix: 'Made by',
        madeBySuffix: 'with love'
      },
      admin: {
        login: {
          title: 'Administration',
          subtitle: 'Melden Sie sich an, um den geschützten Bereich zu öffnen.',
          username: 'Benutzername',
          password: 'Passwort',
          submit: 'Anmelden',
          success: 'Erfolgreich angemeldet.',
          error: 'Ungültige Anmeldedaten'
        },
        dashboard: {
          title: 'Dashboard',
          products: 'Produkte',
          gallery: 'Galerie',
          newProduct: 'Neues Produkt',
          logout: 'Abmelden',
          allCategories: 'Alle Kategorien',
          add: 'Hinzufügen',
          edit: 'Bearbeiten',
          delete: 'Löschen',
          save: 'Speichern',
          create: 'Erstellen',
          close: 'Schließen',
          loading: 'Laden…'
        }
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de',
    fallbackLng: 'de',
    interpolation: { escapeValue: false }
  })

export default i18n
