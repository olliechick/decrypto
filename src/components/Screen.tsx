import type { ReactNode } from 'react';

// The page layout every screen uses: a narrow column for a phone held upright. A wide screen spreads out on a phone
// turned on its side, filling its height.
export function Screen({ wide = false, children }: { wide?: boolean; children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-slate-900 text-white">
      <div className={`mx-auto max-w-md px-4 py-4 space-y-4 ${wide ? 'landscape:max-w-5xl landscape:min-h-dvh landscape:flex landscape:flex-col landscape:py-3 landscape:space-y-3' : ''}`}>
        {children}
      </div>
    </main>
  );
}
