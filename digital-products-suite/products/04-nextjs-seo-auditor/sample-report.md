# SEO Audit Report

Audited URL: `https://example.com`  
Generated At: **2026-09-04T17:08:10.428Z**  
Auditor: **Next.js SEO Auditor by QorelySofts**  

---

## Executive Summary

| Metric | Result |
|---|---|
| **SEO Score** | **51 / 100 (Grade D)** |
| **HTTP Status** | `200` |
| **Time to First Byte (TTFB)** | `345 ms` |
| **Compression** | `BR` |
| **HTML Size** | `0.3 KB` |
| **HTTPS** | `Yes (Secure)` |
| **Parser Engine** | `regex-fallback` |
| **Checks Passed** | `6` |
| **Warnings** | `5` |
| **Critical Issues** | `3` |

---

## Critical Issues (3)

### 1. [Metadata] Meta Description
- **Problem**: Missing meta description. Search engines will generate an automated snippet.
- **Recommended Action**: `Add <meta name="description" content="..."> with 120-160 characters describing page content.`

### 2. [Indexing] Canonical Tag
- **Problem**: No canonical <link rel="canonical"> tag declared.
- **Recommended Action**: `Add a self-referential canonical URL tag to avoid duplicate content penalties.`

### 3. [Social] OpenGraph Incomplete
- **Problem**: Missing multiple OpenGraph tags: og:title, og:description, og:image, og:url, og:type
- **Recommended Action**: `Implement OpenGraph metadata (og:title, og:description, og:image, og:url, og:type).`

---

## Warnings & Recommendations (5)

### 1. [Metadata] Title Tag Length
- **Details**: Title is too brief (14 characters): "Example Domain". Recommended range: 30-60 characters.
- **Suggested Fix**: `Expand your title tag with primary keywords and brand identity.`

### 2. [Headings] Subheading Hierarchy
- **Details**: No H2 or H3 subheadings found. Content structure may be thin.
- **Suggested Fix**: `Break content into logical sections with H2 and H3 tags.`

### 3. [Social] Twitter Card Tags
- **Details**: Incomplete Twitter Card configuration. Missing twitter:card or twitter:image.
- **Suggested Fix**: `Specify <meta name="twitter:card" content="summary_large_image"> and twitter:image.`

### 4. [Performance] Time to First Byte (TTFB)
- **Details**: Moderate TTFB (345ms). Target <300ms for optimal Web Vitals.
- **Suggested Fix**: `Leverage edge caching, SSR streaming, or CDN caching for dynamic routes.`

### 5. [Structured Data] Schema.org JSON-LD
- **Details**: No Schema.org JSON-LD structured data detected on page.
- **Suggested Fix**: `Add JSON-LD (e.g. WebSite, Organization, Article, Product) to enhance rich snippets in SERPs.`

---

## Page Elements Breakdown

### Headings Structure
- **H1 Count**: 1
    - `Example Domain`
- **H2 Count**: 0
- **H3 Count**: 0

### OpenGraph & Social Metadata
- **og:title**: `Not specified`
- **og:description**: `Not specified`
- **og:image**: `Not specified`
- **og:url**: `Not specified`
- **og:type**: `Not specified`
- **twitter:card**: `Not specified`

### Structured Data (Schema.org JSON-LD)
Found **0** JSON-LD block(s).
*None present.*

---
*Report generated automatically by QorelySofts Next.js SEO Auditor.*
