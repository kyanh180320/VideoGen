/**
 * ========================================================
 * CẢNH 6 (20–25s): CỜ ĐỎ SAO VÀNG TOÀN MÀN HÌNH & 2/9/1945
 * Cảnh DUY NHẤT dùng toàn màn hình
 * Tích hợp Nghệ Thuật Điện Ảnh (Cinematic Art) & 2.5D Parallax Camera
 * ========================================================
 */
window.HistoryVN_Scene6 = (function() {
  const startTime = 20;
  const duration = 5;

  let bgImg = null;
  function getBgImage() {
    if (!bgImg && window.VN_IMAGE_ASSETS && window.VN_IMAGE_ASSETS.scene6) {
      bgImg = new Image();
      bgImg.src = window.VN_IMAGE_ASSETS.scene6;
    }
    return bgImg;
  }

  // Tính toán 10 đỉnh của ngôi sao 5 cánh (tâm 960, 480, cao ~480px, R = 250)
  const starCx = 960;
  const starCy = 480;
  const outerR = 250;
  const innerR = 250 * 0.382;

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
        // Vẽ bức tranh nghệ thuật Quảng trường Ba Đình lịch sử phía sau
        const img = getBgImage();
        if (img && img.complete && img.naturalWidth > 0) {
          const prog = (t - 2.0) / 3.0; // 0 -> 1
          const scale = 1.0 + prog * 0.08;
          ctx.save();
          ctx.translate(W / 2, H / 2);
          ctx.scale(scale, scale);
          ctx.drawImage(img, -W / 2, -H / 2, W, H);
          ctx.restore();

          // Phủ hòa sắc cờ đỏ sao vàng đậm nét điện ảnh
          const flagGrad = ctx.createRadialGradient(starCx, starCy, 150, starCx, starCy, 1000);
          flagGrad.addColorStop(0, 'rgba(218, 37, 29, 0.70)');
          flagGrad.addColorStop(0.6, 'rgba(218, 37, 29, 0.88)');
          flagGrad.addColorStop(1, 'rgba(160, 20, 15, 0.96)');
          ctx.fillStyle = flagGrad;
          ctx.fillRect(0, 0, W, H);
        } else {
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
            ctx.fillStyle = '#DA251D';
            ctx.fillRect(0, 0, W, H);
          }
        }

        // 22.5–24s (t: 2.5-4.0s): Ngôi sao vàng 5 cánh vẽ từng cạnh một; đến 24s tô đầy #FFCD00
        if (t >= 2.5) {
          ctx.save();
          ctx.shadowColor = '#FFCD00';
          ctx.shadowBlur = 30;

          if (t < 4.0) {
            // Đang vẽ từng cạnh một bằng stroke (10 đoạn cạnh)
            const drawP = (t - 2.5) / 1.5; // 0 -> 1
            const totalSegments = 10;
            const curSegmentIdx = Math.min(9, Math.floor(drawP * totalSegments));
            const segFrac = (drawP * totalSegments) - curSegmentIdx;

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
              ctx.lineTo(
                pStart[0] + (pEnd[0] - pStart[0]) * segFrac,
                pStart[1] + (pEnd[1] - pStart[1]) * segFrac
              );
            }
            ctx.stroke();

            // Tô nền sáng nhẹ bên trong khi đang vẽ
            ctx.fillStyle = `rgba(255, 205, 0, ${drawP * 0.5})`;
            ctx.beginPath();
            ctx.moveTo(starVertices[0][0], starVertices[0][1]);
            for (let s = 1; s <= curSegmentIdx; s++) {
              ctx.lineTo(starVertices[s][0], starVertices[s][1]);
            }
            ctx.closePath();
            ctx.fill();
          } else {
            // Đã vẽ xong (t >= 4.0s, tương ứng 24-25s): Tô đầy #FFCD00
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

        // 24–24.5s (t: 4.0-4.5s): Chữ "2/9/1945" hiện dần cỡ 120px dưới ngôi sao (y=800)
        if (t >= 4.0) {
          const textP = Math.min(1, (t - 4.0) / 0.5);
          ctx.save();
          ctx.globalAlpha = alpha * textP;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          ctx.shadowBlur = 28;
          ctx.shadowOffsetY = 6;
          ctx.fillStyle = '#FFCD00';
          ctx.font = '900 120px "Playfair Display", "Be Vietnam Pro", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText("2/9/1945", 960, 800);
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }

  // 20–25s: Thanh năm nhảy thẳng tới "1945" lúc 22s (hiệu ứng bật scale 1.3→1)
  function getYearText(globalTime) {
    if (globalTime < 22) return "";
    return "1945";
  }

  return { startTime, duration, render, getYearText };
})();
