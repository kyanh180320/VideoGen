import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const YearBar = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  let yearText = '';
  let scale = 1.0;
  let opacity = 1.0;

  if (t < 4.0) {
    // 0-4s: Cảnh 1 (-2879 TCN từ 0.3s)
    if (t >= 0.3) yearText = '-2879 TCN';
  } else if (t < 8.0) {
    // 4-8s: Cảnh 2 (111 TCN -> 938, ease power2.in)
    const prog = (t - 4.0) / 4.0;
    const easeProg = Math.pow(prog, 2);
    const yearVal = -111 + easeProg * (938 - -111);
    const roundYear = Math.round(yearVal);
    yearText = roundYear < 0 ? `${Math.abs(roundYear)} TCN` : `${roundYear}`;
  } else if (t < 12.0) {
    // 8-12s: Cảnh 3 (938, nhấp sáng nhẹ lúc 11s)
    yearText = '938';
    if (t >= 11.0 && t <= 11.4) {
      const bp = (t - 11.0) / 0.4;
      opacity = 0.5 + Math.sin(bp * Math.PI) * 0.5;
    }
  } else if (t < 16.0) {
    // 12-16s: Cảnh 4 (1010 -> 1288)
    const prog = (t - 12.0) / 4.0;
    yearText = `${Math.round(1010 + prog * (1288 - 1010))}`;
  } else if (t < 20.0) {
    // 16-20s: Cảnh 5 (1428 -> 1789)
    const prog = (t - 16.0) / 4.0;
    yearText = `${Math.round(1428 + prog * (1789 - 1428))}`;
  } else if (t < 25.0) {
    // 20-25s: Cảnh 6 (Nhảy thẳng tới 1945 lúc 22s với hiệu ứng bật scale 1.3 -> 1)
    if (t >= 22.0) {
      yearText = '1945';
      const bounceProg = Math.min(1, (t - 22.0) / 0.4);
      scale = 1.3 - bounceProg * 0.3;
    }
  } else {
    // 25-30s: Cảnh 7 (1975 -> 1986 -> 2026)
    if (t < 27.0) {
      const prog = (t - 25.0) / 2.0;
      yearText = `${Math.round(1975 + prog * (1986 - 1975))}`;
    } else {
      const prog = (t - 27.0) / 3.0;
      yearText = `${Math.round(1986 + prog * (2026 - 1986))}`;
    }
  }

  if (!yearText) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 960,
        left: 0,
        width: 1920,
        height: 120,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <span
        style={{
          fontFamily: '"Playfair Display", "Be Vietnam Pro", Georgia, serif',
          fontWeight: 900,
          fontSize: 72,
          color: '#F2C94C',
          textShadow: '0 4px 18px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0,0,0,0.8)',
          transform: `scale(${scale})`,
          opacity,
          letterSpacing: 2,
        }}
      >
        {yearText}
      </span>
    </div>
  );
};

