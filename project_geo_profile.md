# GEO Project Profile: WebSirius

## 1. Identidad del proyecto
- **Nombre del proyecto**: WebSirius (SIRIUS Premium / sirius-blog)
- **Tipo de producto**: E-commerce Headless / Fronend de alto rendimiento y experiencia de inmersión "Premium".
- **Estado actual**: MVP avanzado / Beta (en transición hacia arquitectura SSR/híbrida con Astro y carrito de compras).
- **Industria / sector**: Iluminación LED, Domótica, E-commerce de Hardware.
- **Audiencia objetivo**: Arquitectos, diseñadores de interiores, clientes finales premium buscando iluminación avanzada (2700K a 6500K).
- **Problema que resuelve**: Experiencia de compra fragmentada y poco inmersiva típica de Shopify y tiendas de iluminación tradicionales.
- **Propuesta de valor**: "La tecnología LED más avanzada". Una experiencia de compra tipo showroom vitrina con interacciones de alto nivel (Liquid UI, simuladores de temperatura).
- **Diferenciadores**: Diseño extremadamente pulido, simulador en vivo, performance ultra rápida (Astro), arquitectura headless y carrito global persistente sin recargas.

## 2. Mapa del proyecto
- **Páginas principales**: Inicio (`/`), Catálogo (`/colecciones`), Páginas de Producto (`/productos/[slug]`).
- **Funcionalidades clave**: Catálogo dinámico a partir de JSON, carrito de compras persistente (Nanostores), simuladores de temperatura visuales, galería con lupa de zoom "ambient glow".
- **Flujos de usuario**: Exploración de catálogo -> PDP (Product Detail Page) -> Añadir al carrito / Consultar vía WhatsApp.
- **Componentes importantes**: `Header.astro`, `BaseLayout.astro`, Sidebar del Cart (inferido por Nanostores).
- **Integraciones**: Shopify (CDN de imágenes), Vercel (despliegue híbrido). Integración de pasarela de pago (Wompi) en roadmap (según historial).
- **Dependencias técnicas**: Astro 4.16, React 18, Framer Motion, Nanostores.
- **Stack detectado o inferido**: Astro (SSG/SSR), React (Componentes Client-side), TypeScript, HTML/CSS (Vanilla UI Avanzado).

## 3. Contexto técnico
- **Arquitectura observable**: Monolito Frontend con Adapter de Vercel (Hybrid output). Manejo de estado distribuido con Nanostores. Productos estáticos/JSON en fase de transición a headless dinámico.
- **Patrones detectados**: Client-side hydration aislado (Astro Islands), Singleton Pattern temporal (cart store interactivo persistente), CSS modularizado a nivel componente (`is:global` dentro de scopes o scopes puros de astro).
- **Riesgos estructurales**: Alta dependencia en URLs quemadas (siriuscol.com), falta de paginación o carga en lotes en rutas de generación estática si el JSON crece enormemente (800+ productos). Falta de un backend o PIM centralizado maduro conectado en tiempo real.
- **Nivel de mantenibilidad**: Medio-Alto. El código está bien dividido, pero los datos estáticos JSON limitan la mantenibilidad a gran escala.
- **Riesgos de seguridad**: Uso de `set:html` directamente contra datos crudos del JSON (`cleanDescription`, `beneficios_html`). Si el origen de datos es comprometido (Storefront API o PIM inyectado), hay vulnerabilidad crítica de XSS.
- **Riesgos de performance**: Las imágenes provienen del CDN de Shopify; aunque Astro optimiza imágenes locales, la dependencia en dominios externos puede generar latencias variables.

