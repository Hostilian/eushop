# EUshop Frontend Performance & Bundle Size Optimization Audit

**Framework:** Next.js (Pages Router, Static Export for GitHub Pages)  
**Performance SLA:** First Contentful Paint (FCP) < 1.2s, Largest Contentful Paint (LCP) < 2.0s  

---

## 1. Bundle & Asset Optimization Controls

- **Next.js Unoptimized Image Loader**: Under static export (`output: 'export'`), `next/image` utilizes unoptimized static asset loading (`unoptimized: true` in `next.config.js`).
- **Tree-Shaking**: Lucide icons and UI components are imported individually to minimize bundle size (< 180kB initial gzipped JavaScript).
- **API Cache Headers**: Backend GET endpoints include `Cache-Control: public, max-age=60, s-maxage=300` for public catalog paths.
