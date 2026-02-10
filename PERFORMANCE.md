# Performance Baseline & Guards

## 📊 Current Metrics (Baseline: Feb 2026)

**Lighthouse Score: 92/100** (Mobile, Simulated 4G)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Score | >90 | **92** | ✅ |
| FCP | <2.5s | **2.03s** | ✅ |
| LCP | <4.0s | **3.11s** | ✅ |
| TBT | <200ms | **44ms** | ✅ |
| CLS | <0.1 | **0.006** | ✅ |

**Test Command:**
```bash
lighthouse https://perla-negra-git-develop-facue28s-projects.vercel.app/?lh=1 \
  --output json \
  --output-path ./lighthouse-result.json \
  --chrome-flags="--headless" \
  --emulated-form-factor=mobile \
  --throttling-method=simulate \
  --only-categories=performance
```

**Run 3 audits and take median LCP for consistency.**

---

## 🏗️ Architecture

### Static Shell + React Islands Pattern

```
┌─────────────────────────────────────┐
│ index.html (Static Shell)          │
│ • Inline critical CSS (~2.5KB)     │
│ • Self-hosted fonts (preload)      │
│ • LCP image (preload + srcset)     │
│ • #static-hero-shell (visible @FCP) │
└─────────────────────────────────────┘
              ↓ (after interaction)
┌─────────────────────────────────────┐
│ React Hero (HomePage.tsx)           │
│ • Overlay (position: absolute)     │
│ • Fade-in animation (1.2s)         │
│ • Carousel backgrounds             │
│ • Handoff @ 800ms (opacity fade)   │
└─────────────────────────────────────┘
```

**Key Principles:**
1. **Static Shell:** visible inmediately at FCP, contains LCP element
2. **React Islands:** activate only after user interaction
3. **Smooth Handoff:** Static shell fades out when React hero mounts (no duplication/CLS)

---

## 🔒 Golden Rules (DO NOT BREAK)

### 1. Static Shell Must Be LCP Element
**✅ CORRECT:** LCP = `#static-hero-shell > div > picture > img`  
**❌ WRONG:** LCP = React component or dynamic element

**Why:** Static shell renders immediately (no JS), guaranteeing fast LCP.

### 2. Self-Hosted Fonts Only
**✅ CORRECT:**
```html
<link rel="preload" href="/fonts/playfair-display-latin-regular.woff2" 
  as="font" type="font/woff2" crossorigin>
<style>
  @font-face {
    font-family: 'Playfair Display';
    src: url('/fonts/playfair-display-latin-regular.woff2') format('woff2');
    font-display: swap;
  }
</style>
```

**❌ WRONG:**
```html
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
```

**Why:** Google Fonts adds 1.5s cascade delay (CSS → WOFF2).

### 3. Deferred Analytics
**✅ CORRECT:** Load GA via `requestIdleCallback` or after user interaction  
**❌ WRONG:** Synchronous `<script>` in `<head>` or immediate `initGA()`

**Implementation:**
- File: `src/lib/analytics.ts` → `initGADeferred()`
- Strategy: `requestIdleCallback` with 5s setTimeout fallback + first-interaction triggers

### 4. No React Hero Pre-Interaction
**✅ CORRECT:** Hero activates only after scroll/interaction (via `heroActive` state)  
**❌ WRONG:** Hero renders on mount, causing duplicate content

**Why:** React bundle takes time to load. Static shell provides instant feedback.

### 5. LCP Image Preload with `imagesrcset`
**✅ CORRECT:**
```html
<link rel="preload" href="/hero/silk-mobile.webp" as="image" 
  imagesrcset="/hero/silk-mobile.webp" 
  imagesizes="100vw" 
  media="(max-width: 768px)" 
  fetchpriority="high">
```

**❌ WRONG:**
```html
<link rel="preload" href="/hero/silk-mobile.webp" as="image">
```

**Why:** `imagesrcset` ensures perfect match with `<picture>` responsive selection.

---

## ✅ Verification Checklist

### Before Deployment
- [ ] Run 3 Lighthouse audits (median LCP)
- [ ] Verify Score ≥90, FCP ≤2.5s, LCP ≤4.0s
- [ ] Check LCP element = `#static-hero-shell > div > picture > img`
- [ ] Confirm no requests to `fonts.googleapis.com` or `fonts.gstatic.com`
- [ ] Verify GA loads with Priority "Low" (deferred)

### Detecting Regressions

**1. LCP Regression (>4.0s)**
```bash
# Check LCP element in lighthouse JSON
cat lighthouse-result.json | jq '.audits["largest-contentful-paint-element"].details.items[0].items[0].node.selector'
```
**Expected:** `"div#static-hero-shell > div > picture > img"`  
**If different:** Static shell no longer LCP (likely React component rendered first)

**2. Font Cascade Delay**
```bash
# Check for Google Fonts requests
cat lighthouse-result.json | jq '.audits["network-requests"].details.items[] | select(.url | contains("googleapis.com"))'
```
**Expected:** No results  
**If found:** Someone re-added Google Fonts links

**3. GA Blocking Main Thread**
```bash
# Check GA request priority
cat lighthouse-result.json | jq '.audits["network-requests"].details.items[] | select(.url | contains("js?id=G-")) | {priority, url}'
```
**Expected:** `"priority": "Low"` or `"VeryLow"`  
**If "High":** GA deferred strategy broken

**4. Score Drop**
- Score <90: Run opportunities audit, check for new unused JS/CSS
- TBT >200ms: Check for synchronous scripts or heavy main thread work
- CLS >0.1: Check hero handoff timing or new layout shifts

---

## 🛠️ Quick Fixes

### If LCP Regresses
1. Ensure `#static-hero-shell` in `index.html` is visible before React hydrates
2. Check `HomePage.tsx`: `heroActive` should be `false` initially
3. Verify LCP image has `loading="eager"` and `fetchpriority="high"`

### If Fonts Slow Down
1. Check `index.html` for external font CDN links
2. Ensure `/public/fonts/` contains WOFF2 files
3. Verify `@font-face` declarations are inline in `<head>`

### If Score Drops
1. Run `analyze_opportunities.cjs` to identify new penalties
2. Check for added third-party scripts (ads, chat widgets, etc.)
3. Verify GA still uses `initGADeferred()` in `AppRouter.tsx`

---

## 📚 Documentation

- **Architecture:** See implementation in `index.html` (static shell) + `src/pages/HomePage.tsx` (React islands)
- **Analytics:** See `src/lib/analytics.ts` for deferred loading implementation
- **Fonts:** See `public/fonts/` for self-hosted WOFF2 files

**Lighthouse Reports:** Store in `/lighthouse-reports/` for historical comparison.
