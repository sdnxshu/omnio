# Notes App - PRD

## Problem Statement
Build a markdown-based note-taking application like Notion. Fully responsive, slick UI, no backend.

## Architecture
- **Frontend-only**: React + Tailwind CSS + Shadcn UI
- **Editor**: Tiptap WYSIWYG (StarterKit + TaskList + Highlight + Typography)
- **Storage**: Browser localStorage (keys: notesApp_notes, notesApp_folders, notesApp_tags, notesApp_theme)
- **PDF Export**: html2pdf.js
- **Theme**: CSS custom properties (--n-*) with .dark class on <html>

## User Personas
- Individual note-takers wanting a local, fast, Notion-like experience
- Students and professionals who need organized notes with folders and tags

## Core Requirements (Static)
- Notion-style WYSIWYG markdown editor
- Folder/workspace organization
- Tag/label system with colored pastel tags
- Global search (Cmd+K)
- Cover images for notes
- Responsive design with collapsible sidebar
- Dark/light theme switcher
- PDF export

## What's Been Implemented (April 19, 2026)
- [x] Full Notion-style WYSIWYG editor (tiptap) with formatting toolbar
- [x] Sidebar with folder navigation, note list, search trigger
- [x] Folder CRUD (create, rename, delete)
- [x] Note CRUD (create, edit, delete)
- [x] Tag system with 6 colored options (red, blue, green, yellow, purple, gray)
- [x] Global search via Cmd+K (shadcn Command dialog)
- [x] Cover images (3 photos + 6 color covers)
- [x] Dark/light theme switcher with localStorage persistence
- [x] PDF export via html2pdf.js
- [x] Responsive sidebar (collapsible on mobile)
- [x] Typography: Outfit (headings), Figtree (body), JetBrains Mono (code)
- [x] All interactive elements have data-testid attributes

## Testing Results
- 17/17 frontend flows passing (100% success rate)
- No critical bugs

## Prioritized Backlog
### P0 (Done)
- All core features implemented

### P1 (Next)
- Drag & drop to reorder notes and move between folders
- Nested folders (sub-folders)
- Markdown shortcuts (type # for heading, - for list, etc.)
- Note duplication

### P2 (Later)
- Export as Markdown (.md) file
- Import from Markdown
- Keyboard shortcuts cheat sheet
- Recently deleted / trash
- Note favorites / pinning
