import { FileText, Plus } from 'lucide-react';

export default function EmptyState({ onCreateNote }) {
  return (
    <div
      data-testid="empty-state"
      className="flex-1 flex items-center justify-center h-full"
    >
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#F7F7F5] flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-[#787774]" strokeWidth={1.5} />
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl tracking-tight font-semibold text-[#1F1F1F] mb-3">
          No note selected
        </h2>
        <p className="text-[#787774] text-base mb-8 leading-relaxed">
          Select a note from the sidebar or create a new one to get started.
        </p>
        <button
          data-testid="empty-state-create-btn"
          onClick={onCreateNote}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1F1F1F] text-white text-sm font-medium hover:bg-[#37352F] transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          New note
        </button>
      </div>
    </div>
  );
}
