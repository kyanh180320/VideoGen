import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Audio } from 'remotion';

const linkCount = 12;
const chainStartX = 200;
const chainEndX = 1720;
const stepX = (chainEndX - chainStartX) / (linkCount - 1);
const chainY = 480;

const particles = [];
for (let i = 0; i < linkCount; i++) {
  const lx = chainStartX + i * stepX;
  for (let k = 0; k < 8; k++) {
    const angle = (k / 8) * Math.PI * 2 + (i * 0.5);
    const spd = 4 + (k % 3) * 3;
    particles.push({
      origX: lx,
      origY: chainY,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 2,
      gravity: 0.18,
    });
  }
}

const flagConfigs = [
  { x: 600, startT: 2.3 },
  { x: 960, startT: 2.6 },
  { x: 1320, startT: 2.9 },
];

export const Scene2 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // 0 to 4s
  const canvasRef = useRef(null);

  const opacity = interpolate(t, [0, 0.3, 3.7, 4.0], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(t, [0, 4.0], [1.02, 1.12]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1920, 1080);

    // 0-1.8s: Chuỗi xích rung và lắc
    if (t < 1.8) {
      let shakeX = 0;
      if (t >= 1.0) {
        const shakeProg = (t - 1.0) / 0.8;
        const freq = 15 + shakeProg * 40;
        shakeX = Math.sin((t - 1.0) * freq) * 4 * shakeProg;
      }

      ctx.save();
      ctx.translate(shakeX, 0);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 4.5;

      for (let i = 0; i < linkCount; i++) {
        const appearT = i * 0.07;
        if (t >= appearT) {
          const lx = chainStartX + i * stepX;
          const isRotated = i % 2 === 1;

          ctx.save();
          ctx.translate(lx, chainY);
          ctx.beginPath();
          if (isRotated) {
            ctx.ellipse(0, 0, 16, 34, 0, 0, Math.PI * 2);
          } else {
            ctx.ellipse(0, 0, 34, 16, 0, 0, Math.PI * 2);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();
    } else {
      // 1.8-3.0s: Các hạt vỡ bay ra
      const shatterT = t - 1.8;
      if (shatterT < 1.2) {
        const pAlpha = Math.max(0, 1 - shatterT / 1.2);
        ctx.save();
        ctx.shadowColor = '#F2C94C';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FFE066';
        particles.forEach(p => {
          const px = p.origX + p.vx * (shatterT * 25);
          const py = p.origY + p.vy * (shatterT * 25) + 0.5 * p.gravity * Math.pow(shatterT * 25, 2);
          ctx.globalAlpha = pAlpha;
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
    }

    // 2.3s, 2.6s, 2.9s: Ba ngọn cờ mọc lên từ y=800 lên y=560
    flagConfigs.forEach(flag => {
      if (t >= flag.startT) {
        const flagProg = Math.min(1, (t - flag.startT) / 0.5);
        const curTopY = 800 - flagProg * (800 - 560);
        const waveTime = t * 6;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 14;

        // Cột cờ
        ctx.strokeStyle = '#F2C94C';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(flag.x, 800);
        ctx.lineTo(flag.x, curTopY);
        ctx.stroke();

        // Lá cờ tam giác phấp phới sóng sin
        if (flagProg > 0.3) {
          const flagScale = (flagProg - 0.3) / 0.7;
          const flagW = 110 * flagScale;
          const flagH = 70 * flagScale;
          const waveOffset1 = Math.sin(waveTime) * 8;
          const waveOffset2 = Math.cos(waveTime * 1.2) * 10;

          ctx.fillStyle = '#DA251D';
          ctx.strokeStyle = '#F2C94C';
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.moveTo(flag.x, curTopY);
          ctx.lineTo(flag.x + flagW + waveOffset1, curTopY + flagH / 2 + waveOffset2);
          ctx.lineTo(flag.x, curTopY + flagH);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    });
  }, [t]);

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
      <Audio src={staticFile('audio/scene2.mp3')} />

      <Img
        src={staticFile('images/scene2.jpg')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 45%, rgba(139, 26, 26, 0.35) 0%, rgba(110, 15, 15, 0.70) 70%, rgba(20, 2, 2, 0.92) 100%)',
        }}
      />

      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }}
      />
    </div>
  );
};

