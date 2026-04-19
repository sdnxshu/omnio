import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Plus, FileText, Folder, FolderOpen,
  ChevronRight, MoreHorizontal, Trash2, Pencil,
  PanelLeftClose, FolderPlus, ChevronDown, Sun, Moon,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TagBadge } from './TagSelector';

export default function Sidebar({
  notes, folders, tags, selectedNoteId,
  onSelectNote, onCreateNote, onDeleteNote,
  onCreateFolder, onRenameFolder, onDeleteFolder,
  onOpenSearch, onToggleSidebar, sidebarOpen,
  darkMode, onToggleTheme,
}) {
  const [expanded, setExpanded] = useState({});
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const renameRef = useRef(null);

  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  const toggle = useCallback((id) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }, []);

  const startRename = useCallback((f) => {
    setRenamingId(f.id);
    setRenameVal(f.name);
  }, []);

  const finishRename = useCallback(() => {
    if (renamingId && renameVal.trim()) onRenameFolder(renamingId, renameVal.trim());
    setRenamingId(null);
    setRenameVal('');
  }, [renamingId, renameVal, onRenameFolder]);

  const rootFolders = folders.filter((f) => !f.parentId);
  const unorganizedNotes = notes.filter((n) => !n.folderId);

  const getNoteTags = (note) =>
    (note.tags || []).map((id) => tags.find((t) => t.id === id)).filter(Boolean);

  // Build lookup maps once
  const childFolderMap = {};
  const folderNoteMap = {};
  folders.forEach((f) => {
    const pid = f.parentId || '__root__';
    if (!childFolderMap[pid]) childFolderMap[pid] = [];
    childFolderMap[pid].push(f);
  });
  notes.forEach((n) => {
    const fid = n.folderId || '__none__';
    if (!folderNoteMap[fid]) folderNoteMap[fid] = [];
    folderNoteMap[fid].push(n);
  });

  const getChildren = (id) => childFolderMap[id] || [];
  const getFolderNotes = (id) => folderNoteMap[id] || [];

  const countItems = (id) => {
    let c = (folderNoteMap[id] || []).length;
    (childFolderMap[id] || []).forEach((f) => { c += countItems(f.id); });
    return c;
  };

  const renderFolder = (folder, depth) => {
    const isOpen = expanded[folder.id] !== false;
    const children = getChildren(folder.id);
    const fNotes = getFolderNotes(folder.id);
    const total = countItems(folder.id);

    return (
      <div key={folder.id} data-testid={`folder-${folder.id}`}>
        <div className="flex items-center group">
          <button
            data-testid={`folder-toggle-${folder.id}`}
            onClick={() => toggle(folder.id)}
            className="p-0.5 text-[var(--n-text-secondary)] hover:bg-[var(--n-hover)] rounded transition-colors"
          >
            {isOpen
              ? <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
              : <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />}
          </button>
          <div
            className="flex-1 flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-[var(--n-hover)] cursor-pointer transition-colors"
            onClick={() => toggle(folder.id)}
          >
            {isOpen
              ? <FolderOpen className="w-4 h-4 text-[var(--n-text-secondary)]" strokeWidth={1.5} />
              : <Folder className="w-4 h-4 text-[var(--n-text-secondary)]" strokeWidth={1.5} />}
            {renamingId === folder.id ? (
              <input
                ref={renameRef}
                data-testid={`folder-rename-input-${folder.id}`}
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onBlur={finishRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishRename();
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                className="flex-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-[var(--n-text)] py-0"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 text-sm text-[var(--n-text)] truncate">{folder.name}</span>
            )}
            <span className="text-[10px] text-[var(--n-text-secondary)]">{total}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid={`folder-menu-${folder.id}`}
                className="p-1 rounded-md text-[var(--n-text-secondary)] opacity-0 group-hover:opacity-100 hover:bg-[var(--n-hover)] transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-[var(--n-bg)] border-[var(--n-border)] rounded-lg shadow-md" align="start">
              <DropdownMenuItem data-testid={`folder-add-note-${folder.id}`} onClick={() => onCreateNote(folder.id)} className="gap-2 text-[var(--n-text)] cursor-pointer">
                <Plus className="w-4 h-4" strokeWidth={1.5} /> New note inside
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={`folder-add-subfolder-${folder.id}`} onClick={() => onCreateFolder(folder.id)} className="gap-2 text-[var(--n-text)] cursor-pointer">
                <FolderPlus className="w-4 h-4" strokeWidth={1.5} /> New sub-folder
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={`folder-rename-${folder.id}`} onClick={() => startRename(folder)} className="gap-2 text-[var(--n-text)] cursor-pointer">
                <Pencil className="w-4 h-4" strokeWidth={1.5} /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--n-border)]" />
              <DropdownMenuItem data-testid={`folder-delete-${folder.id}`} onClick={() => onDeleteFolder(folder.id)} className="gap-2 text-red-600 cursor-pointer focus:text-red-600">
                <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isOpen && (
          <div className="ml-4 pl-2 border-l border-[var(--n-border)]">
            {children.map((c) => renderFolder(c, depth + 1))}
            {fNotes.map((n) => (
              <NoteItem key={n.id} note={n} isSelected={n.id === selectedNoteId} onSelect={onSelectNote} onDelete={onDeleteNote} tags={getNoteTags(n)} />
            ))}
            {children.length === 0 && fNotes.length === 0 && (
              <p className="text-[10px] text-[var(--n-text-secondary)] px-2 py-1.5 italic">No pages inside</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      data-testid="sidebar"
      className={`flex-shrink-0 border-r border-[var(--n-border)] bg-[var(--n-bg-secondary)] flex flex-col h-full transition-all duration-300 ${
        sidebarOpen ? 'w-64 md:w-72' : 'w-0 overflow-hidden'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--n-border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1F1F1F] dark:bg-white/90 flex items-center justify-center">
            <span className="text-white dark:text-[#1F1F1F] text-xs font-bold font-heading">N</span>
          </div>
          <span className="text-sm font-semibold text-[var(--n-text-title)] font-heading">Notes</span>
        </div>
        <div className="flex items-center gap-1">
          <button data-testid="theme-toggle-btn" onClick={onToggleTheme}
            className="p-1 rounded-md text-[var(--n-text-secondary)] hover:bg-[var(--n-hover)] hover:text-[var(--n-text)] transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            {darkMode ? <Sun className="w-4 h-4" strokeWidth={1.5} /> : <Moon className="w-4 h-4" strokeWidth={1.5} />}
          </button>
          <button data-testid="sidebar-toggle-btn" onClick={onToggleSidebar}
            className="p-1 rounded-md text-[var(--n-text-secondary)] hover:bg-[var(--n-hover)] hover:text-[var(--n-text)] transition-colors">
            <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <button data-testid="search-trigger" onClick={onOpenSearch}
        className="flex items-center gap-2 mx-3 mt-3 mb-1 px-2.5 py-1.5 rounded-md text-sm text-[var(--n-text-secondary)] hover:bg-[var(--n-hover)] transition-colors">
        <Search className="w-4 h-4" strokeWidth={1.5} />
        <span className="flex-1 text-left">Search</span>
        <kbd className="text-[10px] bg-[var(--n-placeholder)] text-[var(--n-text-secondary)] px-1.5 py-0.5 rounded font-mono">
          {navigator.platform?.includes('Mac') ? '\u2318' : 'Ctrl'}K
        </kbd>
      </button>

      <div className="flex items-center gap-1 px-3 mb-1">
        <button data-testid="new-note-btn" onClick={() => onCreateNote(null)}
          className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-[var(--n-text-secondary)] hover:bg-[var(--n-hover)] hover:text-[var(--n-text)] transition-colors">
          <Plus className="w-4 h-4" strokeWidth={1.5} /> New page
        </button>
        <button data-testid="new-folder-btn" onClick={() => onCreateFolder(null)}
          className="p-1.5 rounded-md text-[var(--n-text-secondary)] hover:bg-[var(--n-hover)] hover:text-[var(--n-text)] transition-colors">
          <FolderPlus className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 py-1">
          {rootFolders.map((f) => renderFolder(f, 0))}
          {unorganizedNotes.length > 0 && (
            <div data-testid="unorganized-section">
              {rootFolders.length > 0 && (
                <p className="text-[10px] font-medium text-[var(--n-text-secondary)] uppercase tracking-wider px-2 pt-3 pb-1">Pages</p>
              )}
              {unorganizedNotes.map((n) => (
                <NoteItem key={n.id} note={n} isSelected={n.id === selectedNoteId} onSelect={onSelectNote} onDelete={onDeleteNote} tags={getNoteTags(n)} />
              ))}
            </div>
          )}
          {notes.length === 0 && folders.length === 0 && (
            <div className="text-center py-8 px-4">
              <p className="text-xs text-[var(--n-text-secondary)]">No pages yet</p>
              <button data-testid="sidebar-empty-create-btn" onClick={() => onCreateNote(null)}
                className="text-xs text-[var(--n-text)] font-medium mt-1 hover:underline">
                Create your first page
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function NoteItem({ note, isSelected, onSelect, onDelete, tags }) {
  return (
    <div
      data-testid={`note-item-${note.id}`}
      className={`flex items-center group rounded-md cursor-pointer transition-colors ${
        isSelected ? 'bg-[var(--n-active)]' : 'hover:bg-[var(--n-hover)]'
      }`}
      onClick={() => onSelect(note.id)}
    >
      <div className="flex-1 flex items-center gap-2 px-2 py-1.5 min-w-0">
        <FileText className="w-4 h-4 text-[var(--n-text-secondary)] flex-shrink-0" strokeWidth={1.5} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${isSelected ? 'font-medium text-[var(--n-text-title)]' : 'text-[var(--n-text)]'}`}>
            {note.title || 'Untitled'}
          </p>
          {tags.length > 0 && (
            <div className="flex gap-1 mt-0.5 overflow-hidden">
              {tags.slice(0, 2).map((tag) => (<TagBadge key={tag.id} tag={tag} small />))}
              {tags.length > 2 && (<span className="text-[9px] text-[var(--n-text-secondary)]">+{tags.length - 2}</span>)}
            </div>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button data-testid={`note-menu-${note.id}`}
            className="p-1 mr-1 rounded-md text-[var(--n-text-secondary)] opacity-0 group-hover:opacity-100 hover:bg-[var(--n-hover)] transition-all"
            onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44 bg-[var(--n-bg)] border-[var(--n-border)] rounded-lg shadow-md" align="start">
          <DropdownMenuItem data-testid={`note-delete-${note.id}`} onClick={() => onDelete(note.id)}
            className="gap-2 text-red-600 cursor-pointer focus:text-red-600">
            <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
