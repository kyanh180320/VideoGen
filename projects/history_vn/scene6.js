/**
 * ========================================================
 * CẢNH 6 (20–25s): CỜ ĐỎ SAO VÀNG TOÀN MÀN HÌNH & 2/9/1945
 * Cảnh DUY NHẤT dùng toàn màn hình
 * ========================================================
 */
window.HistoryVN_Scene6 = (function() {
  const startTime = 20;
  const duration = 5;

  // Tính toán 5 đỉnh của ngôi sao 5 cánh (tâm 960, 480, cao ~480px, R = 250)
  const starCx = 960;
  const starCy = 480;
  const outerR = 250;
  const innerR = 250 * 0.382;

  // 10 đỉnh luân phiên (5 đỉnh ngoài, 5 đỉnh trong)
  const starVertices = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = (i % 2 === 0) ? outerR : innerR;
    starVertices.push([
      starCx + Math.cos(angle) * r,
      starCy + Math.sin(angle) * r
    ]);
  }

  function render(ctx, globalTime, W, H) {
    if (globalTime < startTime || globalTime > startTime + duration) return;
    const t = globalTime - startTime; // 0 to 5s (tương ứng 20-25s)

    // Fade out 24.7-25s
    let alpha = 1;
    if (t > 4.7) alpha = Math.max(0, (5.0 - t) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // 20–21.2s (t: 0-1.2s): Màn hình tối dần về đen #000
    if (t < 1.2) {
      const darkP = t / 1.2;
      ctx.fillStyle = '#8B1A1A';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `rgba(0, 0, 0, ${darkP})`;
      ctx.fillRect(0, 0, W, H);
    } else {
      // Đã đen hoàn toàn
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      // 21.2–22s (t: 1.2-2.0s): Tâm (960, 480) bừng vầng sáng radial gradient, bán kính 0→300
      if (t >= 1.2 && t < 2.0) {
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

      // 22–23.2s (t: 2.0-3.2s): Vầng sáng lan thành nền cờ đỏ #DA251D phủ kín khung hình
      if (t >= 2.0) {
        if (t < 3.2) {
          const fillP = (t - 2.0) / 1.2;
          const maxR = 1500 * fillP;
          const redSpread = ctx.createRadialGradient(starCx, starCy, 0, starCx, starCy, maxR);
          redSpread.addColorStop(0, '#DA251D');
          redSpread.addColorStop(0.85, '#DA251D');
          redSpread.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = redSpread;
          ctx.beginPath();
          ctx.arc(starCx, starCy, maxR, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Phủ kín nền đỏ #DA251D
          ctx.fillStyle = '#DA251D';
          ctx.fillRect(0, 0, W, H);
        }
      }

      // 22.5–24s (t: 2.5-4.0s): Ngôi sao vàng 5 cánh vẽ từng cạnh một (stroke-dashoffset simulation)
      // Đến 24s (t >= 4.0s) tô đầy #FFCD00
      if (t >= 2.5) {
        const starDrawP = Math.min(1, (t - 2.5) / 1.5);
        ctx.save();
        ctx.strokeStyle = '#FFCD00';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'miter';

        const totalSegments = starVertices.length;
        const currentSegments = starDrawP * totalSegments;
        const fullSegCount = Math.floor(currentSegments);
        const frac = currentSegments - fullSegCount;

        ctx.beginPath();
        ctx.moveTo(starVertices[0][0], starVertices[0][1]);
        for (let s = 1; s <= fullSegCount && s < totalSegments; s++) {
          ctx.lineTo(starVertices[s][0], starVertices[s][1]);
        }
        if (fullSegCount < totalSegments && frac > 0) {
          const fromP = starVertices[fullSegCount];
          const toP = starVertices[(fullSegCount + 1) % totalSegments];
          ctx.lineTo(fromP[0] + (toP[0] - fromP[0]) * frac, fromP[1] + (toP[1] - fromP[1]) * frac);
        }
        if (starDrawP >= 1) {
          ctx.closePath();
          // Đến 24s tô đầy #FFCD00
          ctx.fillStyle = '#FFCD00';
          ctx.fill();
        }
        ctx.stroke();
        ctx.restore();
      }

      // 24–24.5s (t >= 4.0s): Chữ "2/9/1945" cỡ 120px hiện dần dưới ngôi sao (y=800)
      if (t >= 4.0) {
        const textProg = Math.min(1, (t - 4.0) / 0.5);
        ctx.save();
        ctx.globalAlpha = alpha * textProg;
        ctx.fillStyle = '#FFCD00';
        ctx.font = '900 120px "Playfair Display", "Be Vietnam Pro", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 16;
        ctx.fillText("2/9/1945", 960, 800);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  function getYearText(globalTime) {
    // Nhảy thẳng tới "1945" lúc 22s (hiệu ứng bật scale 1.3→1)
    if (globalTime < 22) return "";
    return "1945";
  }

  function getYearScale(globalTime) {
    // Hiệu ứng bật scale 1.3 -> 1 lúc 22s
    if (globalTime >= 22 && globalTime <= 22.4) {
      const p = (globalTime - 22) / 0.4;
      return 1.3 - p * 0.3;
    }
    return 1.0;
  }

  return { startTime, duration, render, getYearText, getYearScale };
})();

