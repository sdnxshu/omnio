# Notes App - PRD

## Problem Statement
Build a markdown-based note-taking application like Notion. Fully responsive, slick UI, no backend.

## Architecture
- Frontend-only: React + Tailwind CSS + Shadcn UI + Tiptap WYSIWYG
- Storage: Browser localStorage
- PDF Export: html2pdf.js
- Theme: CSS custom properties with .dark class

## Implemented Features (April 19, 2026)
- [x] Notion-style WYSIWYG tiptap editor with full formatting toolbar
- [x] Folder CRUD with unlimited nested sub-folders
- [x] Note CRUD with sub-pages (parent-child note hierarchy)
- [x] Tag system with 6 colored options
- [x] Global search via Cmd+K (shadcn Command dialog)
- [x] Cover images (photos + color covers)
- [x] Dark/light theme switcher
- [x] PDF export via ellipsis dropdown menu
- [x] Breadcrumb navigation for sub-page hierarchy (folder chain + ancestor notes)
- [x] Responsive sidebar with collapsible mobile support
- [x] Custom typography: Outfit/Figtree/JetBrains Mono

## Prioritized Backlog
### P1
- Drag & drop to reorder notes / move between folders
- Markdown shortcuts (# for heading, - for list)
- Note duplication

### P2
- Export as .md file, Import from Markdown
- Recently deleted / trash
- Note favorites / pinning
