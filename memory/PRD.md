# Notes App - PRD

## Problem Statement
Build a markdown-based note-taking application like Notion. Fully responsive, slick UI, no backend.

## Architecture
- **Frontend-only**: React + Tailwind CSS + Shadcn UI
- **Editor**: Tiptap WYSIWYG (StarterKit + TaskList + Highlight + Typography)
- **Storage**: Browser localStorage
- **PDF Export**: html2pdf.js
- **Theme**: CSS custom properties with .dark class

## What's Been Implemented
### Phase 1 - Core (April 19, 2026)
- [x] Notion-style WYSIWYG tiptap editor with formatting toolbar
- [x] Folder CRUD, Note CRUD, Tag system, Global search (Cmd+K)
- [x] Cover images, Responsive sidebar, Custom typography

### Phase 2 - Theme + Export
- [x] Dark/light theme switcher with localStorage persistence
- [x] PDF export via html2pdf.js

### Phase 3 - Nested Folders
- [x] Nested sub-folders with unlimited depth
- [x] Recursive tree rendering, cascade delete

### Phase 4 - Sub-pages + UX (April 19, 2026)
- [x] Sub-pages: notes can have child notes (parentNoteId)
- [x] Sub-pages shown nested in sidebar with expand/collapse toggle
- [x] Sub-pages listed in editor below content with navigation links
- [x] "Add sub-page" from ellipsis menu, sidebar context menu, and inline button
- [x] Recursive delete: deleting parent deletes all child notes
- [x] Export PDF moved to ellipsis dropdown at top-right of page
- [x] Fixed note toggle first-click bug (separate toggleNote handler)

## Prioritized Backlog
### P1 (Next)
- Drag & drop to reorder notes/move between folders
- Markdown shortcuts (# for heading, - for list)
- Note duplication
- Breadcrumb navigation for sub-pages

### P2 (Later)
- Export as .md file, Import from Markdown
- Recently deleted / trash
- Note favorites / pinning
