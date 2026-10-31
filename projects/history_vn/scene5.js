/**
 * ========================================================
 * CẢNH 5 (16–20s): MỞ CÕI PHƯƠNG NAM, LÊ LỢI & QUANG TRUNG
 * ========================================================
 */
window.HistoryVN_Scene5 = (function() {
  const startTime = 16;
  const duration = 4;

  // Vẽ ngôi sao 4 cánh
  function drawFourPointStar(ctx, cx, cy, size, scale, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#F2C94C';
    ctx.strokeStyle = '#F2C94C';
    ctx.lineWidth = 2;

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

  function render(ctx, globalTime, W, H) {
    if (globalTime < startTime || globalTime > startTime + duration) return;
    const t = globalTime - startTime; // 0 to 4s (tương ứng 16-20s)

    // Fade out 19.7-20s
    let alpha = 1;
    if (t > 3.7) alpha = Math.max(0, (4.0 - t) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Nền cố định #8B1A1A
    ctx.fillStyle = '#8B1A1A';
    ctx.fillRect(0, 0, W, H);

    // Bản đồ bên PHẢI (x 1100–1700, y 96–900)
    const mapBoxX = 1100;
    const mapBoxY = 96;

    if (window.VN_MAP_DATA) {
      const pts = window.VN_MAP_DATA.mainlandPoints;

      ctx.save();
      ctx.translate(mapBoxX, mapBoxY);

      // Đường viền bản đồ nét vàng
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.closePath();
      ctx.stroke();

      // clipPath mở dần từ trên xuống 3 đợt (H = 800)
      // Đợt 1: 16.3–17.3s (t: 0.3-1.3s) phần Bắc (y: 0 -> 300), tô vàng opacity 0.2
      // Đợt 2: 17.3–18.3s (t: 1.3-2.3s) phần Trung (y: 300 -> 550), tô vàng opacity 0.35
      // Đợt 3: 18.3–19.3s (t: 2.3-3.3s) phần Nam (y: 550 -> 800), tô vàng opacity 0.5
      let clipMaxY = 0;
      let fillAlpha = 0.2;

      if (t >= 0.3 && t < 1.3) {
        const p1 = (t - 0.3) / 1.0;
        clipMaxY = p1 * 300;
        fillAlpha = 0.2;
      } else if (t >= 1.3 && t < 2.3) {
        const p2 = (t - 1.3) / 1.0;
        clipMaxY = 300 + p2 * 250;
        fillAlpha = 0.35;
      } else if (t >= 2.3) {
        const p3 = Math.min(1, (t - 2.3) / 1.0);
        clipMaxY = 550 + p3 * 250;
        fillAlpha = 0.5;
      }

      if (clipMaxY > 0) {
        ctx.save();
        // Cắt theo đường viền bản đồ
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.closePath();
        ctx.clip();

        // Tô màu vàng theo chiều dọc clipMaxY
        ctx.fillStyle = `rgba(242, 201, 76, ${fillAlpha})`;
        ctx.fillRect(0, 0, 600, clipMaxY);
        ctx.restore();
      }

      ctx.restore();
    }

    // Hai ngôi sao lấp lánh liên tục (scale 1↔1.3, xoay 15°)
    const starCycle = Math.sin(globalTime * 6);
    const starScale = 1.0 + Math.abs(starCycle) * 0.3; // 1 -> 1.3
    const starAngle = (starCycle * 15) * Math.PI / 180; // ±15°

    // 16.5s (t >= 0.5s): Tên "Lê Lợi 1428" bên TRÁI (x=160, y=380) cỡ 72px kèm ngôi sao
    if (t >= 0.5) {
      const textP1 = Math.min(1, (t - 0.5) / 0.5);
      ctx.save();
      ctx.globalAlpha = alpha * textP1;
      ctx.fillStyle = '#F2C94C';
      ctx.font = '900 72px "Playfair Display", "Be Vietnam Pro", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText("Lê Lợi 1428", 160, 380);

      // Ngôi sao 4 cánh bên cạnh (x = 640, y = 380)
      drawFourPointStar(ctx, 640, 380, 24, starScale, starAngle);
      ctx.restore();
    }

    // 18s (t >= 2.0s): Tên "Quang Trung 1789" bên TRÁI (x=160, y=640) cỡ 72px kèm ngôi sao
    if (t >= 2.0) {
      const textP2 = Math.min(1, (t - 2.0) / 0.5);
      ctx.save();
      ctx.globalAlpha = alpha * textP2;
      ctx.fillStyle = '#F2C94C';
      ctx.font = '900 72px "Playfair Display", "Be Vietnam Pro", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText("Quang Trung 1789", 160, 640);

      // Ngôi sao 4 cánh bên cạnh (x = 840, y = 640)
      drawFourPointStar(ctx, 840, 640, 24, starScale, -starAngle);
      ctx.restore();
    }

    ctx.restore();
  }

  function getYearText(globalTime) {
    // 16–20s: đếm 1428 → 1789
    const t = Math.max(0, Math.min(1, (globalTime - 16) / 4));
    const yearVal = Math.floor(1428 + t * (1789 - 1428));
    return `${yearVal}`;
  }

  return { startTime, duration, render, getYearText };
})();

