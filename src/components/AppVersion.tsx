// Which version of the app this is, so the two phones can be checked against each other (see vite.config.ts)
export function AppVersion({ className = '' }: { className?: string }) {
  return <p className={`text-xs text-white/40 ${className}`}>Version {import.meta.env.VITE_APP_VERSION}</p>;
}
