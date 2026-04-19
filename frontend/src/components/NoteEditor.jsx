import { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
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
    <div data-testid="note-editor" className="flex-1 h-full overflow-y-auto bg-white">
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
          className="w-full text-4xl sm:text-5xl font-heading font-bold text-[#1F1F1F] tracking-tight placeholder-[#E3E2E0] bg-transparent border-0 focus:outline-none focus:ring-0 mb-2 leading-tight"
        />

        {/* Metadata */}
        <p className="text-sm text-[#787774] mb-6">
          {new Date(note.updatedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        {/* Formatting Toolbar */}
        <EditorToolbar editor={editor} />

        <Separator className="mb-6 bg-[#EBEBEA]" />

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
              <div key={`sep-${i}`} className="w-px h-5 bg-[#EBEBEA] mx-1" />
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
                      ? 'bg-[#EFEFEF] text-[#1F1F1F]'
                      : 'text-[#787774] hover:bg-[#EFEFEF] hover:text-[#37352F]'
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
