import { useEffect, useState, useCallback } from 'react';
import { FileText, Search, Folder, Tag } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { searchNotes, getFolders, getTags } from '@/lib/storage';

export default function SearchDialog({ open, onOpenChange, onSelectNote }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const folders = getFolders();
  const tags = getTags();

  const getFolderName = useCallback(
    (folderId) => {
      const f = folders.find((f) => f.id === folderId);
      return f ? f.name : null;
    },
    [folders]
  );

  useEffect(() => {
    if (query.trim()) {
      setResults(searchNotes(query));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  const getTagNames = (tagIds) => {
    return tagIds
      .map((id) => tags.find((t) => t.id === id))
      .filter(Boolean)
      .map((t) => t.name);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        data-testid="search-input"
        placeholder="Search notes..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty data-testid="search-empty">
          <div className="flex flex-col items-center gap-2 py-4">
            <Search className="w-8 h-8 text-[var(--n-text-secondary)]" strokeWidth={1.5} />
            <p className="text-sm text-[var(--n-text-secondary)]">
              {query ? 'No notes found' : 'Type to search your notes'}
            </p>
          </div>
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Notes" data-testid="search-results">
            {results.map((note) => {
              const folderName = getFolderName(note.folderId);
              const noteTagNames = getTagNames(note.tags || []);
              return (
                <CommandItem
                  key={note.id}
                  data-testid={`search-result-${note.id}`}
                  value={note.title || 'Untitled'}
                  onSelect={() => {
                    onSelectNote(note.id);
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[var(--n-text-secondary)] flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--n-text)] truncate">
                      {note.title || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {folderName && (
                        <span className="flex items-center gap-1 text-[10px] text-[var(--n-text-secondary)]">
                          <Folder className="w-3 h-3" strokeWidth={1.5} />
                          {folderName}
                        </span>
                      )}
                      {noteTagNames.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-[var(--n-text-secondary)]">
                          <Tag className="w-3 h-3" strokeWidth={1.5} />
                          {noteTagNames.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--n-text-secondary)] flex-shrink-0">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
