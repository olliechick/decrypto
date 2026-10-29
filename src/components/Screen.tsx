import type { ReactNode } from 'react';

// The page layout every screen uses: a narrow column for a phone held upright
export function Screen({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-slate-900 text-white">
      <div className="mx-auto max-w-md px-4 py-6 space-y-5">{children}</div>
    </main>
  );
}
