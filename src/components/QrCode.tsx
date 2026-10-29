import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

const QUIET_ZONE = 4; // modules of white around the code, which scanners need

// A QR code drawn as one SVG path, black on white (scanners need dark on light, whatever the page's colours)
export function QrCode({ text, label }: { text: string; label: string }) {
  const { size, path } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    let d = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) d += `M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
    return { size: count + QUIET_ZONE * 2, path: d };
  }, [text]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="w-full max-w-72 mx-auto rounded-xl" shapeRendering="crispEdges">
      <rect width={size} height={size} fill="white" />
      <path d={path} fill="black" />
    </svg>
  );
}
