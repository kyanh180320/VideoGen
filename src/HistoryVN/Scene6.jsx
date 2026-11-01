import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Audio } from 'remotion';

const starCx = 960;
const starCy = 480;
const outerR = 250;
const innerR = 250 * 0.382;

const starVertices = [];
for (let i = 0; i < 10; i++) {
  const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 === 0 ? outerR : innerR;
  starVertices.push([starCx + Math.cos(angle) * r, starCy + Math.sin(angle) * r]);
}

export const Scene6 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // 0 to 5s
  const canvasRef = useRef(null);

  const opacity = interpolate(t, [4.7, 5.0], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(t, [2.0, 5.0], [1.0, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1920, 1080);

    // 0-1.2s: Tối dần về đen
    if (t < 1.2) {
      const darkP = t / 1.2;
      ctx.fillStyle = `rgba(0, 0, 0, ${darkP})`;
      ctx.fillRect(0, 0, 1920, 1080);
    } else if (t < 2.0) {
      // 1.2-2.0s: Bừng vầng sáng từ tâm
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1920, 1080);

      const glowP = (t - 1.2) / 0.8;
      const curR = glowP * 300;
      const glow = ctx.createRadialGradient(starCx, starCy, 0, starCx, starCy, curR);
      glow.addColorStop(0, '#FFCD00');
      glow.addColorStop(0.5, '#DA251D');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(starCx, starCy, curR, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2.5-4.0s: Ngôi sao vàng 5 cánh vẽ từng cạnh một, tô đầy lúc 4.0s
    if (t >= 2.5) {
      ctx.save();
      ctx.shadowColor = '#FFCD00';
      ctx.shadowBlur = 30;

      if (t < 4.0) {
        const drawP = (t - 2.5) / 1.5;
        const totalSegments = 10;
        const curSegmentIdx = Math.min(9, Math.floor(drawP * totalSegments));
        const segFrac = drawP * totalSegments - curSegmentIdx;

        ctx.strokeStyle = '#FFCD00';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(starVertices[0][0], starVertices[0][1]);
        for (let s = 1; s <= curSegmentIdx; s++) {
          ctx.lineTo(starVertices[s][0], starVertices[s][1]);
        }
        if (curSegmentIdx < 9 && segFrac > 0) {
          const pStart = starVertices[curSegmentIdx];
          const pEnd = starVertices[curSegmentIdx + 1];
          ctx.lineTo(pStart[0] + (pEnd[0] - pStart[0]) * segFrac, pStart[1] + (pEnd[1] - pStart[1]) * segFrac);
        }
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 205, 0, ${drawP * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(starVertices[0][0], starVertices[0][1]);
        for (let s = 1; s <= curSegmentIdx; s++) {
          ctx.lineTo(starVertices[s][0], starVertices[s][1]);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#FFCD00';
        ctx.strokeStyle = '#FFE270';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(starVertices[0][0], starVertices[0][1]);
        for (let s = 1; s < 10; s++) {
          ctx.lineTo(starVertices[s][0], starVertices[s][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [t]);

  const pText = interpolate(t, [4.0, 4.5], [0, 1], {
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
        backgroundColor: '#DA251D',
        opacity,
        overflow: 'hidden',
      }}
    >
      <Audio src={staticFile('audio/scene6.mp3')} />

      {/* Ảnh Quảng trường Ba Đình 1945 */}
      {t >= 2.0 && (
        <Img
          src={staticFile('images/scene6.jpg')}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
          }}
        />
      )}

      {/* Nền cờ đỏ Ba Đình */}
      {t >= 2.0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 45%, rgba(218, 37, 29, 0.70) 0%, rgba(218, 37, 29, 0.88) 60%, rgba(160, 20, 15, 0.96) 100%)',
          }}
        />
      )}

      {/* Typography: "2/9/1945" */}
      {t >= 4.0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 800,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: pText,
            fontFamily: '"Playfair Display", "Be Vietnam Pro", Georgia, serif',
            fontWeight: 900,
            fontSize: 120,
            color: '#FFCD00',
            textShadow: '0 6px 28px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          2/9/1945
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

