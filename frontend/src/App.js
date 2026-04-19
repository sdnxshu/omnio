import { useState, useCallback, useEffect } from 'react';
import '@/App.css';
import { Toaster, toast } from 'sonner';
import { PanelLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import NoteEditor from '@/components/NoteEditor';
import EmptyState from '@/components/EmptyState';
import SearchDialog from '@/components/SearchDialog';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getTags,
  createTag,
} from '@/lib/storage';

function App() {
  const [notes, setNotes] = useState(getNotes);
  const [folders, setFolders] = useState(getFolders);
  const [tags, setTags] = useState(getTags);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('notesApp_theme');
    return saved === 'dark';
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('notesApp_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Close sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  const refresh = useCallback(() => {
    setNotes(getNotes());
    setFolders(getFolders());
    setTags(getTags());
  }, []);

  const handleCreateNote = useCallback(
    (folderId = null, parentNoteId = null) => {
      const note = createNote(folderId, parentNoteId);
      refresh();
      setSelectedNoteId(note.id);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    },
    [refresh]
  );

  const handleUpdateNote = useCallback(
    (id, updates) => {
      updateNote(id, updates);
      setNotes(getNotes());
    },
    []
  );

  const handleDeleteNote = useCallback(
    (id) => {
      deleteNote(id);
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
      refresh();
      toast('Note deleted', {
        description: 'The page has been moved to trash.',
      });
    },
    [selectedNoteId, refresh]
  );

  const handleSelectNote = useCallback((id) => {
    setSelectedNoteId(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleCreateFolder = useCallback((parentId = null) => {
    createFolder('New Folder', parentId);
    refresh();
  }, [refresh]);

  const handleRenameFolder = useCallback(
    (id, name) => {
      updateFolder(id, { name });
      refresh();
    },
    [refresh]
  );

  const handleDeleteFolder = useCallback(
    (id) => {
      deleteFolder(id);
      refresh();
      toast('Folder deleted', {
        description: 'Notes have been moved to pages.',
      });
    },
    [refresh]
  );

  const handleCreateTag = useCallback(
    (name, color) => {
      createTag(name, color);
      refresh();
    },
    [refresh]
  );

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[var(--n-bg)] text-[#37352F] font-body">
      <Sidebar
        notes={notes}
        folders={folders}
        tags={tags}
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleSidebar={() => setSidebarOpen(false)}
        sidebarOpen={sidebarOpen}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((d) => !d)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top bar on mobile or when sidebar hidden */}
        {!sidebarOpen && (
          <div
            data-testid="topbar"
            className="flex items-center gap-2 px-3 py-2 border-b border-[var(--n-border)] bg-[var(--n-bg)]"
          >
            <button
              data-testid="open-sidebar-btn"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md text-[var(--n-text-secondary)] hover:bg-[var(--n-hover)] hover:text-[var(--n-text)] transition-colors"
            >
              <PanelLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            {selectedNote && (
              <span className="text-sm text-[#37352F] truncate">
                {selectedNote.title || 'Untitled'}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            allTags={tags}
            allNotes={notes}
            onUpdateNote={handleUpdateNote}
            onCreateTag={handleCreateTag}
            onCreateSubPage={(parentId) => handleCreateNote(selectedNote.folderId, parentId)}
            onSelectNote={handleSelectNote}
          />
        ) : (
          <EmptyState onCreateNote={() => handleCreateNote(null)} />
        )}
      </div>

      {/* Search */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectNote={handleSelectNote}
      />

      {/* Toast */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--n-bg)',
            border: '1px solid var(--n-border)',
            color: 'var(--n-text)',
            fontFamily: 'Figtree, sans-serif',
          },
        }}
      />
    </div>
  );
}

export default App;
