# 🛡️ Executive Audit Report: Perla Negra

**Date:** 2026-02-12
**Auditor:** Senior Full-Stack Engineer + QA Lead
**Status:** ⚠️ Critical Issues Found (UX/Caching)

## 1. Executive Summary
The project is a **React 19 + Vite SPA** deployed on **Vercel** with **Supabase**. The codebase is clean, well-structured, and lints without errors. Code quality is high (TypeScript, modular features).

**However, there are CRITICAL architectural risks:**
1.  **"Black Screen" / "Stale State"**: Caused by a custom "Static Hero Shell" implementation in `index.html` that manually manipulates the DOM before React loads, combined with missing `Cache-Control` headers.
2.  **Fragile LCP Optimization**: The "Static Shell" pattern coupled with `window.location` checks in `index.html` is error-prone for an SPA, causing the "Black Screen" on refresh.
3.  **SEO/Performance**: `react-helmet-async` is good, but Client-Side Rendering (CSR) limits SEO potential compared to Next.js/SSG.

**Recommendation:** Immediate hardening of `index.html` logic and Vercel configuration is required to stabilize the "Black Screen" and Caching issues.

---

## 2. Issues & Findings

| Severity | Area | Symptom | Probable Cause | Fix Recommended |
| :--- | :--- | :--- | :--- | :--- |
| 🔴 **CRITICAL** | **UX / Routing** | **"Pantalla Negra" on refresh** (non-home routes) | `index.html` inline script hides the static shell based on URL path. Since `#root` is empty until React loads, the user sees **nothing** while the bundle downloads. | **Add a global CSS loader** in `index.html` that is visible by default and removed only when React hydrates. |
| 🔴 **CRITICAL** | **Caching** | **Refreshes showing old version / errors** | Missing `Cache-Control` headers in `vercel.json` for `index.html`. Browser caches the HTML entry point excessively. | Update `vercel.json` to force `no-cache` for HTML documents. |
| 🟠 **HIGH** | **Resilience** | Manual DOM manipulation (`.is-home`) | `HomePage.tsx` tries to remove `#static-hero-shell`. If React errors or logic implies `heroActive` state mismatch, the shell might persist or disappear at wrong times. | Use a cleaner approach (CSS `:empty` selector or React Portal) instead of `display: none !important`. |
| 🟡 **MEDIUM** | **Build** | `window.prerenderReady` usage | Variable is set to `false` in `index.html` but never set to `true` in `main.tsx` or `AppRouter`. Consuming services (if any) will timeout. | Remove it if not using Prerender.io, or set it to `true` in `useEffect` at `AppRouter`. |
| 🟡 **MEDIUM** | **SEO** | SPA Routing | Standard `react-router-dom` usage means search engines might see empty content initially. | Ensure `react-helmet-async` is working correctly (looks okay) but verify robots.txt/sitemap. |

---

## 3. Root Cause Analysis (Deep Dive)

### A) The "Black Screen" on Refresh (Pantalla Negra)
**Context:** You have a "Static Hero Shell" in `index.html` optimizing LCP (Largest Contentful Paint).
**Mechanism:**
1. User refreshes `/productos`.
2. Browser loads `index.html`.
3. **Inline Script Runs:** Checks `window.location.pathname`. It is `/productos`.
4. **Action:** Script *does not* add `.is-home` class.
5. **CSS Rule:** `#static-hero-shell { display: none !important; }` triggers.
6. **Result:** The Shell is hidden. The `#root` div is empty. **The screen is effectively blank (black/white)**.
7. **Delay:** The screen remains blank *until* `bundle.js` downloads, parses, executes, fetches data, and React renders the `PageLoader`. On slow connections, this is a "Black Screen of Death".

**Confirmation Steps:**
1. Navigate to `/productos`.
2. Open DevTools > Network.
3. Set throttling to "Slow 3G".
4. Refresh list.
5. **Observe:** The screen will stay blank for several seconds before the spinner appears.

### B) Stale State / "Static" Page
**Context:** User visits, leaves, comes back, and sees old content or a broken state.
**Mechanism:**
1. Vercel serves `index.html` with default headers (often `public, max-age=0, must-revalidate`, but sometimes browsers behave aggressively if `ETag` is used).
2. If `index.html` is cached, the browser loads the *old* version pointing to *old* hashed JS files (e.g., `assets/index-Ah3...js`).
3. If a new deployment occurred, `assets/index-Ah3...js` **no longer exists** on the server (404).
4. **Result:** The HTML loads (from cache), tries to fetch JS (404), fails. The app **never starts**. The user sees the cached HTML "Static Shell" (if on Home) or a blank screen (if elsewhere), effectively "frozen".

---

## 4. Hardening Plan (Fixes)

### Fix 1: Vercel Caching & SPA Fallback (Critical)
**Action:** Update `vercel.json` to strictly control caching and ensure SPA routing works seamlessly.

**File:** `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ]
}
```

### Fix 2: "Black Screen" Mitigation (Global Loader)
**Action:** Add a default "Loading" state in `index.html` that is visible *regardless* of the route, but layered *behind* the Static Hero.

**File:** `index.html`
**Change:** Add a simple CSS spinner/logo inside `#root` or as a separate sibling that is visible by default.

```html
<!-- INSIDE <body>, BEFORE #root -->
<div id="global-loader" style="position: fixed; inset: 0; background: #000; z-index: 100; display: flex; align-items: center; justify-content: center; transition: opacity 0.5s;">
  <!-- Simple SVG or CSS Spinner here -->
  <div style="color: #3FFFC1; font-family: sans-serif; letter-spacing: 4px;">CARICAMENTO...</div>
</div>

<script>
  // Remove loader when window loads (fallback) or when React signals
  window.addEventListener('load', () => {
     // Optional: set a timeout or wait for React
     // document.getElementById('global-loader').style.opacity = '0';
     // setTimeout(() => document.getElementById('global-loader').remove(), 500);
  });
</script>
```
*Better approach:* Let React remove it in `App.tsx` via `useEffect`.

### Fix 3: Safer "Static Hero" Logic
**Action:** Instead of `display: none !important`, use visibility or opacity, or ensure the fallback loader handles the "non-home" case.

**File:** `index.html`
**Modify script in `<head>`:**
```javascript
(function () {
  const path = window.location.pathname;
  if (path === '/' || path === '/index.html' || path === '/adulto') {
    document.documentElement.classList.add('is-home');
  } else {
    // If NOT home, ensure the global loader is visible
    document.documentElement.classList.add('is-page');
  }
})();
```

### Fix 4: Prerender Signal (Cleanup)
**File:** `src/main.tsx`
**Action:** Add the trigger signal if using a prerender service, or remove the `window.prerenderReady = false` from `index.html` if not used. If used:

```typescript
// Inside main.tsx or App.tsx useEffect
useEffect(() => {
  // Signal to prerender service that we are ready
  (window as any).prerenderReady = true;
}, []);
```

---

## 5. Next Steps
1.  **Apply `vercel.json` changes** immediately to fix caching.
2.  **Modify `index.html`** to include a `global-loader` to prevent the black screen gap.
3.  **Deploy & Test**:
    *   Test Refresh on Home (Static shell appears).
    *   Test Refresh on `/productos` (Global loader appears -> React loads).
    *   Test Deployment Rollover (Verify no stale assets).
