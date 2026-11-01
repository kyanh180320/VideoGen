/**
 * ========================================================
 * CẢNH 5 (16–20s): MỞ CÕI PHƯƠNG NAM, LÊ LỢI & QUANG TRUNG
 * Tích hợp Nghệ Thuật Điện Ảnh (Cinematic Art) & 2.5D Parallax Camera
 * ========================================================
 */
window.HistoryVN_Scene5 = (function() {
  const startTime = 16;
  const duration = 4;

  let bgImg = null;
  function getBgImage() {
    if (!bgImg && window.VN_IMAGE_ASSETS && window.VN_IMAGE_ASSETS.scene5) {
      bgImg = new Image();
      bgImg.src = window.VN_IMAGE_ASSETS.scene5;
    }
    return bgImg;
  }

  // Vẽ ngôi sao 4 cánh
  function drawFourPointStar(ctx, cx, cy, size, scale, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    ctx.shadowColor = '#F2C94C';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#FFE066';
    ctx.strokeStyle = '#F2C94C';
    ctx.lineWidth = 2.5;

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

    // Fade in 0-0.3s, Fade out 19.7-20s
    let alpha = 1;
    if (t < 0.3) alpha = t / 0.3;
    else if (t > 3.7) alpha = Math.max(0, (4.0 - t) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. NGHỆ THUẬT ĐIỆN ẢNH ĐOÀN QUÂN MỞ CÕI 2.5D PARALLAX
    const img = getBgImage();
    const prog = t / duration;

    if (img && img.complete && img.naturalWidth > 0) {
      const scale = 1.02 + prog * 0.08;
      const panX = -30 * prog; // Lia sang trái đón đoàn quân
      const panY = -8 * prog;

      ctx.save();
      ctx.translate(W / 2 + panX, H / 2 + panY);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -W / 2, -H / 2, W, H);
      ctx.restore();

      // Hòa sắc vàng hoàng hôn kiêu hùng
      const grad = ctx.createRadialGradient(W * 0.35, H * 0.5, 250, W / 2, H / 2, 1100);
      grad.addColorStop(0, 'rgba(139, 26, 26, 0.35)');
      grad.addColorStop(0.7, 'rgba(110, 15, 15, 0.70)');
      grad.addColorStop(1, 'rgba(25, 4, 4, 0.92)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#8B1A1A';
      ctx.fillRect(0, 0, W, H);
    }

    // Bản đồ bên PHẢI (x 1100–1700, y 96–900)
    const mapBoxX = 1100;
    const mapBoxY = 96;

    if (window.VN_MAP_DATA) {
      const pts = window.VN_MAP_DATA.mainlandPoints;

      ctx.save();
      ctx.translate(mapBoxX, mapBoxY);
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 12;

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
        fillAlpha = 0.25;
      } else if (t >= 1.3 && t < 2.3) {
        const p2 = (t - 1.3) / 1.0;
        clipMaxY = 300 + p2 * 250;
        fillAlpha = 0.40;
      } else if (t >= 2.3) {
        const p3 = Math.min(1, (t - 2.3) / 1.0);
        clipMaxY = 550 + p3 * 250;
        fillAlpha = 0.55;
      }

      if (clipMaxY > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.closePath();
        ctx.clip();

        // Tô vàng đậm dần theo độ sâu clipMaxY
        ctx.fillStyle = `rgba(242, 201, 76, ${fillAlpha})`;
        ctx.fillRect(-50, -50, 700, clipMaxY + 50);

        // Vạch sáng quét qua ranh giới mở rộng
        ctx.strokeStyle = '#FFE066';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-50, clipMaxY);
        ctx.lineTo(650, clipMaxY);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }

    // Hai ngôi sao lấp lánh liên tục (scale 1↔1.3, xoay 15°)
    const starCycle = Math.sin(t * 5);
    const starScale = 1.0 + (starCycle + 1) * 0.15; // 1.0 -> 1.3
    const starAngle = Math.sin(t * 3) * (15 * Math.PI / 180);

    // 16.5s (t >= 0.5s): Tên "Lê Lợi 1428" bên TRÁI (x=160, y=380) cỡ 72px + ngôi sao 4 cánh
    if (t >= 0.5) {
      const pLeroi = Math.min(1, (t - 0.5) / 0.5);
      ctx.save();
      ctx.globalAlpha = alpha * pLeroi;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#F2C94C';
      ctx.font = '900 72px "Playfair Display", "Be Vietnam Pro", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText("Lê Lợi 1428", 160, 380);
      ctx.restore();

      drawFourPointStar(ctx, 620, 380, 24, starScale, starAngle);
    }

    // 18s (t >= 2.0s): Tên "Quang Trung 1789" bên TRÁI (x=160, y=640) cỡ 72px + ngôi sao thứ hai
    if (t >= 2.0) {
      const pQuangTrung = Math.min(1, (t - 2.0) / 0.5);
      ctx.save();
      ctx.globalAlpha = alpha * pQuangTrung;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#F2C94C';
      ctx.font = '900 72px "Playfair Display", "Be Vietnam Pro", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText("Quang Trung 1789", 160, 640);
      ctx.restore();

      drawFourPointStar(ctx, 770, 640, 24, starScale, -starAngle);
    }

    ctx.restore();
  }

  // 16–20s: Thanh năm đếm 1428 → 1789
  function getYearText(globalTime) {
    const t = Math.max(0, Math.min(4, globalTime - startTime));
    const yearVal = 1428 + (t / 4) * (1789 - 1428);
    return `${Math.round(yearVal)}`;
  }

  return { startTime, duration, render, getYearText };
})();
