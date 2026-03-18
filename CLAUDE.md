# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Static HTML website for GNU Geophysics Lab (경상국립대학교 지구물리 연구실, Prof. Shin Youngjae). No build system — pure HTML + Tailwind CDN + vanilla JS.

## Development

```bash
# Local preview
python -m http.server 8000
# Then open http://localhost:8000

# Deployment target: GitHub Pages (main branch)
```

There are no tests, no build step, no package manager, and no linting.

## Architecture

**6 static HTML pages** sharing a common layout (navbar + footer copy-pasted across all pages):

| Page | Key Feature |
|------|-------------|
| `index.html` | Hero, 6 research cards, news timeline, recruit box |
| `research.html` | 6 research area sections + NRF project info |
| `publications.html` | 12 papers with year filter (`data-year` + `.filter-btn`) |
| `members.html` | Professor card + open student slots |
| `gallery.html` | Photo grid with JS lightbox (6 placeholders currently) |
| `contact.html` | Contact info + embedded map + form |

**Shared assets:**
- `css/custom.css` — CSS variables, component styles. Tailwind CDN handles layout utilities
- `js/main.js` — Mobile nav toggle, IntersectionObserver scroll reveal, publication year filter, gallery lightbox, back-to-top button
- `images/logo.png` — Lab emblem (1.7MB)
- `papers/` — 12 PDFs, named `{Author}_{Year}_{Topic}_{Journal}.pdf`

**No templating** — navbar and footer are duplicated across all 6 HTML pages. Changes to navigation or footer must be applied to every file.

## Key Patterns

**Design system**: Light theme. Accent color `--blue: #3B82F6`. All colors defined as CSS custom properties in `:root`. Signature element: blue left-bar underline on `.section-title::after`.

**Adding a new publication**: Add a `<div class="pub-item" data-year="YYYY">` block to `publications.html` with `.pub-badge`, `.pub-title`, `.pub-authors`, `.pub-journal`, `.pub-doi`, `.pub-pdf` elements. Add PDF to `papers/`. Update year filter buttons and paper count if needed.

**Adding a gallery image**: Add `<div class="gallery-item">` with `<img>` + `.gallery-overlay`. Lightbox auto-wires via JS (no manual binding needed).

**Scroll reveal**: Add class `reveal` to any element for fade-in-up animation on scroll.

## Content Language

Site content is primarily Korean with English for academic terms. HTML `lang="ko"`.
