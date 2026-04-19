import { ImageIcon, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const DEFAULT_COVERS = [
  {
    url: 'https://images.unsplash.com/photo-1602128110234-2d11c0aaadfe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJjaGl0ZWN0dXJlfGVufDB8fHx8MTc3NjYwOTEyM3ww&ixlib=rb-4.1.0&q=85&w=1200',
    label: 'Architecture',
  },
  {
    url: 'https://images.unsplash.com/photo-1760442903458-664c65a88b8a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHNvZnQlMjBncmFkaWVudHxlbnwwfHx8fDE3NzY2MDkxMjN8MA&ixlib=rb-4.1.0&q=85&w=1200',
    label: 'Gradient',
  },
  {
    url: 'https://images.unsplash.com/photo-1615134732800-ca7ef7a3388c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxjYWxtJTIwbmF0dXJlJTIwbGFuZHNjYXBlfGVufDB8fHx8MTc3NjYwOTEyM3ww&ixlib=rb-4.1.0&q=85&w=1200',
    label: 'Nature',
  },
];

const COLOR_COVERS = [
  { color: '#FFF3E0', label: 'Warm' },
  { color: '#E8F5E9', label: 'Mint' },
  { color: '#E3F2FD', label: 'Sky' },
  { color: '#F3E5F5', label: 'Lavender' },
  { color: '#FBE9E7', label: 'Peach' },
  { color: '#E0F7FA', label: 'Aqua' },
];

export default function CoverPicker({ coverImage, onSelect, onRemove }) {
  return (
    <div data-testid="cover-picker" className="relative group">
      {coverImage ? (
        <div className="relative">
          <div className="h-48 md:h-56 w-full overflow-hidden border-b border-[#EBEBEA]">
            {coverImage.startsWith('#') ? (
              <div className="w-full h-full" style={{ backgroundColor: coverImage }} />
            ) : (
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  data-testid="change-cover-btn"
                  className="px-3 py-1.5 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-md hover:bg-white transition-colors shadow-sm border border-[#EBEBEA]"
                >
                  Change cover
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3 bg-white border-[#EBEBEA] rounded-xl shadow-lg" align="end">
                <CoverOptions onSelect={onSelect} />
              </PopoverContent>
            </Popover>
            <button
              data-testid="remove-cover-btn"
              onClick={onRemove}
              className="px-2 py-1.5 bg-white/90 backdrop-blur-sm rounded-md hover:bg-white transition-colors shadow-sm border border-[#EBEBEA]"
            >
              <X className="w-3.5 h-3.5 text-[#787774]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-12 px-8 md:px-24 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover>
            <PopoverTrigger asChild>
              <button
                data-testid="add-cover-btn"
                className="flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#37352F] hover:bg-[#EFEFEF] rounded-md px-2 py-1 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                Add cover
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3 bg-white border-[#EBEBEA] rounded-xl shadow-lg" align="start">
              <CoverOptions onSelect={onSelect} />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}

function CoverOptions({ onSelect }) {
  return (
    <div data-testid="cover-options">
      <p className="text-xs font-medium text-[#787774] mb-2 px-1">Photos</p>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {DEFAULT_COVERS.map((cover) => (
          <button
            key={cover.url}
            data-testid={`cover-photo-${cover.label.toLowerCase()}`}
            onClick={() => onSelect(cover.url)}
            className="h-14 rounded-md overflow-hidden hover:ring-2 hover:ring-[#37352F] transition-all"
          >
            <img src={cover.url} alt={cover.label} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      <p className="text-xs font-medium text-[#787774] mb-2 px-1">Colors</p>
      <div className="grid grid-cols-6 gap-1.5">
        {COLOR_COVERS.map((cover) => (
          <button
            key={cover.color}
            data-testid={`cover-color-${cover.label.toLowerCase()}`}
            onClick={() => onSelect(cover.color)}
            className="h-8 rounded-md hover:ring-2 hover:ring-[#37352F] transition-all"
            style={{ backgroundColor: cover.color }}
            title={cover.label}
          />
        ))}
      </div>
    </div>
  );
}
