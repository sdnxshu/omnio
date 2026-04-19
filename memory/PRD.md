# Notes App - PRD

## Problem Statement
Build a markdown-based note-taking application like Notion. Fully responsive, slick UI, no backend.

## Architecture
- **Frontend-only**: React + Tailwind CSS + Shadcn UI
- **Editor**: Tiptap WYSIWYG (StarterKit + TaskList + Highlight + Typography)
- **Storage**: Browser localStorage (keys: notesApp_notes, notesApp_folders, notesApp_tags, notesApp_theme)
- **PDF Export**: html2pdf.js
- **Theme**: CSS custom properties (--n-*) with .dark class on <html>

## What's Been Implemented
### Phase 1 (April 19, 2026)
- [x] Notion-style WYSIWYG tiptap editor with formatting toolbar
- [x] Sidebar with folder navigation, note list, search trigger
- [x] Folder CRUD (create, rename, delete)
- [x] Note CRUD (create, edit, delete)
- [x] Tag system with 6 colored options
- [x] Global search via Cmd+K
- [x] Cover images (3 photos + 6 colors)
- [x] Responsive sidebar (collapsible on mobile)
- [x] Typography: Outfit/Figtree/JetBrains Mono

### Phase 2 (April 19, 2026)
- [x] Dark/light theme switcher with localStorage persistence
- [x] PDF export via html2pdf.js

### Phase 3 (April 19, 2026)
- [x] Nested sub-folders with unlimited depth
- [x] Recursive folder tree rendering in sidebar
- [x] "New sub-folder" option in folder context menu
- [x] Recursive item count on parent folders
- [x] Recursive delete (deleting parent removes all descendants)
- [x] Fixed folder collapse/expand toggle bug

## Prioritized Backlog
### P1 (Next)
- Drag & drop to reorder notes/move between folders
- Markdown shortcuts (# for heading, - for list, etc.)
- Note duplication
- Export as .md file

### P2 (Later)
- Import from Markdown
- Recently deleted / trash
- Note favorites / pinning
- Keyboard shortcuts cheat sheet
