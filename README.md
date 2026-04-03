# SIRIUS — Iluminación LED Colombia

Plataforma web de SIRIUS construida con **Astro 4**, TypeScript, MDX y React.

## 🚀 Stack

| Tecnología | Uso |
|---|---|
| Astro 4 | Framework SSG principal |
| TypeScript | Tipado estático |
| MDX | Artículos del blog |
| React | Islas interactivas (CCTDemo, RoomSimulator, etc.) |
| @astrojs/vercel | Adaptador de deploy para Vercel |
| Google Analytics 4 | Métricas (solo producción) |

---

## ⚙️ Desarrollo local

```bash
npm install
npm run dev        # http://localhost:4321
```

---

## 🌐 Deploy en Vercel (primera vez)

### 1. Sube el proyecto a GitHub
```bash
git init
git add .
git commit -m "feat: initial Sirius Astro project"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sirius-web.git
git push -u origin main
```

### 2. Conecta en Vercel
1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa el repositorio de GitHub
3. Vercel detecta Astro automáticamente
4. En **Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `GOOGLE_ANALYTICS_ID` | `G-XXXXXXXXXX` (tu Measurement ID de GA4) |
| `PUBLIC_SITE_URL` | `https://siriuscol.com` |

5. Haz clic en **Deploy** ✅

---

## 🤖 Deploy automático con GitHub Actions

Para el deploy automático (CI/CD), configura estos **Secrets** en tu repositorio de GitHub:

`Settings → Secrets and variables → Actions → New repository secret`

| Secret | Cómo obtenerlo |
|---|---|
| `VERCEL_TOKEN` | [Vercel Account Settings → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `vercel env pull` o Settings de tu equipo en Vercel |
| `VERCEL_PROJECT_ID` | Settings del proyecto en Vercel → General |
| `GOOGLE_ANALYTICS_ID` | Google Analytics → Admin → Data Streams |
| `PUBLIC_SITE_URL` | `https://siriuscol.com` |

> El workflow en `.github/workflows/deploy.yml` se ejecuta automáticamente en cada `push` a `main`.

---

## 📁 Estructura de páginas

```
/                  → Homepage con hero animado + Room Simulator
/blog              → Listado de artículos
/blog/[slug]       → Artículo individual (MDX)
/colecciones       → Catálogo filtrable (34 colecciones)
/contacto          → Página de contacto con formulario
```

## ✍️ Agregar un artículo al blog

1. Crea `src/content/blog/tu-titulo.mdx`
2. Copia el frontmatter de `que-significa-cct-en-iluminacion.mdx`
3. Agrega la nueva URL al `public/sitemap.xml`
4. Haz `git push` → deploy automático

## 📊 Google Analytics

El componente `GoogleAnalytics.astro` **solo se inyecta en producción** (`import.meta.env.PROD === true`).  
En `npm run dev` no se registra ningún evento, lo que protege tus métricas durante el desarrollo.

---

## 🔗 Redirects (Shopify → Astro)

Configurados en `vercel.json`:

| Desde (Shopify) | Hacia (Astro) |
|---|---|
| `/collections` | `/colecciones` |
| `/pages/contact` | `/contacto` |
| `/blogs/ilumina-tus-espacios-blog` | `/blog` |
| `/blogs/ilumina-tus-espacios-blog/:slug` | `/blog/:slug` |