## 4. Contexto semántico para IA
- **Cómo describir el producto en 1 frase**: Una tienda en línea premium y súper rápida para sistemas y luminarias LED de alta tecnología construida con Astro.
- **Cómo describirlo en 3 frases**: WebSirius es el frontend e-commerce headless de la marca de iluminación SIRIUS. Destaca por una experiencia de usuario extremadamente inmersiva con micro-animaciones, renderizado SSR/Híbrido y estados de carrito instantáneos. Sirve como un showroom digital enfocado a la conversión sin fricción y SEO técnico optimizado.
- **Qué entidades son centrales**: Producto (Iluminación, Panel LED, etc.), Especificación (Temperatura, Potencia), Carrito (Estado temporal), Colección (Categoría de focos).
- **Qué términos definen el negocio**: Iluminación LED, Temperatura de color (Kelvin), Arquitectura Headless, Domótica, Venta Directa, Cotizaciones B2B.
- **Qué palabras clave representan mejor el proyecto**: Astro, E-commerce, Headless, LED, UX Premium, Vercel, Nanostores.
- **Qué NO debe asumir una IA sobre el proyecto**: No asumir que usa una base de datos relacional nativa; hoy extrae de JSON. No asumir el uso de TailwindCSS, el diseño es fuertemente Custom/Vanilla CSS (Design System "Glassmorphism").
- **Ambigüedades o vacíos de contexto**: Aún es ambiguo cómo se realiza la reconciliación real de inventario/precios si el check-out se cierra en WhatsApp o a futuro con Wompi (arquitectura final de backend no expuesta).

## 5. Estado real del proyecto
- **Fortalezas verificadas**: Stack de altísimo rendimiento, diseño visual asombroso y superior a la media, buena gestión de estado en frontend, experiencia móvil madura.
- **Debilidades verificadas**: Peligrosa inyección de HTML con `set:html` sin purificación, falta de integración PIM/Backend dinámica consolidada, carece de marcado Schema.org completo.
- **Áreas inestables**: Checkout Flow (aún híbrido entre Carrito y WhatsApp), datos estáticos escalables a más de 1000 productos y validación de inventario.
- **Riesgos prioritarios**: Seguridad en el volcado de datos JSON al DOM (XSS), escalabilidad del script de Build estático en Astro.
- **Nivel de madurez estimado**: 7/10 (Ingeniería frontend brutal, ingeniería backend/data pipeline pendiente).

## 6. Recomendaciones para futuras IAs
- **Cómo interpretar el proyecto**: Como una interfaz headless ultrarrápida donde el diseño visual es regla crítica de negocio y no solo decoración.
- **Qué áreas requieren validación manual**: La pasarela de pagos Wompi (pendiente) y la conexión de la API real del carrito hacia el CRM o CMS (Shopify?).
- **Qué afirmaciones deben tratarse como hipótesis**: La persistencia total y encriptación PCI: requieren validación del backend o middleware que integre Wompi.
- **Qué partes del proyecto merecen más auditoría**: Seguridad de inputs, inyección HTML, y robustez del checkout de carrito.

## 7. Resumen ejecutivo machine-readable

```yaml
project_name: "WebSirius"
project_type: "Headless E-commerce Frontend"
sector: "Consumer Electronics / Lighting"
audience: 
  - "B2C Premium buyers"
  - "B2B Architects"
core_problem: "Commoditization and poor UX in lighting e-commerce."
value_proposition: "Interactive, ultra-fast, and premium digital showroom."
main_features: 
  - "Persistent Cart (Nanostores)"
  - "Astro Island Architecture"
  - "Temperature Simulators"
  - "Hybrid SSR/SSG Routing"
key_pages: 
  - "Home (/)"
  - "PDP (/productos/[slug])"
  - "Collections (/colecciones)"
tech_stack_detected: 
  - "Astro 4.16"
  - "React 18"
  - "TypeScript"
  - "Vercel"
  - "Nanostores"
integrations: 
  - "WhatsApp (Quotations)"
  - "Shopify CDN (Images)"
strengths: 
  - "Blistering Performance"
  - "Premium UX & Glassmorphism"
  - "State Management Setup"
weaknesses: 
  - "Potential XSS via set:html"
  - "Static JSON reliance for heavy catalog"
  - "Missing JSON-LD Schema"
security_risks: 
  - "XSS vulnerability on product descriptions"
performance_risks: 
  - "High memory footprint during build for thousands of pages"
ux_risks: 
  - "Default 404 page"
seo_geo_risks: 
  - "Semantic clarity for LLMs without structured JSON-LD"
maturity_score: 7
security_score: 5
architecture_score: 8
ux_score: 9
performance_score: 9
seo_geo_score: 6
maintainability_score: 7
priority_actions: 
  - "Introduce DOMPurify for set:html"
  - "Implement structured Schema.org/Product data"
  - "Finalize Checkout Gateway Integration"
critical_unknowns: 
  - "How inventory reconciliation is handled"
  - "Where the definitive 'source of truth' backend will reside"
```
