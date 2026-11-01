import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Audio } from 'remotion';
import { VN_MAP_DATA } from './vietnamMapData';

const hanoiScreenX = 440;
const hanoiScreenY = 291;

const arrowConfigs = [{ impactT: 1.4 }, { impactT: 2.0 }, { impactT: 2.6 }];

function drawArrow(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.shadowColor = '#E63946';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = '#E63946';
  ctx.fillStyle = '#E63946';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(-50, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-18, -10);
  ctx.lineTo(-12, 0);
  ctx.lineTo(-18, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export const Scene4 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // 0 to 4s
  const canvasRef = useRef(null);

  const opacity = interpolate(t, [0, 0.3, 3.7, 4.0], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(t, [0, 4.0], [1.03, 1.11]);
  const panX = interpolate(t, [0, 4.0], [0, 25]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1920, 1080);

    // Zoom từ toàn quốc về Hà Nội (scale 1 -> 4)
    const zoomP = Math.min(1, t / 1.0);
    const curScale = 1.0 + zoomP * 3.0;

    ctx.save();
    ctx.translate(hanoiScreenX, hanoiScreenY);
    ctx.scale(curScale, curScale);
    ctx.translate(-hanoiScreenX, -hanoiScreenY);

    if (VN_MAP_DATA) {
      ctx.save();
      ctx.translate(160, 96);
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5 / curScale;
      ctx.fillStyle = 'rgba(242, 201, 76, 0.12)';

      const pts = VN_MAP_DATA.mainlandPoints;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // 1.0s: Hiện chấm vàng + khiên bán kính 150px
    if (t >= 1.0) {
      const shieldAlpha = Math.min(1, (t - 1.0) / 0.3);
      ctx.save();
      ctx.shadowColor = '#F2C94C';
      ctx.shadowBlur = 24;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(hanoiScreenX, hanoiScreenY, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(242, 201, 76, ${shieldAlpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(hanoiScreenX, hanoiScreenY, 150, -0.65 * Math.PI, 0.15 * Math.PI);
      ctx.stroke();

      const shieldGlow = ctx.createRadialGradient(hanoiScreenX, hanoiScreenY, 50, hanoiScreenX, hanoiScreenY, 150);
      shieldGlow.addColorStop(0, 'rgba(242, 201, 76, 0)');
      shieldGlow.addColorStop(1, `rgba(242, 201, 76, ${0.25 * shieldAlpha})`);
      ctx.fillStyle = shieldGlow;
      ctx.beginPath();
      ctx.arc(hanoiScreenX, hanoiScreenY, 150, -0.65 * Math.PI, 0.15 * Math.PI);
      ctx.lineTo(hanoiScreenX, hanoiScreenY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 3 Mũi Tên Đỏ và Va Chạm Bật Ngược
    const startArrowX = 1800;
    const startArrowY = 100;
    const attackAngle = Math.atan2(hanoiScreenY - startArrowY, hanoiScreenX - startArrowX);
    const hitX = hanoiScreenX + Math.cos(attackAngle) * 150;
    const hitY = hanoiScreenY + Math.sin(attackAngle) * 150;

    arrowConfigs.forEach(cfg => {
      const flyStartT = cfg.impactT - 0.3;
      const bounceEndT = cfg.impactT + 0.25;

      if (t >= flyStartT && t < cfg.impactT) {
        const flyP = (t - flyStartT) / 0.3;
        const curX = startArrowX + flyP * (hitX - startArrowX);
        const curY = startArrowY + flyP * (hitY - startArrowY);
        drawArrow(ctx, curX, curY, attackAngle);
      } else if (t >= cfg.impactT && t <= bounceEndT) {
        const bounceP = (t - cfg.impactT) / 0.25;
        const curX = hitX - Math.cos(attackAngle) * (bounceP * 180);
        const curY = hitY - Math.sin(attackAngle) * (bounceP * 180);
        const bounceAngle = attackAngle + Math.PI + bounceP * 0.4;
        drawArrow(ctx, curX, curY, bounceAngle);

        ctx.save();
        ctx.shadowColor = '#F2C94C';
        ctx.shadowBlur = 18;
        for (let sp = 0; sp < 8; sp++) {
          const spAngle = (sp / 8) * Math.PI * 2;
          const spDist = bounceP * 70;
          ctx.fillStyle = sp % 2 === 0 ? '#FFE066' : '#E63946';
          ctx.beginPath();
          ctx.arc(hitX + Math.cos(spAngle) * spDist, hitY + Math.sin(spAngle) * spDist, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });
  }, [t]);

  const textProg = interpolate(t, [1.2, 1.8], [0, 1], {
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
      <Audio src={staticFile('audio/scene4.mp3')} />

      <Img
        src={staticFile('images/scene4.jpg')}
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
            'radial-gradient(circle at 60% 45%, rgba(139, 26, 26, 0.38) 0%, rgba(110, 15, 15, 0.72) 70%, rgba(25, 4, 4, 0.92) 100%)',
        }}
      />

      {/* Typography: "Thăng Long 1010" */}
      {t >= 1.2 && (
        <div
          style={{
            position: 'absolute',
            left: 1100,
            top: 420,
            transform: 'translateY(-50%)',
            opacity: textProg,
            fontFamily: '"Playfair Display", "Be Vietnam Pro", Georgia, serif',
            fontWeight: 900,
            fontSize: 96,
            color: '#F2C94C',
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          Thăng Long 1010
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

