# Migración — Footer y páginas legales

**Fecha:** 18 de mayo de 2026
**Contexto:** Migración del sitio de SIRIUS Iluminación desde la tienda Shopify antigua hacia el nuevo frontend en Astro.

---

## 1. Resumen

Al migrar de la página vieja (Shopify) a la nueva (Astro), el **footer** quedó apuntando a URLs de la tienda Shopify antigua, y faltaban **4 vistas legales** que esos enlaces necesitaban.

Este documento registra el análisis del footer, las correcciones de enlaces y las vistas creadas.

El trabajo se ejecutó con un **equipo de agentes coordinados**:

| Rol | Responsabilidad |
|---|---|
| Orquestador | Análisis, layout compartido `LegalLayout.astro`, footer, redirects, sitemap, enlaces adicionales y documentación. |
| Agente · Privacidad | Vista `/politicas/privacidad` |
| Agente · Términos | Vista `/politicas/terminos` |
| Agente · Devoluciones | Vista `/politicas/devoluciones` |
| Agente · Envíos | Vista `/politicas/envios` |

---

## 2. Análisis del footer

`src/components/layout/Footer.astro` contiene tres grupos de enlaces:

- **Navegación** (`quickLinks`) — 4 enlaces.
- **Legal** (`legalLinks`) — 4 enlaces.
- **Redes sociales** — 3 enlaces externos (Facebook, Instagram, TikTok). Correctos; **no se modificaron**.

De los 8 enlaces de Navegación + Legal, **7 apuntaban a la tienda Shopify vieja** (`https://siriuscol.com/collections`, `/pages/...`, `/policies/...`). Únicamente `Blog` (`/blog`) ya era correcto.

---

## 3. Mapeo de URLs: viejo → nuevo

### Navegación — las vistas ya existían

| Enlace | URL vieja (Shopify) | URL nueva | Estado de la vista |
|---|---|---|---|
| Productos | `https://siriuscol.com/collections` | `/colecciones` | Ya existía |
| Blog | `/blog` | `/blog` | Ya existía — sin cambio |
| Preguntas Frecuentes | `https://siriuscol.com/pages/pushdaddy-faq-1` | `/faqs` | Ya existía |
| Contacto | `https://siriuscol.com/pages/contact` | `/contacto` | Ya existía |

### Legal — las vistas NO existían y se crearon

| Enlace | URL vieja (Shopify) | URL nueva | Vista |
|---|---|---|---|
| Política de privacidad | `https://siriuscol.com/policies/privacy-policy` | `/politicas/privacidad` | ✅ Creada |
| Términos y condiciones | `https://siriuscol.com/policies/terms-of-service` | `/politicas/terminos` | ✅ Creada |
| Política de devoluciones | `https://siriuscol.com/policies/refund-policy` | `/politicas/devoluciones` | ✅ Creada |
| Política de envíos | `https://siriuscol.com/policies/shipping-policy` | `/politicas/envios` | ✅ Creada |

Además se eliminó el atributo `target="_blank"` de los enlaces legales, ya que ahora son rutas internas.

---

## 4. Vistas legales creadas

El contenido de cada política se **extrajo del sitio Shopify vivo** (`siriuscol.com/policies/*`) y se reescribió en español formal (es-CO), fiel al original.

**Archivos nuevos:**

```
src/layouts/LegalLayout.astro          ← layout compartido (diseño)
src/pages/politicas/privacidad.astro   ← 14 secciones
src/pages/politicas/terminos.astro     ← 10 secciones
src/pages/politicas/devoluciones.astro ← 6 secciones
src/pages/politicas/envios.astro       ← 7 secciones
```

---

## 5. Arquitectura — `LegalLayout.astro`

Las 4 páginas comparten **un único layout** para garantizar consistencia visual total y evitar duplicar estilos.

`LegalLayout` aporta **todo el diseño**: hero con glow ámbar, breadcrumb, índice lateral pegajoso (TOC) con *scroll-spy*, enlaces cruzados entre políticas, tarjeta de ayuda y banda CTA de contacto. El contenido de cada política se pasa por `<slot>` y se estiliza desde el layout mediante reglas `:global()`.

> Por este diseño, las páginas de políticas **no llevan `<style>` propio**: son solo contenido semántico. Cualquier ajuste de diseño se hace una sola vez en `LegalLayout.astro` y se refleja en las 4.

Respeta el design system del proyecto (`src/styles/tokens.css` y `global.css`): tokens de color, tipografía `Outfit`/`Inter`, glassmorphism, radios, sombras y la estética premium oscura.

### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `title` | `string` | Nombre de la política. |
| `description` | `string` | Meta description SEO (~150 caracteres). |
| `lastUpdated` | `string` | Fecha ISO `AAAA-MM-DD`. El layout la formatea a es-CO y la usa en el JSON-LD. |
| `emoji` | `string` | Icono del hero. |
| `toc` | `{ id, label }[]` | Índice lateral. Cada `id` debe corresponder a un `<section id="...">` del slot. |

