import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Audio } from 'remotion';
import { VN_MAP_DATA } from './vietnamMapData';

export const Scene1 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // 0 to 4s
  const canvasRef = useRef(null);

  // Fade in 0-0.3s, Fade out 3.7-4s
  const opacity = interpolate(
    t,
    [0, 0.3, 3.7, 4.0],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 2.5D Ken Burns Camera Pan & Zoom
  const scale = interpolate(t, [0, 4.0], [1.0, 1.08]);
  const panX = interpolate(t, [0, 4.0], [0, -25]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1920, 1080);

    const mapBoxX = 1100;
    const mapBoxY = 96;

    // 0.3–1.5s đường viền VN tự vẽ
    const strokeProg = t < 0.3 ? 0 : (t >= 1.5 ? 1 : (t - 0.3) / 1.2);
    if (strokeProg > 0 && VN_MAP_DATA) {
      const pts = VN_MAP_DATA.mainlandPoints;
      const count = Math.max(2, Math.floor(strokeProg * pts.length));

      ctx.save();
      ctx.translate(mapBoxX, mapBoxY);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < count; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      if (strokeProg >= 1) ctx.closePath();
      ctx.stroke();

      if (strokeProg >= 1) {
        ctx.fillStyle = 'rgba(242, 201, 76, 0.12)';
        ctx.fill();
      }
      ctx.restore();
    }

    // 1.2–2.8s: Sông Hồng chạy từ trên xuống
    if (t >= 1.2 && VN_MAP_DATA) {
      const riverProg = t >= 2.8 ? 1 : (t - 1.2) / 1.6;
      const rPts = VN_MAP_DATA.redRiverPoints;
      const maxIdx = Math.min(rPts.length - 1, Math.floor(riverProg * (rPts.length - 1)));
      const frac = (riverProg * (rPts.length - 1)) - maxIdx;

      ctx.save();
      ctx.translate(mapBoxX, mapBoxY);
      ctx.shadowColor = 'rgba(242, 201, 76, 0.8)';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#FFE066';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(rPts[0][0], rPts[0][1]);
      for (let i = 1; i <= maxIdx; i++) {
        ctx.lineTo(rPts[i][0], rPts[i][1]);
      }
      if (maxIdx < rPts.length - 1 && frac > 0) {
        const nextP = rPts[maxIdx + 1];
        const curP = rPts[maxIdx];
        ctx.lineTo(curP[0] + (nextP[0] - curP[0]) * frac, curP[1] + (nextP[1] - curP[1]) * frac);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 2.5–3.5s: Chấm sáng tại Phú Thọ nở 3 vòng tròn đồng tâm
    if (t >= 2.5 && t <= 3.5 && VN_MAP_DATA) {
      const ptTime = t - 2.5;
      const ptCoords = VN_MAP_DATA.landmarks.phuTho;
      const cx = mapBoxX + ptCoords.x;
      const cy = mapBoxY + ptCoords.y;

      ctx.save();
      ctx.shadowColor = '#F2C94C';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      [0, 0.2, 0.4].forEach(delay => {
        const rippleT = ptTime - delay;
        if (rippleT >= 0 && rippleT <= 0.6) {
          const rP = rippleT / 0.6;
          const r = rP * 60;
          ctx.strokeStyle = `rgba(242, 201, 76, ${1 - rP})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ctx.restore();
    }
  }, [t]);

  // Chữ "Văn Lang" 96px trượt từ x=100 -> 160 trong 1.5–3s
  const textX = interpolate(t, [1.5, 3.0], [100, 160], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textOpacity = interpolate(t, [1.5, 3.0], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: 1920,
        height: 1080,
        backgroundColor: '#8B1A1A',
        opacity,
        overflow: 'hidden',
      }}
    >
      <Audio src={staticFile('audio/scene1.mp3')} />

      {/* Concept Art Background với Ken Burns Parallax */}
      <Img
        src={staticFile('images/scene1.jpg')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateX(${panX}px)`,
        }}
      />

      {/* Lớp hòa sắc lịch sử #8B1A1A & Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 40% 50%, rgba(139, 26, 26, 0.40) 0%, rgba(139, 26, 26, 0.72) 70%, rgba(25, 4, 4, 0.92) 100%)',
        }}
      />

      {/* Typography: "Văn Lang" */}
      {t >= 1.5 && (
        <div
          style={{
            position: 'absolute',
            left: textX,
            top: 540,
            transform: 'translateY(-50%)',
            opacity: textOpacity,
            fontFamily: '"Playfair Display", "Be Vietnam Pro", Georgia, serif',
            fontWeight: 900,
            fontSize: 96,
            color: '#F2C94C',
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          Văn Lang
        </div>
      )}

      {/* Canvas vẽ Map Sông Hồng & Phú Thọ */}
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }}
      />
    </div>
  );
};

