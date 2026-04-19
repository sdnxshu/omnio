import { useEffect, useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import html2pdf from 'html2pdf.js';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Highlighter,
  Minus,
  Download,
  Loader2,
} from 'lucide-react';
import CoverPicker from './CoverPicker';
import TagSelector, { TagBadge } from './TagSelector';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function NoteEditor({
  note,
  allTags,
  onUpdateNote,
  onCreateTag,
}) {
  const titleRef = useRef(null);
  const isInternalUpdate = useRef(false);
  const [exporting, setExporting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Start writing, or press '/' for commands...",
      }),
      Underline,
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

  const handleTitleChange = useCallback(
    (e) => {
      onUpdateNote(note.id, { title: e.target.value });
    },
    [note?.id, onUpdateNote]
  );

  const handleTitleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        editor?.commands.focus('start');
      }
    },
    [editor]
  );

  const handleCoverSelect = useCallback(
    (url) => {
      onUpdateNote(note.id, { coverImage: url });
    },
    [note?.id, onUpdateNote]
  );

  const handleCoverRemove = useCallback(() => {
    onUpdateNote(note.id, { coverImage: null });
  }, [note?.id, onUpdateNote]);

  const handleToggleTag = useCallback(
    (tagId) => {
      const currentTags = note.tags || [];
      const newTags = currentTags.includes(tagId)
        ? currentTags.filter((t) => t !== tagId)
        : [...currentTags, tagId];
      onUpdateNote(note.id, { tags: newTags });
    },
    [note?.id, note?.tags, onUpdateNote]
  );

  if (!note || !editor) return null;

  const selectedTags = allTags.filter((t) => (note.tags || []).includes(t.id));

  return (
    <div
      data-testid="note-editor"
      className="flex-1 h-full overflow-y-auto bg-[var(--n-bg)]"
    >
      <CoverPicker
        coverImage={note.coverImage}
        onSelect={handleCoverSelect}
        onRemove={handleCoverRemove}
      />

      <div className={`w-full max-w-4xl mx-auto px-8 md:px-24 ${note.coverImage ? 'pt-8' : 'pt-20'} pb-24 flex flex-col`}>
        {/* Toolbar row */}
        <div className="flex items-center gap-1 mb-4 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <TagSelector
            allTags={allTags}
            selectedTagIds={note.tags || []}
            onToggleTag={handleToggleTag}
            onCreateTag={onCreateTag}
          />
          <button
            data-testid="export-pdf-btn"
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-1.5 text-xs text-[var(--n-text-secondary)] hover:text-[var(--n-text)] hover:bg-[var(--n-hover)] rounded-md px-2 py-1 transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
            ) : (
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>

        {/* Tags display */}
        {selectedTags.length > 0 && (
          <div data-testid="note-tags" className="flex flex-wrap gap-1.5 mb-4">
            {selectedTags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                onRemove={(id) => handleToggleTag(id)}
              />
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
          {new Date(note.updatedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        {/* Formatting Toolbar */}
        <EditorToolbar editor={editor} />

        <Separator className="mb-6 bg-[var(--n-border)]" />

        {/* Editor */}
        <EditorContent editor={editor} />
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
      <div
        data-testid="editor-toolbar"
        className="flex items-center gap-0.5 mb-4 flex-wrap"
      >
        {tools.map((tool, i) => {
          if (tool.type === 'sep') {
            return (
              <div key={`sep-${i}`} className="w-px h-5 bg-[var(--n-border)] mx-1" />
            );
          }
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
              <TooltipContent side="bottom" className="text-xs">
                {tool.tip}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
