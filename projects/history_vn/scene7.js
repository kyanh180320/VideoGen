/**
 * ========================================================
 * CẢNH 7 (25–30s): THỐNG NHẤT NON SÔNG, MẠNG LƯỚI TOÀN CẦU & VIỆT NAM
 * ========================================================
 */
window.HistoryVN_Scene7 = (function() {
  const startTime = 25;
  const duration = 5;

  // Bản đồ ở GIỮA: x: 700–1220 (width 520px), y: 96–900 (height 800px)
  // Scale chuẩn: 520 / 600 = ~0.866
  const mapCenterBoxX = 660;
  const mapCenterBoxY = 96;

  // Khởi tạo mạng lưới các chấm toàn cầu ngẫu nhiên (30 chấm)
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

    // Nền cố định #8B1A1A
    ctx.fillStyle = '#8B1A1A';
    ctx.fillRect(0, 0, W, H);

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
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = 'rgba(242, 201, 76, 0.12)';

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
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = 'rgba(242, 201, 76, 0.12)';

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

      // 25.8–26.5s: Một đường sáng chạy dọc vết ghép vĩ tuyến 17 (y = 410)
      if (t >= 0.8 && t <= 1.5) {
        const seamP = (t - 0.8) / 0.7;
        const seamX = mapCenterBoxX + 245 + seamP * (315 - 245);
        const seamY = mapCenterBoxY + 410;

        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(mapCenterBoxX + 245, seamY);
        ctx.lineTo(seamX, seamY);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(seamX, seamY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 26–27.5s (t: 1.0-2.5s): ~100 chấm sáng bật lên lần lượt từ Bắc xuống Nam cách nhau 0.015s
      // Hiệu ứng pop scale 0→1.5→1
      if (t >= 1.0) {
        const cityDots = window.VN_MAP_DATA.cityDots;
        ctx.save();
        ctx.translate(mapCenterBoxX, mapCenterBoxY);

        cityDots.forEach((dot, idx) => {
          const popStartTime = 1.0 + idx * 0.015;
          if (t >= popStartTime) {
            const dotAge = (t - popStartTime) / 0.2; // 0.2s duration
            let dotScale = 1.0;
            if (dotAge < 0.5) {
              dotScale = (dotAge / 0.5) * 1.5; // 0 -> 1.5
            } else if (dotAge < 1.0) {
              dotScale = 1.5 - ((dotAge - 0.5) / 0.5) * 0.5; // 1.5 -> 1.0
            }

            ctx.fillStyle = '#F2C94C';
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 3.5 * dotScale, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.restore();
      }
    }
    ctx.restore(); // Kết thúc scale zoom out của bản đồ

    // 28–29.3s (t >= 3.0s): Thêm các chấm ngẫu nhiên khắp khung hình,
    // mỗi chấm nối với 3 chấm gần nhất bằng đường mảnh, tạo mạng lưới toàn cầu
    if (t >= 3.0) {
      const netProg = Math.min(1, (t - 3.0) / 1.3);
      ctx.save();
      ctx.globalAlpha = netProg;

      // Các đường nối mảnh
      ctx.strokeStyle = 'rgba(242, 201, 76, 0.25)';
      ctx.lineWidth = 1;
      networkLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        ctx.lineTo(line[1].x, line[1].y);
        ctx.stroke();
      });

      // Các chấm sáng toàn cầu
      ctx.fillStyle = '#F2C94C';
      globalNetworkDots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 29–30s (t >= 4.0s): Chữ "VIỆT NAM" cỡ 160px hiện dần ở giữa, GIỮ NGUYÊN đến hết (không fade out)
    if (t >= 4.0) {
      const textProg = Math.min(1, (t - 4.0) / 0.8);
      ctx.save();
      ctx.globalAlpha = textProg;
      ctx.fillStyle = '#F2C94C';
      ctx.font = '900 160px "Playfair Display", "Be Vietnam Pro", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 20;
      ctx.fillText("VIỆT NAM", 960, 520);
      ctx.restore();
    }

    ctx.restore();
  }

  function getYearText(globalTime) {
    // "1975" (25s) → "1986" (26.5s) → chạy nhanh đến "2026" (28–29s)
    if (globalTime < 26.5) {
      return "1975";
    }
    if (globalTime < 28.0) {
      return "1986";
    }
    // Chạy từ 1986 đến 2026 trong 28-29s
    const p = Math.min(1, (globalTime - 28.0) / 1.0);
    const yr = Math.floor(1986 + p * (2026 - 1986));
    return `${yr}`;
  }

  return { startTime, duration, render, getYearText };
})();

