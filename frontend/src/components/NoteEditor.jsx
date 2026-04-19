import { useEffect, useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import html2pdf from 'html2pdf.js';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, ListChecks,
  Quote, Code, Highlighter, Minus, Download, Loader2,
  MoreHorizontal, FilePlus, FileText, ChevronRight, Home,
} from 'lucide-react';
import CoverPicker from './CoverPicker';
import TagSelector, { TagBadge } from './TagSelector';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function NoteEditor({
  note, allTags, allNotes, allFolders, onUpdateNote, onCreateTag,
  onCreateSubPage, onSelectNote,
}) {
  const titleRef = useRef(null);
  const isInternalUpdate = useRef(false);
  const [exporting, setExporting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Start writing, or press '/' for commands..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
    ],
    content: note?.content || '<p></p>',
    onUpdate: ({ editor }) => {
      if (isInternalUpdate.current) return;
      onUpdateNote(note.id, { content: editor.getJSON() });
    },
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[300px]',
        'data-testid': 'editor-content',
      },
    },
  });

  useEffect(() => {
    if (editor && note) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(note.content || { type: 'doc', content: [{ type: 'paragraph' }] });
      if (currentContent !== newContent) {
        isInternalUpdate.current = true;
        editor.commands.setContent(note.content || '<p></p>');
        isInternalUpdate.current = false;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id, editor]);

  const handleExportPDF = useCallback(async () => {
    if (!note || !editor) return;
    setExporting(true);
    try {
      const container = document.createElement('div');
      container.className = 'pdf-export-container';
      container.style.padding = '40px';
      container.style.maxWidth = '800px';
      container.style.fontFamily = 'Figtree, sans-serif';
      container.style.color = '#37352F';
      container.style.background = '#FFFFFF';

      const title = document.createElement('h1');
      title.textContent = note.title || 'Untitled';
      title.style.fontFamily = 'Outfit, sans-serif';
      title.style.fontSize = '2.5em';
      title.style.fontWeight = '700';
      title.style.color = '#1F1F1F';
      title.style.marginBottom = '8px';
      title.style.letterSpacing = '-0.02em';
      container.appendChild(title);

      const date = document.createElement('p');
      date.textContent = new Date(note.updatedAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });
      date.style.color = '#787774';
      date.style.fontSize = '0.875rem';
      date.style.marginBottom = '24px';
      container.appendChild(date);

      const hr = document.createElement('hr');
      hr.style.border = 'none';
      hr.style.borderTop = '1px solid #EBEBEA';
      hr.style.marginBottom = '24px';
      container.appendChild(hr);

      const content = document.createElement('div');
      content.innerHTML = editor.getHTML();
      content.style.lineHeight = '1.7';
      container.appendChild(content);

      document.body.appendChild(container);
      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `${(note.title || 'Untitled').replace(/[^a-zA-Z0-9 ]/g, '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(container).save();
      document.body.removeChild(container);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [note, editor]);

  const handleTitleChange = useCallback((e) => {
    onUpdateNote(note.id, { title: e.target.value });
  }, [note?.id, onUpdateNote]);

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') { e.preventDefault(); editor?.commands.focus('start'); }
  }, [editor]);

  const handleCoverSelect = useCallback((url) => {
    onUpdateNote(note.id, { coverImage: url });
  }, [note?.id, onUpdateNote]);

  const handleCoverRemove = useCallback(() => {
    onUpdateNote(note.id, { coverImage: null });
  }, [note?.id, onUpdateNote]);

  const handleToggleTag = useCallback((tagId) => {
    const currentTags = note.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((t) => t !== tagId)
      : [...currentTags, tagId];
    onUpdateNote(note.id, { tags: newTags });
  }, [note?.id, note?.tags, onUpdateNote]);

  if (!note || !editor) return null;

  const selectedTags = allTags.filter((t) => (note.tags || []).includes(t.id));
  const subPages = (allNotes || []).filter((n) => n.parentNoteId === note.id);

  // Build breadcrumb chain: [folder?] → ancestor notes → current
  const breadcrumbs = [];
  if (note.parentNoteId) {
    // Walk up the parent chain
    const ancestors = [];
    let currentId = note.parentNoteId;
    const visited = new Set();
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const parent = (allNotes || []).find((n) => n.id === currentId);
      if (parent) {
        ancestors.unshift({ id: parent.id, title: parent.title || 'Untitled', type: 'note' });
        currentId = parent.parentNoteId;
      } else break;
    }
    // Add folder if the root ancestor has one
    const rootNote = ancestors[0] || note;
    if (rootNote && rootNote.type !== 'folder') {
      const actualRoot = (allNotes || []).find((n) => n.id === (ancestors[0]?.id)) || note;
      if (actualRoot.folderId && allFolders) {
        const folder = allFolders.find((f) => f.id === actualRoot.folderId);
        if (folder) {
          // Walk folder parents too
          const folderChain = [];
          let fId = folder.id;
          const fVisited = new Set();
          while (fId && !fVisited.has(fId)) {
            fVisited.add(fId);
            const f = allFolders.find((fl) => fl.id === fId);
            if (f) { folderChain.unshift({ id: f.id, title: f.name, type: 'folder' }); fId = f.parentId; }
            else break;
          }
          breadcrumbs.push(...folderChain);
        }
      }
    }
    breadcrumbs.push(...ancestors);
  } else if (note.folderId && allFolders) {
    // No parent note but in a folder - show folder chain
    const folderChain = [];
    let fId = note.folderId;
    const fVisited = new Set();
    while (fId && !fVisited.has(fId)) {
      fVisited.add(fId);
      const f = allFolders.find((fl) => fl.id === fId);
      if (f) { folderChain.unshift({ id: f.id, title: f.name, type: 'folder' }); fId = f.parentId; }
      else break;
    }
    breadcrumbs.push(...folderChain);
  }
  const showBreadcrumbs = breadcrumbs.length > 0;

  return (
    <div data-testid="note-editor" className="flex-1 h-full overflow-y-auto bg-[var(--n-bg)] relative">
      {/* Ellipsis menu - top right */}
      <div className="absolute top-3 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid="note-actions-menu"
              className="p-1.5 rounded-md text-[var(--n-text-secondary)] hover:bg-[var(--n-hover)] hover:text-[var(--n-text)] transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 bg-[var(--n-bg)] border-[var(--n-border)] rounded-lg shadow-md" align="end">
            <DropdownMenuItem
              data-testid="menu-add-subpage"
              onClick={() => onCreateSubPage(note.id)}
              className="gap-2 text-[var(--n-text)] cursor-pointer"
            >
              <FilePlus className="w-4 h-4" strokeWidth={1.5} />
              Add sub-page
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--n-border)]" />
            <DropdownMenuItem
              data-testid="menu-export-pdf"
              onClick={handleExportPDF}
              disabled={exporting}
              className="gap-2 text-[var(--n-text)] cursor-pointer"
            >
              {exporting
                ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                : <Download className="w-4 h-4" strokeWidth={1.5} />}
              {exporting ? 'Exporting...' : 'Export as PDF'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CoverPicker
        coverImage={note.coverImage}
        onSelect={handleCoverSelect}
        onRemove={handleCoverRemove}
      />

      <div className={`w-full max-w-4xl mx-auto px-8 md:px-24 ${note.coverImage ? 'pt-8' : 'pt-12'} pb-24 flex flex-col`}>
        {/* Breadcrumb navigation */}
        {showBreadcrumbs && (
          <nav data-testid="breadcrumb-nav" className="flex items-center gap-1 mb-3 flex-wrap">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.id} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-[var(--n-placeholder)]" strokeWidth={1.5} />}
                {crumb.type === 'note' ? (
                  <button
                    data-testid={`breadcrumb-${crumb.id}`}
                    onClick={() => onSelectNote(crumb.id)}
                    className="text-xs text-[var(--n-text-secondary)] hover:text-[var(--n-text)] hover:bg-[var(--n-hover)] rounded px-1.5 py-0.5 transition-colors truncate max-w-[160px]"
                  >
                    {crumb.title}
                  </button>
                ) : (
                  <span
                    data-testid={`breadcrumb-folder-${crumb.id}`}
                    className="text-xs text-[var(--n-text-secondary)] px-1.5 py-0.5 truncate max-w-[160px]"
                  >
                    {crumb.title}
                  </span>
                )}
              </span>
            ))}
            <ChevronRight className="w-3 h-3 text-[var(--n-placeholder)]" strokeWidth={1.5} />
            <span className="text-xs text-[var(--n-text)] font-medium px-1.5 py-0.5 truncate max-w-[200px]">
              {note.title || 'Untitled'}
            </span>
          </nav>
        )}

        {/* Tag selector row */}
        <div className="flex items-center gap-1 mb-4 opacity-30 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <TagSelector
            allTags={allTags}
            selectedTagIds={note.tags || []}
            onToggleTag={handleToggleTag}
            onCreateTag={onCreateTag}
          />
        </div>

        {/* Tags display */}
        {selectedTags.length > 0 && (
          <div data-testid="note-tags" className="flex flex-wrap gap-1.5 mb-4">
            {selectedTags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} onRemove={(id) => handleToggleTag(id)} />
            ))}
          </div>
        )}

        {/* Title */}
        <input
          ref={titleRef}
          data-testid="note-title-input"
          value={note.title || ''}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="w-full text-4xl sm:text-5xl font-heading font-bold text-[var(--n-text-title)] tracking-tight placeholder-[var(--n-placeholder)] bg-transparent border-0 focus:outline-none focus:ring-0 mb-2 leading-tight"
        />

        {/* Metadata */}
        <p className="text-sm text-[var(--n-text-secondary)] mb-6">
          {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Formatting Toolbar */}
        <EditorToolbar editor={editor} />
        <Separator className="mb-6 bg-[var(--n-border)]" />

        {/* Editor */}
        <EditorContent editor={editor} />

        {/* Sub-pages section */}
        {(subPages.length > 0) && (
          <div data-testid="sub-pages-section" className="mt-10 pt-6 border-t border-[var(--n-border)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[var(--n-text-secondary)] uppercase tracking-wider">
                Sub-pages
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {subPages.map((sp) => (
                <button
                  key={sp.id}
                  data-testid={`subpage-link-${sp.id}`}
                  onClick={() => onSelectNote(sp.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--n-hover)] transition-colors text-left group"
                >
                  <FileText className="w-4 h-4 text-[var(--n-text-secondary)] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm text-[var(--n-text)] truncate flex-1">
                    {sp.title || 'Untitled'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--n-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add sub-page inline button */}
        <button
          data-testid="add-subpage-inline"
          onClick={() => onCreateSubPage(note.id)}
          className="flex items-center gap-2 mt-6 px-3 py-2 rounded-lg text-[var(--n-text-secondary)] hover:bg-[var(--n-hover)] hover:text-[var(--n-text)] transition-colors text-sm opacity-40 hover:opacity-100"
        >
          <FilePlus className="w-4 h-4" strokeWidth={1.5} />
          Add a sub-page
        </button>
      </div>
    </div>
  );
}

function EditorToolbar({ editor }) {
  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), tip: 'Bold' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), tip: 'Italic' },
    { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), tip: 'Underline' },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), tip: 'Strikethrough' },
    { type: 'sep' },
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), tip: 'Heading 1' },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), tip: 'Heading 2' },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), tip: 'Heading 3' },
    { type: 'sep' },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), tip: 'Bullet List' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), tip: 'Numbered List' },
    { icon: ListChecks, action: () => editor.chain().focus().toggleTaskList().run(), active: editor.isActive('taskList'), tip: 'Task List' },
    { type: 'sep' },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), tip: 'Quote' },
    { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), tip: 'Code Block' },
    { icon: Highlighter, action: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive('highlight'), tip: 'Highlight' },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false, tip: 'Divider' },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div data-testid="editor-toolbar" className="flex items-center gap-0.5 mb-4 flex-wrap">
        {tools.map((tool, i) => {
          if (tool.type === 'sep') return <div key={`sep-${i}`} className="w-px h-5 bg-[var(--n-border)] mx-1" />;
          const Icon = tool.icon;
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <button
                  data-testid={`toolbar-${tool.tip.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={tool.action}
                  className={`p-1.5 rounded-md transition-colors ${
                    tool.active
                      ? 'bg-[var(--n-hover)] text-[var(--n-text-title)]'
                      : 'text-[var(--n-text-secondary)] hover:bg-[var(--n-hover)] hover:text-[var(--n-text)]'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{tool.tip}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
