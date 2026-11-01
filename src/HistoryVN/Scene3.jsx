import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Audio } from 'remotion';

const stakeCount = 9;
const stakeStartX = 700;
const stakeEndX = 1500;
const stakeStep = (stakeEndX - stakeStartX) / (stakeCount - 1);
const stakes = [];
for (let i = 0; i < stakeCount; i++) {
  stakes.push({
    x: stakeStartX + i * stakeStep,
    h: 240 + (i % 3) * 50,
    tilt: i % 2 === 0 ? 0.06 : -0.05,
    startT: 0.5 + i * 0.08,
  });
}

const boatConfigs = [
  { startX: -200, targetX: 680, w: 140, h: 45, y: 640 },
  { startX: -360, targetX: 840, w: 160, h: 50, y: 720 },
  { startX: -520, targetX: 1020, w: 150, h: 48, y: 800 },
];

export const Scene3 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // 0 to 4s
  const canvasRef = useRef(null);

  const opacity = interpolate(t, [0, 0.3, 3.7, 4.0], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(t, [0, 4.0], [1.05, 1.11]);
  const panX = interpolate(t, [0, 4.0], [20, -20]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1920, 1080);

    // 0.5-1.3s: 9 cọc nhọn nhô lên
    stakes.forEach(s => {
      if (t >= s.startT) {
        const riseProg = Math.min(1, (t - s.startT) / 0.4);
        const curH = s.h * riseProg;

        ctx.save();
        ctx.translate(s.x, 820);
        ctx.rotate(s.tilt);
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 12;

        ctx.fillStyle = '#F2C94C';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(18, 0);
        ctx.lineTo(0, -curH);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FFF2B2';
        ctx.beginPath();
        ctx.moveTo(-6, -curH + 45);
        ctx.lineTo(6, -curH + 45);
        ctx.lineTo(0, -curH);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    });

    // 1.0-2.8s: 3 thuyền chạy và va chạm nghiêng 8 độ
    boatConfigs.forEach(b => {
      if (t >= 1.0) {
        let curX;
        let tiltAngle = 0;

        if (t < 2.3) {
          const runP = (t - 1.0) / 1.3;
          curX = b.startX + runP * (b.targetX - b.startX);
        } else if (t < 2.8) {
          curX = b.targetX;
          const tiltP = (t - 2.3) / 0.5;
          tiltAngle = (8 * Math.PI / 180) * Math.sin(tiltP * Math.PI / 2);
        } else {
          curX = b.targetX;
          tiltAngle = 8 * Math.PI / 180;
        }

        ctx.save();
        ctx.translate(curX + b.w / 2, b.y + b.h / 2);
        ctx.rotate(tiltAngle);
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 12;

        ctx.strokeStyle = '#F2C94C';
        ctx.fillStyle = 'rgba(242, 201, 76, 0.45)';
        ctx.lineWidth = 3.5;

        ctx.beginPath();
        ctx.moveTo(-b.w / 2, -b.h / 2);
        ctx.lineTo(b.w / 2, -b.h / 2);
        ctx.lineTo(b.w / 2 - 25, b.h / 2);
        ctx.lineTo(-b.w / 2 + 25, b.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -b.h / 2);
        ctx.lineTo(0, -b.h / 2 - 50);
        ctx.lineTo(35, -b.h / 2 - 20);
        ctx.closePath();
        ctx.fillStyle = 'rgba(242, 201, 76, 0.7)';
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    });

    // 3 Lớp Sóng Nước Sin
    const waveLayers = [
      { amp: 20, freq: 0.005, speed: 3.5, yBase: 650, color: 'rgba(242, 201, 76, 0.15)' },
      { amp: 30, freq: 0.004, speed: 2.2, yBase: 730, color: 'rgba(242, 201, 76, 0.28)' },
      { amp: 40, freq: 0.003, speed: 1.5, yBase: 820, color: 'rgba(242, 201, 76, 0.45)' },
    ];

    waveLayers.forEach(w => {
      ctx.save();
      ctx.fillStyle = w.color;
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 1080);
      ctx.lineTo(0, w.yBase);

      for (let x = 0; x <= 1920; x += 30) {
        const wy = w.yBase + Math.sin(x * w.freq + t * w.speed) * w.amp;
        ctx.lineTo(x, wy);
      }
      ctx.lineTo(1920, 1080);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // 3.0-4.0s: Vòng sáng vàng loang ra từ giữa màn hình (960, 540)
    if (t >= 3.0) {
      const shockProg = t - 3.0;
      const curR = shockProg * 1000;
      const shockAlpha = 1 - shockProg;

      ctx.save();
      ctx.shadowColor = '#F2C94C';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = `rgba(242, 201, 76, ${shockAlpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(960, 540, curR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }, [t]);

  const textAlpha = interpolate(t, [0, 0.5], [0, 1], {
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
      <Audio src={staticFile('audio/scene3.mp3')} />

      <Img
        src={staticFile('images/scene3.jpg')}
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
            'radial-gradient(circle at 50% 35%, rgba(139, 26, 26, 0.32) 0%, rgba(120, 20, 20, 0.65) 70%, rgba(25, 4, 4, 0.90) 100%)',
        }}
      />

      {/* Typography: "Bạch Đằng 938" */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: textAlpha,
          fontFamily: '"Playfair Display", "Be Vietnam Pro", Georgia, serif',
          fontWeight: 900,
          fontSize: 96,
          color: '#F2C94C',
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0,0,0,0.8)',
        }}
      >
        Bạch Đằng 938
      </div>

      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }}
      />
    </div>
  );
};

