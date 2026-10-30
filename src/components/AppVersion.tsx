declare const __BUILD_TIME__: string;

const pad = (n: number) => String(n).padStart(2, '0');

// When this version was built, as yyyy-MM-dd.HH:mm in local time, the same as the home app. The two phones can be
// checked against each other by eye.
function buildVersion(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AppVersion({ className = '' }: { className?: string }) {
  return <p className={`text-xs text-white/40 ${className}`}>v{buildVersion(__BUILD_TIME__)}</p>;
}