### Cómo añadir una nueva página legal

1. Crear `src/pages/politicas/<nombre>.astro`.
2. Importar `LegalLayout` desde `@layouts/LegalLayout.astro`, definir el array `toc` y pasar las props.
3. Escribir el contenido en `<section id="...">` con `<h2>`, `<h3>`, `<p>`, `<ul>`, `<strong>`, `<a>`. La primera sección (introducción) no lleva `<h2>`.
4. Añadir la ruta al array `POLICIES` dentro de `LegalLayout.astro` (enlaces cruzados del sidebar).
5. Añadir el enlace al footer (`legalLinks`), al `sitemap.xml.ts` y, si reemplaza una URL vieja, a los redirects de `vercel.json`.

---

## 6. Redirects 301 (`vercel.json`)

Se añadieron 5 redirects permanentes para que las URLs viejas ya indexadas por buscadores no terminen en error 404 y conserven su valor SEO:

| Desde (Shopify) | Hacia (Astro) |
|---|---|
| `/pages/pushdaddy-faq-1` | `/faqs` |
| `/policies/privacy-policy` | `/politicas/privacidad` |
| `/policies/terms-of-service` | `/politicas/terminos` |
| `/policies/refund-policy` | `/politicas/devoluciones` |
| `/policies/shipping-policy` | `/politicas/envios` |

---

## 7. Sitemap

Se añadieron las 4 páginas legales a `src/pages/sitemap.xml.ts` (`priority: 0.3`, `changefreq: yearly`).

---

## 8. Hallazgos adicionales (fuera del footer)

Durante el análisis se encontraron más enlaces a la tienda Shopify vieja. Se corrigieron:

| Archivo | Antes | Después |
|---|---|---|
| `components/blog/CTASection.astro` | `https://siriuscol.com/collections/paneles-led-redondos` | `/colecciones/paneles-led-redondos` |
| `components/blog/NewsletterForm.astro` | `https://siriuscol.com/contact#newsletter` | `/contacto#newsletter` |
| `content/blog/que-significa-cct-en-iluminacion.mdx` | 4 enlaces `CTACard` a colecciones Shopify filtradas | `/colecciones/paneles-led-redondos` |
| `pages/colecciones/index.astro` | `const BASE = 'https://siriuscol.com/collections/'` (código muerto) | Eliminado |

---

## 9. Decisiones y puntos a verificar

> ℹ️ **Correo de contacto.** El proyecto maneja dos correos, confirmado por el cliente: `marketingdigitalsteel@gmail.com` para las páginas legales (`/politicas/*`) y `gerencia@steelplanet.com.co` para el footer y la página de contacto. Las 4 páginas legales usan `marketingdigitalsteel@gmail.com`.

> ⚠️ **Fechas de "última actualización".** La política de privacidad conserva su fecha original del origen (`2025-10-07`). Las otras tres no traían fecha → se publicaron con la fecha de esta migración (`2026-05-18`). Ajústalas en el prop `lastUpdated` de cada página si dispones de fechas reales.

> ⚠️ **Newsletter sin backend.** `NewsletterForm.astro` ahora apunta a `/contacto`, pero **no existe un endpoint que procese el envío** del boletín. Recomendación: conectar el formulario a un servicio (Mailchimp, Brevo, etc.) o convertirlo en una isla con manejo propio.

> ℹ️ **Filtros del blog.** Los 4 `CTACard` del artículo CCT apuntaban a colecciones Shopify filtradas por temperatura de color (`?filter.p.m.custom.color_de_luz=gid://shopify/...`). Esos parámetros son específicos de Shopify y no funcionan en el nuevo `CollectionFilter`. Ahora apuntan a `/colecciones/paneles-led-redondos` **sin** el filtro previo. Si se quiere recuperar el filtro por color, habría que implementarlo en el componente `CollectionFilter`.

> ℹ️ **Errores preexistentes.** `npx astro check` reporta 2 errores de tipos en `src/lib/shopify.ts` (líneas 264 y 293) — son **preexistentes y ajenos a esta migración**. El build completo (`npm run build`) requiere además las variables de Shopify en un archivo `.env`.

---

## 10. Verificación

```bash
npx astro check
```

Resultado: **0 errores, 0 advertencias y 0 hints** en todos los archivos nuevos y editados de esta migración (`LegalLayout.astro`, las 4 páginas de `/politicas/`, `Footer.astro`, `CTASection.astro`, `NewsletterForm.astro`, `sitemap.xml.ts` y el MDX del blog).

Los 2 errores que reporta `astro check` están en `src/lib/shopify.ts` y son preexistentes (ver sección 9).
