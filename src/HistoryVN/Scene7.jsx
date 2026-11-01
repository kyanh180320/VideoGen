import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Audio } from 'remotion';
import { VN_MAP_DATA } from './vietnamMapData';

const mapCenterBoxX = 660;
const mapCenterBoxY = 96;

const globalNetworkDots = [];
for (let g = 0; g < 36; g++) {
  globalNetworkDots.push({
    x: 100 + ((g * 179 + 83) % 1720),
    y: 100 + ((g * 131 + 47) % 800),
  });
}

const networkLines = [];
globalNetworkDots.forEach((d1, i) => {
  const distances = [];
  globalNetworkDots.forEach((d2, j) => {
    if (i !== j) {
      const dist = Math.hypot(d1.x - d2.x, d1.y - d2.y);
      distances.push({ dist, target: d2 });
    }
  });
  distances.sort((a, b) => a.dist - b.dist);
  for (let k = 0; k < Math.min(3, distances.length); k++) {
    networkLines.push([d1, distances[k].target]);
  }
});

export const Scene7 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // 0 to 5s
  const canvasRef = useRef(null);

  const scale = interpolate(t, [0, 5.0], [1.0, 1.08]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1920, 1080);

    // 3.0-4.3s: Zoom out bản đồ (1.0 -> 0.3)
    let zoomScale = 1.0;
    if (t >= 3.0) {
      const zoomP = Math.min(1, (t - 3.0) / 1.3);
      zoomScale = 1.0 - zoomP * 0.7;
    }

    ctx.save();
    ctx.translate(960, 540);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-960, -540);

    // 0-1s: 2 nửa bản đồ trượt vào giữa
    const slideP = Math.min(1, t / 1.0);
    const easeSlide = t < 1.0 ? 1 - Math.pow(1 - slideP, 3) : 1;
    const northOffsetX = (1 - easeSlide) * -700;
    const southOffsetX = (1 - easeSlide) * 700;

    if (VN_MAP_DATA) {
      // Nửa Bắc
      ctx.save();
      ctx.translate(mapCenterBoxX + northOffsetX, mapCenterBoxY);
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = 'rgba(242, 201, 76, 0.15)';

      const nPts = VN_MAP_DATA.mainlandPoints.filter(p => p[1] <= 412);
      ctx.beginPath();
      ctx.moveTo(nPts[0][0], nPts[0][1]);
      for (let i = 1; i < nPts.length; i++) {
        ctx.lineTo(nPts[i][0], nPts[i][1]);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();

      // Nửa Nam
      ctx.save();
      ctx.translate(mapCenterBoxX + southOffsetX, mapCenterBoxY);
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = 'rgba(242, 201, 76, 0.15)';

      const sPts = VN_MAP_DATA.mainlandPoints.filter(p => p[1] >= 408);
      ctx.beginPath();
      ctx.moveTo(sPts[0][0], sPts[0][1]);
      for (let i = 1; i < sPts.length; i++) {
        ctx.lineTo(sPts[i][0], sPts[i][1]);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();

      // 1.0-3.0s: 100 chấm sáng các thành phố
      if (t >= 1.0) {
        const dotProg = Math.min(1, (t - 1.0) / 2.0);
        const cityDots = VN_MAP_DATA.cityDots;
        const visibleCount = Math.floor(dotProg * cityDots.length);

        ctx.save();
        ctx.translate(mapCenterBoxX, mapCenterBoxY);
        ctx.shadowColor = '#F2C94C';
        ctx.shadowBlur = 12;

        for (let c = 0; c < visibleCount; c++) {
          const pt = cityDots[c];
          ctx.fillStyle = '#FFE066';
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 4, 0, Math.PI * 2);
          ctx.fill();

          if (c % 10 === 0) {
            ctx.fillStyle = 'rgba(242, 201, 76, 0.35)';
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], 10, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }

    ctx.restore();

    // 3.0-5.0s: Mạng lưới toàn cầu
    if (t >= 3.0) {
      const netProg = Math.min(1, (t - 3.0) / 1.0);
      ctx.save();
      ctx.globalAlpha = netProg;
      ctx.shadowColor = '#F2C94C';
      ctx.shadowBlur = 16;

      ctx.strokeStyle = 'rgba(242, 201, 76, 0.35)';
      ctx.lineWidth = 1.5;
      networkLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        ctx.lineTo(line[1].x, line[1].y);
        ctx.stroke();
      });

      globalNetworkDots.forEach(dot => {
        ctx.fillStyle = '#FFE066';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  }, [t]);

  const pTitle = interpolate(t, [3.5, 4.3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textScale = interpolate(t, [3.5, 4.3], [0.85, 1.0], {
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
        overflow: 'hidden',
      }}
    >
      <Audio src={staticFile('audio/scene7.mp3')} />

      <Img
        src={staticFile('images/scene7.jpg')}
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
            'radial-gradient(circle at 50% 45%, rgba(139, 26, 26, 0.40) 0%, rgba(110, 15, 15, 0.72) 70%, rgba(25, 4, 4, 0.92) 100%)',
        }}
      />

      {/* Typography: "VIỆT NAM" */}
      {t >= 3.5 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: pTitle,
            transform: `scale(${textScale})`,
            zIndex: 40,
          }}
        >
          <div
            style={{
              fontFamily: '"Playfair Display", "Be Vietnam Pro", Georgia, serif',
              fontWeight: 900,
              fontSize: 120,
              color: '#F2C94C',
              textShadow: '0 6px 35px rgba(0, 0, 0, 0.98), 0 2px 8px rgba(0,0,0,0.8)',
              letterSpacing: 4,
            }}
          >
            VIỆT NAM
          </div>
          <div
            style={{
              marginTop: 15,
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 600,
              fontSize: 32,
              color: '#FFFFFF',
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.9)',
              letterSpacing: 3,
            }}
          >
            ĐỘC LẬP • TỰ CƯỜNG • VƯƠN MÌNH RA THẾ GIỚI
          </div>
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

