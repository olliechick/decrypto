import { useEffect, type ReactNode } from 'react';

// A full-screen panel over the game, closed with the button or Escape
export function Overlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-slate-900 text-white" role="dialog" aria-modal aria-label={title}>
      <div className="mx-auto max-w-md px-4 py-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black">{title}</h1>
          <button type="button" onClick={onClose} className="rounded-xl bg-white/10 px-4 py-2 font-bold hover:bg-white/20">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
