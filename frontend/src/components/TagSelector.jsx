import { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const TAG_COLORS = {
  red: 'bg-[#FFE2DD] text-[#93271C]',
  blue: 'bg-[#D3E5EF] text-[#183347]',
  green: 'bg-[#DBEDDB] text-[#1C3829]',
  yellow: 'bg-[#FDECC8] text-[#402C1B]',
  purple: 'bg-[#E8DEEE] text-[#412454]',
  gray: 'bg-[#E3E2E0] text-[#32302C]',
};

const COLOR_OPTIONS = Object.keys(TAG_COLORS);

export function TagBadge({ tag, onRemove, small }) {
  const colorClass = TAG_COLORS[tag.color] || TAG_COLORS.gray;
  return (
    <span
      data-testid={`tag-badge-${tag.id}`}
      className={`inline-flex items-center gap-1 rounded-md font-medium ${colorClass} ${
        small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
    >
      {tag.name}
      {onRemove && (
        <button
          data-testid={`tag-remove-${tag.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag.id);
          }}
          className="hover:opacity-70 transition-opacity"
        >
          <X className="w-3 h-3" strokeWidth={2} />
        </button>
      )}
    </span>
  );
}

export default function TagSelector({ allTags, selectedTagIds, onToggleTag, onCreateTag }) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');

  const handleCreate = () => {
    if (!newTagName.trim()) return;
    onCreateTag(newTagName.trim(), newTagColor);
    setNewTagName('');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          data-testid="tag-selector-trigger"
          className="flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#37352F] hover:bg-[#EFEFEF] rounded-md px-2 py-1 transition-colors"
        >
          <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
          Tags
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-white border-[#EBEBEA] rounded-xl shadow-lg" align="start">
        <div data-testid="tag-selector-content">
          <p className="text-xs font-medium text-[#787774] mb-2">Select tags</p>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {allTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    data-testid={`tag-option-${tag.id}`}
                    onClick={() => onToggleTag(tag.id)}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-all ${
                      TAG_COLORS[tag.color] || TAG_COLORS.gray
                    } ${isSelected ? 'ring-2 ring-[#37352F] ring-offset-1' : 'opacity-60 hover:opacity-100'}`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
          <div className="border-t border-[#EBEBEA] pt-2.5">
            <p className="text-xs font-medium text-[#787774] mb-2">Create new tag</p>
            <div className="flex gap-1.5 mb-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  data-testid={`tag-color-${color}`}
                  onClick={() => setNewTagColor(color)}
                  className={`w-5 h-5 rounded-full transition-all ${
                    TAG_COLORS[color].split(' ')[0]
                  } ${newTagColor === color ? 'ring-2 ring-[#37352F] ring-offset-1' : ''}`}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                data-testid="new-tag-input"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Tag name..."
                className="flex-1 text-xs px-2 py-1.5 rounded-md border border-[#EBEBEA] bg-transparent placeholder-[#787774] focus:outline-none focus:ring-1 focus:ring-[#EBEBEA]"
              />
              <button
                data-testid="create-tag-btn"
                onClick={handleCreate}
                disabled={!newTagName.trim()}
                className="px-2 py-1.5 text-xs font-medium rounded-md bg-[#1F1F1F] text-white hover:bg-[#37352F] disabled:opacity-30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
