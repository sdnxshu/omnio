import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Pencil,
  PanelLeftClose,
  FolderPlus,
  ChevronDown,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TagBadge } from './TagSelector';

export default function Sidebar({
  notes,
  folders,
  tags,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onOpenSearch,
  onToggleSidebar,
  sidebarOpen,
}) {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef(null);

  useEffect(() => {
    if (renamingFolderId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingFolderId]);

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const startRename = (folder) => {
    setRenamingFolderId(folder.id);
    setRenameValue(folder.name);
  };

  const finishRename = () => {
    if (renamingFolderId && renameValue.trim()) {
      onRenameFolder(renamingFolderId, renameValue.trim());
    }
    setRenamingFolderId(null);
    setRenameValue('');
  };

  const unorganizedNotes = notes.filter((n) => !n.folderId);

  const getNoteTags = (note) => {
    return (note.tags || [])
      .map((id) => tags.find((t) => t.id === id))
      .filter(Boolean);
  };

  return (
    <aside
      data-testid="sidebar"
      className={`flex-shrink-0 border-r border-[#EBEBEA] bg-[#F7F7F5] flex flex-col h-full transition-all duration-300 ${
        sidebarOpen ? 'w-64 md:w-72' : 'w-0 overflow-hidden'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[#EBEBEA]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1F1F1F] flex items-center justify-center">
            <span className="text-white text-xs font-bold font-heading">N</span>
          </div>
          <span className="text-sm font-semibold text-[#1F1F1F] font-heading">Notes</span>
        </div>
        <button
          data-testid="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="p-1 rounded-md text-[#787774] hover:bg-[#EBEBEA] hover:text-[#37352F] transition-colors"
        >
          <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Search */}
      <button
        data-testid="search-trigger"
        onClick={onOpenSearch}
        className="flex items-center gap-2 mx-3 mt-3 mb-1 px-2.5 py-1.5 rounded-md text-sm text-[#787774] hover:bg-[#EBEBEA] transition-colors"
      >
        <Search className="w-4 h-4" strokeWidth={1.5} />
        <span className="flex-1 text-left">Search</span>
        <kbd className="text-[10px] bg-[#E3E2E0] text-[#787774] px-1.5 py-0.5 rounded font-mono">
          {navigator.platform?.includes('Mac') ? '\u2318' : 'Ctrl'}K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 mb-1">
        <button
          data-testid="new-note-btn"
          onClick={() => onCreateNote(null)}
          className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-[#787774] hover:bg-[#EBEBEA] hover:text-[#37352F] transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          New page
        </button>
        <button
          data-testid="new-folder-btn"
          onClick={() => onCreateFolder()}
          className="p-1.5 rounded-md text-[#787774] hover:bg-[#EBEBEA] hover:text-[#37352F] transition-colors"
        >
          <FolderPlus className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Notes list */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-1">
          {/* Folders */}
          {folders.map((folder) => {
            const isExpanded = expandedFolders[folder.id] !== false;
            const folderNotes = notes.filter((n) => n.folderId === folder.id);
            return (
              <div key={folder.id} data-testid={`folder-${folder.id}`}>
                <div className="flex items-center group">
                  <button
                    data-testid={`folder-toggle-${folder.id}`}
                    onClick={() => toggleFolder(folder.id)}
                    className="p-0.5 text-[#787774] hover:bg-[#EBEBEA] rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                  <div
                    className="flex-1 flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-[#EBEBEA] cursor-pointer transition-colors"
                    onClick={() => toggleFolder(folder.id)}
                  >
                    {isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-[#787774]" strokeWidth={1.5} />
                    ) : (
                      <Folder className="w-4 h-4 text-[#787774]" strokeWidth={1.5} />
                    )}
                    {renamingFolderId === folder.id ? (
                      <input
                        ref={renameInputRef}
                        data-testid={`folder-rename-input-${folder.id}`}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={finishRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishRename();
                          if (e.key === 'Escape') setRenamingFolderId(null);
                        }}
                        className="flex-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-[#37352F] py-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="flex-1 text-sm text-[#37352F] truncate">
                        {folder.name}
                      </span>
                    )}
                    <span className="text-[10px] text-[#787774]">{folderNotes.length}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        data-testid={`folder-menu-${folder.id}`}
                        className="p-1 rounded-md text-[#787774] opacity-0 group-hover:opacity-100 hover:bg-[#EBEBEA] transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 bg-white border-[#EBEBEA] rounded-lg shadow-md"
                      align="start"
                    >
                      <DropdownMenuItem
                        data-testid={`folder-add-note-${folder.id}`}
                        onClick={() => onCreateNote(folder.id)}
                        className="gap-2 text-[#37352F] cursor-pointer"
                      >
                        <Plus className="w-4 h-4" strokeWidth={1.5} />
                        New note inside
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        data-testid={`folder-rename-${folder.id}`}
                        onClick={() => startRename(folder)}
                        className="gap-2 text-[#37352F] cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#EBEBEA]" />
                      <DropdownMenuItem
                        data-testid={`folder-delete-${folder.id}`}
                        onClick={() => onDeleteFolder(folder.id)}
                        className="gap-2 text-red-600 cursor-pointer focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Folder notes */}
                {isExpanded && (
                  <div className="ml-4 pl-2 border-l border-[#EBEBEA]">
                    {folderNotes.length === 0 ? (
                      <p className="text-[10px] text-[#787774] px-2 py-1.5 italic">No pages inside</p>
                    ) : (
                      folderNotes.map((note) => (
                        <NoteItem
                          key={note.id}
                          note={note}
                          isSelected={note.id === selectedNoteId}
                          onSelect={onSelectNote}
                          onDelete={onDeleteNote}
                          tags={getNoteTags(note)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unorganized notes */}
          {unorganizedNotes.length > 0 && (
            <div data-testid="unorganized-section">
              {folders.length > 0 && (
                <p className="text-[10px] font-medium text-[#787774] uppercase tracking-wider px-2 pt-3 pb-1">
                  Pages
                </p>
              )}
              {unorganizedNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={note.id === selectedNoteId}
                  onSelect={onSelectNote}
                  onDelete={onDeleteNote}
                  tags={getNoteTags(note)}
                />
              ))}
            </div>
          )}

          {notes.length === 0 && folders.length === 0 && (
            <div className="text-center py-8 px-4">
              <p className="text-xs text-[#787774]">No pages yet</p>
              <button
                data-testid="sidebar-empty-create-btn"
                onClick={() => onCreateNote(null)}
                className="text-xs text-[#37352F] font-medium mt-1 hover:underline"
              >
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
        isSelected ? 'bg-[#EAEAEA]' : 'hover:bg-[#EBEBEA]'
      }`}
      onClick={() => onSelect(note.id)}
    >
      <div className="flex-1 flex items-center gap-2 px-2 py-1.5 min-w-0">
        <FileText className="w-4 h-4 text-[#787774] flex-shrink-0" strokeWidth={1.5} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${isSelected ? 'font-medium text-[#1F1F1F]' : 'text-[#37352F]'}`}>
            {note.title || 'Untitled'}
          </p>
          {tags.length > 0 && (
            <div className="flex gap-1 mt-0.5 overflow-hidden">
              {tags.slice(0, 2).map((tag) => (
                <TagBadge key={tag.id} tag={tag} small />
              ))}
              {tags.length > 2 && (
                <span className="text-[9px] text-[#787774]">+{tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            data-testid={`note-menu-${note.id}`}
            className="p-1 mr-1 rounded-md text-[#787774] opacity-0 group-hover:opacity-100 hover:bg-[#EBEBEA] transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-44 bg-white border-[#EBEBEA] rounded-lg shadow-md"
          align="start"
        >
          <DropdownMenuItem
            data-testid={`note-delete-${note.id}`}
            onClick={() => onDelete(note.id)}
            className="gap-2 text-red-600 cursor-pointer focus:text-red-600"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
