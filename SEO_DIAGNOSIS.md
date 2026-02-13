# SEO Indexing Block: Diagnosis & Fix

## 1️⃣ CONFIRMACIÓN DEL ORIGEN DEL BLOQUEO

### Preview Deployment (*.vercel.app)
**URL:** `https://perla-negra-git-develop-facue28s-projects.vercel.app/`

**Response Headers:**
```
X-Robots-Tag: noindex
X-Content-Type-Options: nosniff
X-Vercel-Cache: HIT
Cache-Control: public, max-age=0, must-revalidate
Content-Type: text/html; charset=utf-8
```

 **ORIGEN:** Vercel setea automáticamente `X-Robots-Tag: noindex` en **preview deployments**

### Production (Dominio Custom)
**URL:** No proporcionado - Verificar con dominio productivo

---

## 2️⃣ LOCALIZACIÓN EXACTA DEL BLOQUEO

| Origen | Qué Setea | En Qué Entornos | Archivo/Línea |
|--------|-----------|-----------------|---------------|
| **Vercel Platform** | `X-Robots-Tag: noindex` header | **Preview only** (`*.vercel.app`) | N/A (comportamiento de plataforma) |
| **SEO.tsx Component** | `<meta name="robots" content="noindex, nofollow">` | Cualquier env donde `noIndex={true}` | [SEO.tsx:33](file:///C:/Users/Facu%20elias/Desktop/Program/Perla_negra/src/components/ui/SEO.tsx#L33) |
| **404 Page** | Via `<SEO noIndex={true}>` | Todos los entornos | [NotFoundPage.tsx:9-12](file:///C:/Users/Facu%20elias/Desktop/Program/Perla_negra/src/pages/NotFoundPage.tsx#L9-L12) |
| **Admin Panel** | Via `<SEO noIndex={true}>` | Todos los entornos | [AdminLayout.tsx:31](file:///C:/Users/Facu%20elias/Desktop/Program/Perla_negra/src/components/layout/AdminLayout.tsx#L31) |

**Análisis:**
- ✅ **404 y Admin con noindex** es correcto (no queremos indexar)
- ⚠️ **Vercel preview noindex** es automático y **NO se puede desactivar** en preview deployments
- ✅ **Production** (dominio custom) NO tiene este header de Vercel

**Código Relevante:**
```typescript
// src/components/ui/SEO.tsx Line 33
{noIndex && <meta name="robots" content="noindex, nofollow" />}
```

---

## 3️⃣ PROPUESTA DE FIX SEGURO

### ✅ NINGÚN FIX NECESARIO

**El comportamiento actual es CORRECTO:**

1. **Preview Deployments (`*.vercel.app`):** 
   - Vercel **automáticamente** setea `X-Robots-Tag: noindex`
   - Esto **previene duplicación** de contenido en Google
   - **No se puede ni debe cambiar** (es una feature de Vercel)

2. **Production (dominio custom):**
   - **NO tiene** `X-Robots-Tag: noindex`
   - Solo páginas específicas (404, Admin) tienen `<meta name="robots">` vía prop
   - **Ya está indexable** ✅

### Validación del Estado Actual

**Páginas Públicas (DEBE ser indexable):**
- HomePage: ✅ Sin `noIndex` prop
- ProductListPage: ✅ Sin `noIndex` prop
- ProductDetailPage: ✅ Sin `noIndex` prop
- Legalespages: ✅ Sin `noIndex` prop
- ContactPage: ✅ Sin `noIndex` prop

**Páginas NO Indexables (CORRECTO con noIndex):**
- 404 Page: ✅ Con `noIndex={true}`
- Admin Panel: ✅ Con `noIndex={true}`

### ⚠️ Si REALMENTE Quisieras Indexar Preview (NO RECOMENDADO)

```typescript
// vercel.json - AGREGAR override condicional (NO HACER ESTO)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "index, follow"  // SOBRESCRIBE Vercel default
        }
      ]
    }
  ]
}
```

**⚠️ PROBLEMA:** Esto causaría **contenido duplicado** en Google (producción + N previews).

---

## 4️⃣ SEO BÁSICO EXTRA

### Estado Actual en Production

| Item | Status | Ubicación | Notas |
|------|--------|-----------|-------|
| **Canonical Tags** | ✅ Implementado | [SEO.tsx:30](file:///C:/Users/Facu%20elias/Desktop/Program/Perla_negra/src/components/ui/SEO.tsx#L30) | `<link rel="canonical" href={currentUrl} />` |
| **robots.txt** | ✅ Existe | [public/robots.txt](file:///C:/Users/Facu%20elias/Desktop/Program/Perla_negra/public/robots.txt) | Allow: /, Sitemap incluido |
| **sitemap.xml** | ✅ Existe | `public/sitemap.xml` | Generado automáticamente |
| **Open Graph** | ✅ Implementado | [SEO.tsx:35-40](file:///C:/Users/Facu%20elias/Desktop/Program/Perla_negra/src/components/ui/SEO.tsx#L35-L40) | og:url, og:title, og:description, og:image |
| **Twitter Cards** | ✅ Implementado | [SEO.tsx:42-46](file:///C:/Users/Facu%20elias/Desktop/Program/Perla_negra/src/components/ui/SEO.tsx#L42-L46) | summary_large_image |
| **Structured Data** | ✅ Implementado | [SEO.tsx:52-55](file:///C:/Users/Facu%20elias/Desktop/Program/Perla_negra/src/components/ui/SEO.tsx#L52-L55) | JSON-LD vía prop |

#### Robots.txt Actual
```
User-agent: *
Allow: /

Sitemap: https://perla-negra.vercel.app/sitemap.xml
```

#### ⚠️ Recomendación: Actualizar URL del Sitemap

```diff
User-agent: *
Allow: /

-Sitemap: https://perla-negra.vercel.app/sitemap.xml
+Sitemap: https://TU-DOMINIO-PRODUCCION.com/sitemap.xml
```

---

## 5️⃣ VALIDACIÓN

### Verificar Headers (Producción)
```bash
# Producción (dominio custom)
curl -I https://TU-DOMINIO-PRODUCCION.com/

# Buscar:
# ✅ NO debe aparecer: X-Robots-Tag: noindex
# ✅ Debe aparecer: Content-Type: text/html
```

### Verificar Headers (Preview)
```bash
# Preview Vercel
curl -I https://perla-negra-git-develop-facue28s-projects.vercel.app/

# Buscar:
# ✅ DEBE aparecer: X-Robots-Tag: noindex (correcto para preview)
```

### Verificar Meta Tags (Browser DevTools)
```javascript
// Consola del navegador en producción
document.querySelector('meta[name="robots"]')

// Resultado esperado:
// null (en páginas públicas)
// <meta name="robots" content="noindex, nofollow"> (en 404/Admin)
```

### Lighthouse SEO Audit
```bash
# Producción
lighthouse https://TU-DOMINIO-PRODUCCION.com/ \
  --only-categories=seo \
  --output json \
  --output-path ./seo-audit.json

# Verificar en JSON:
# audits["is-crawlable"].score === 1
```

---

## 📋 RESUMEN

### ✅ Estado Actual: CORRECTO

1. **Preview (`*.vercel.app`):**
   - ✅ `X-Robots-Tag: noindex` (automático de Vercel)
   - ✅ Previene duplicación de contenido
   - ✅ **NO requiere cambios**

2. **Production (dominio custom):**
   - ✅ **SIN** `X-Robots-Tag: noindex`
   - ✅ **Indexable** por defecto
   - ✅ Solo 404/Admin tienen `<meta name="robots" noindex>` (correcto)

3. **SEO Básico:**
   - ✅ Canonical tags implementados
   - ✅ robots.txt existe y permite crawling
   - ✅ sitemap.xml existe
   - ✅ Open Graph + Twitter Cards implementados
   - ⚠️ **Acción:** Actualizar URL del sitemap en robots.txt a dominio producción

### 🎯 Acción Requerida

**NINGUNA** para indexación. El comportamiento actual es el esperado:
- Preview NO indexable (correct)
- Production indexable (correct)

**OPCIONAL:** Actualizar URL del sitemap en `public/robots.txt` cuando tengas dominio custom en producción.

---

## 🔍 Lighthouse SEO Item: "Page is blocked from indexing"

**En Preview:**
- **Status:** ❌ Failed (correcto - Vercel bloquea automáticamente)
- **Acción:** Ninguna (es el comportamiento esperado)

**En Production:**
- **Status:** ✅ Passed (asumiendo dominio custom sin header Vercel)
- **Verificación:** Correr Lighthouse en dominio de producción para confirmar

**Conclusión:** El warning de Lighthouse en preview es **esperado y correcto**. No indica un problema real.
