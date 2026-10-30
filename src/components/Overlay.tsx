import { useEffect, type ReactNode } from 'react';

interface OverlayProps {
  title: string;
  onClose: () => void;
  wide?: boolean; // spread out on a phone turned on its side
  children: ReactNode;
}

// A full-screen panel over the game, closed with the button or Escape
export function Overlay({ title, onClose, wide = false, children }: OverlayProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="safe-area fixed inset-0 z-10 overflow-y-auto bg-slate-900 text-white" role="dialog" aria-modal aria-label={title}>
      <div className={`mx-auto max-w-md px-4 py-6 space-y-5 ${wide ? 'landscape:max-w-5xl landscape:py-3 landscape:space-y-3' : ''}`}>
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
