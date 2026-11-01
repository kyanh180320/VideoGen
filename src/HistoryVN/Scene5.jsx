import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Audio } from 'remotion';
import { VN_MAP_DATA } from './vietnamMapData';

function drawFourPointStar(ctx, cx, cy, size, scale, angle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.shadowColor = '#F2C94C';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#FFE066';
  ctx.strokeStyle = '#F2C94C';
  ctx.lineWidth = 2.5;

  const rOuter = size;
  const rInner = size * 0.28;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const aMid = a + Math.PI / 4;
    if (i === 0) ctx.moveTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
    else ctx.lineTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
    ctx.lineTo(Math.cos(aMid) * rInner, Math.sin(aMid) * rInner);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export const Scene5 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // 0 to 4s
  const canvasRef = useRef(null);

  const opacity = interpolate(t, [0, 0.3, 3.7, 4.0], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(t, [0, 4.0], [1.02, 1.10]);
  const panX = interpolate(t, [0, 4.0], [0, -30]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1920, 1080);

    const mapBoxX = 1100;
    const mapBoxY = 96;

    if (VN_MAP_DATA) {
      const pts = VN_MAP_DATA.mainlandPoints;

      ctx.save();
      ctx.translate(mapBoxX, mapBoxY);
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 12;

      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.closePath();
      ctx.stroke();

      let clipMaxY = 0;
      let fillAlpha = 0.2;

      if (t >= 0.3 && t < 1.3) {
        const p1 = (t - 0.3) / 1.0;
        clipMaxY = p1 * 300;
        fillAlpha = 0.25;
      } else if (t >= 1.3 && t < 2.3) {
        const p2 = (t - 1.3) / 1.0;
        clipMaxY = 300 + p2 * 250;
        fillAlpha = 0.4;
      } else if (t >= 2.3) {
        const p3 = Math.min(1, (t - 2.3) / 1.0);
        clipMaxY = 550 + p3 * 250;
        fillAlpha = 0.55;
      }

      if (clipMaxY > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = `rgba(242, 201, 76, ${fillAlpha})`;
        ctx.fillRect(-50, -50, 700, clipMaxY + 50);

        ctx.strokeStyle = '#FFE066';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-50, clipMaxY);
        ctx.lineTo(650, clipMaxY);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }

    const starCycle = Math.sin(t * 5);
    const starScale = 1.0 + (starCycle + 1) * 0.15;
    const starAngle = Math.sin(t * 3) * (15 * Math.PI / 180);

    if (t >= 0.5) {
      drawFourPointStar(ctx, 620, 380, 24, starScale, starAngle);
    }
    if (t >= 2.0) {
      drawFourPointStar(ctx, 770, 640, 24, starScale, -starAngle);
    }
  }, [t]);

  const pLeLoi = interpolate(t, [0.5, 1.0], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pQuangTrung = interpolate(t, [2.0, 2.5], [0, 1], {
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
      <Audio src={staticFile('audio/scene5.mp3')} />

      <Img
        src={staticFile('images/scene5.jpg')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateX(${panX}px)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 35% 50%, rgba(139, 26, 26, 0.35) 0%, rgba(110, 15, 15, 0.70) 70%, rgba(25, 4, 4, 0.92) 100%)',
        }}
      />

      {/* Typography: "Lê Lợi 1428" */}
      {t >= 0.5 && (
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 380,
            transform: 'translateY(-50%)',
            opacity: pLeLoi,
            fontFamily: '"Playfair Display", "Be Vietnam Pro", Georgia, serif',
            fontWeight: 900,
            fontSize: 72,
            color: '#F2C94C',
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          Lê Lợi 1428
        </div>
      )}

      {/* Typography: "Quang Trung 1789" */}
      {t >= 2.0 && (
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 640,
            transform: 'translateY(-50%)',
            opacity: pQuangTrung,
            fontFamily: '"Playfair Display", "Be Vietnam Pro", Georgia, serif',
            fontWeight: 900,
            fontSize: 72,
            color: '#F2C94C',
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          Quang Trung 1789
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }}
      />
    </div>
  );
};

