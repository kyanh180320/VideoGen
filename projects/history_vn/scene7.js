/**
 * ========================================================
 * CẢNH 7 (25–30s): THỐNG NHẤT NON SÔNG, MẠNG LƯỚI TOÀN CẦU & VIỆT NAM
 * Tích hợp Nghệ Thuật Điện Ảnh (Cinematic Art) & 2.5D Parallax Camera
 * ========================================================
 */
window.HistoryVN_Scene7 = (function() {
  const startTime = 25;
  const duration = 5;

  let bgImg = null;
  function getBgImage() {
    if (!bgImg && window.VN_IMAGE_ASSETS && window.VN_IMAGE_ASSETS.scene7) {
      bgImg = new Image();
      bgImg.src = window.VN_IMAGE_ASSETS.scene7;
    }
    return bgImg;
  }

  // Bản đồ ở GIỮA: x: 700–1220 (width 520px), y: 96–900 (height 800px)
  const mapCenterBoxX = 660;
  const mapCenterBoxY = 96;

  // Khởi tạo mạng lưới các chấm toàn cầu ngẫu nhiên (36 chấm)
  const globalNetworkDots = [];
  for (let g = 0; g < 36; g++) {
    globalNetworkDots.push({
      x: 100 + Math.random() * 1720,
      y: 100 + Math.random() * 800
    });
  }

  // Tìm 3 chấm gần nhất cho mỗi chấm
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

  function render(ctx, globalTime, W, H) {
    if (globalTime < startTime || globalTime > startTime + duration) return;
    const t = globalTime - startTime; // 0 to 5s (tương ứng 25-30s)

    // KHÔNG FADE OUT Ở CUỐI CẢNH 7
    ctx.save();

    // 1. NGHỆ THUẬT ĐIỆN ẢNH VIỆT NAM HIỆN ĐẠI 2.5D PARALLAX
    const img = getBgImage();
    const prog = t / duration;

    if (img && img.complete && img.naturalWidth > 0) {
      const scale = 1.0 + prog * 0.08;
      const panY = -15 * prog;

      ctx.save();
      ctx.translate(W / 2, H / 2 + panY);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -W / 2, -H / 2, W, H);
      ctx.restore();

      // Hòa sắc điện ảnh chuyển mình rực rỡ
      const grad = ctx.createRadialGradient(W / 2, H * 0.45, 300, W / 2, H / 2, 1100);
      grad.addColorStop(0, 'rgba(139, 26, 26, 0.40)');
      grad.addColorStop(0.7, 'rgba(110, 15, 15, 0.72)');
      grad.addColorStop(1, 'rgba(25, 4, 4, 0.92)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#8B1A1A';
      ctx.fillRect(0, 0, W, H);
    }

    // 28–29.3s (t: 3.0-4.3s): Zoom out, bản đồ thu nhỏ (scale 1→0.3)
    let zoomScale = 1.0;
    if (t >= 3.0) {
      const zoomP = Math.min(1, (t - 3.0) / 1.3);
      zoomScale = 1.0 - zoomP * 0.7; // 1.0 -> 0.3
    }

    // Tâm màn hình để zoom out
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-W / 2, -H / 2);

    // 25–26s (t: 0-1s): Bản đồ chia 2 nửa. Nửa Bắc trượt từ TRÁI, nửa Nam từ PHẢI, ghép khít ở giữa
    const slideP = Math.min(1, t / 1.0);
    const easeSlide = t < 1.0 ? 1 - Math.pow(1 - slideP, 3) : 1; // easeOutCubic

    const northOffsetX = (1 - easeSlide) * -700;
    const southOffsetX = (1 - easeSlide) * 700;

    if (window.VN_MAP_DATA) {
      // Nửa Bắc
      ctx.save();
      ctx.translate(mapCenterBoxX + northOffsetX, mapCenterBoxY);
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = 'rgba(242, 201, 76, 0.15)';

      const nPts = window.VN_MAP_DATA.mainlandPoints.filter(p => p[1] <= 412);
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

      const sPts = window.VN_MAP_DATA.mainlandPoints.filter(p => p[1] >= 408);
      ctx.beginPath();
      ctx.moveTo(sPts[0][0], sPts[0][1]);
      for (let i = 1; i < sPts.length; i++) {
        ctx.lineTo(sPts[i][0], sPts[i][1]);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();

      // 26–28s (t: 1.0-3.0s): 100 chấm sáng bật lên dọc theo dải đất hình chữ S
      if (t >= 1.0) {
        const dotProg = Math.min(1, (t - 1.0) / 2.0);
        const cityDots = window.VN_MAP_DATA.cityDots;
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

          // Lớp halo mờ quanh các thành phố lớn
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

    ctx.restore(); // Khôi phục scale của map zoom

    // 28–30s (t: 3.0-5.0s): Mạng lưới chấm sáng toàn màn hình + Chữ "VIỆT NAM"
    if (t >= 3.0) {
      const netProg = Math.min(1, (t - 3.0) / 1.0);

      ctx.save();
      ctx.globalAlpha = netProg;
      ctx.shadowColor = '#F2C94C';
      ctx.shadowBlur = 16;

      // Đường nối mạng lưới
      ctx.strokeStyle = 'rgba(242, 201, 76, 0.35)';
      ctx.lineWidth = 1.5;
      networkLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        ctx.lineTo(line[1].x, line[1].y);
        ctx.stroke();
      });

      // Các chấm nút mạng
      globalNetworkDots.forEach(dot => {
        ctx.fillStyle = '#FFE066';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // 28.5–30s (t: 3.5-5.0s): Chữ "VIỆT NAM" lớn ở giữa cuối cảnh
    if (t >= 3.5) {
      const textProg = Math.min(1, (t - 3.5) / 0.8);
      const textScale = 0.85 + textProg * 0.15; // 0.85 -> 1.0

      ctx.save();
      ctx.globalAlpha = textProg;
      ctx.translate(W / 2, H / 2);
      ctx.scale(textScale, textScale);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.98)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 6;

      ctx.fillStyle = '#F2C94C';
      ctx.font = '900 120px "Playfair Display", "Be Vietnam Pro", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("VIỆT NAM", 0, 0);

      // Phụ đề kiêu hãnh bên dưới
      ctx.font = '600 32px "Montserrat", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 16;
      ctx.fillText("ĐỘC LẬP • TỰ CƯỜNG • VƯƠN MÌNH RA THẾ GIỚI", 0, 90);

      ctx.restore();
    }

    ctx.restore();
  }

  // 25–30s: Thanh năm đếm 1975 → 1986 → 2026
  function getYearText(globalTime) {
    const t = Math.max(0, Math.min(5, globalTime - startTime));
    if (t < 2.0) {
      // 25-27s: 1975 -> 1986
      const p1 = t / 2.0;
      const y1 = 1975 + p1 * (1986 - 1975);
      return `${Math.round(y1)}`;
    } else {
      // 27-30s: 1986 -> 2026
      const p2 = (t - 2.0) / 3.0;
      const y2 = 1986 + p2 * (2026 - 1986);
      return `${Math.round(y2)}`;
    }
  }

  return { startTime, duration, render, getYearText };
})();
