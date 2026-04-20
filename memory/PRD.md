# Notes App - PRD

## Problem Statement
Build a markdown-based note-taking application like Notion. Fully responsive, slick UI, no backend.

## Architecture
- Frontend-only: React + Tailwind CSS + Shadcn UI + Tiptap WYSIWYG
- Storage: Browser localStorage
- PDF Export: html2pdf.js | Theme: CSS custom properties

## All Implemented Features (April 20, 2026)
- [x] Notion-style WYSIWYG tiptap editor with formatting toolbar
- [x] Markdown shortcuts: # heading, - bullet, 1. ordered, > quote, --- hr, **bold**, *italic*, ~~strike~~, ```code
- [x] Folder CRUD with unlimited nested sub-folders
- [x] Note CRUD with sub-pages (parent-child hierarchy)
- [x] Drag & drop notes between folders in sidebar
- [x] Note duplication (from ellipsis menu + sidebar context menu)
- [x] Breadcrumb navigation for sub-page hierarchy
- [x] Tag system with 6 colored options
- [x] Global search via Cmd+K
- [x] Cover images (photos + color covers)
- [x] Dark/light theme switcher
- [x] PDF export via ellipsis dropdown menu
- [x] Responsive sidebar with collapsible mobile support
- [x] Custom typography: Outfit/Figtree/JetBrains Mono

## Backlog
### P1
- Export as .md file, Import from Markdown
- Recently deleted / trash
- Note favorites / pinning
