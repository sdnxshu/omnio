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
    (folderId = null) => {
      const note = createNote(folderId);
      refresh();
      setSelectedNoteId(note.id);
      // Close sidebar on mobile after selecting
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

  const handleCreateFolder = useCallback(() => {
    createFolder('New Folder');
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
    <div className="h-screen w-full flex overflow-hidden bg-white text-[#37352F] font-body">
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
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top bar on mobile or when sidebar hidden */}
        {!sidebarOpen && (
          <div
            data-testid="topbar"
            className="flex items-center gap-2 px-3 py-2 border-b border-[#EBEBEA] bg-white"
          >
            <button
              data-testid="open-sidebar-btn"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md text-[#787774] hover:bg-[#EFEFEF] hover:text-[#37352F] transition-colors"
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
            onUpdateNote={handleUpdateNote}
            onCreateTag={handleCreateTag}
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
            background: '#FFFFFF',
            border: '1px solid #EBEBEA',
            color: '#37352F',
            fontFamily: 'Figtree, sans-serif',
          },
        }}
      />
    </div>
  );
}

export default App;
