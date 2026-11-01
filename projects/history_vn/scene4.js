/**
 * ========================================================
 * CẢNH 4 (12–16s): ĐỊNH ĐÔ THĂNG LONG & KHIÊN VÀNG CHẶN 3 MŨI TÊN ĐỎ
 * Tích hợp Nghệ Thuật Điện Ảnh (Cinematic Art) & 2.5D Parallax Camera
 * ========================================================
 */
window.HistoryVN_Scene4 = (function() {
  const startTime = 12;
  const duration = 4;

  let bgImg = null;
  function getBgImage() {
    if (!bgImg && window.VN_IMAGE_ASSETS && window.VN_IMAGE_ASSETS.scene4) {
      bgImg = new Image();
      bgImg.src = window.VN_IMAGE_ASSETS.scene4;
    }
    return bgImg;
  }

  const hanoiScreenX = 440;
  const hanoiScreenY = 291;

  // 3 mũi tên đỏ lao từ (1800, 100)
  // Va chạm lúc 13.4s, 14.0s, 14.6s (t = 1.4s, 2.0s, 2.6s)
  const arrowConfigs = [
    { impactT: 1.4 },
    { impactT: 2.0 },
    { impactT: 2.6 }
  ];

  function drawArrow(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowColor = '#E63946';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#E63946';
    ctx.fillStyle = '#E63946';
    ctx.lineWidth = 4;

    // Thân tên dài 60px
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Đầu mũi tên nhọn
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-18, -10);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-18, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function render(ctx, globalTime, W, H) {
    if (globalTime < startTime || globalTime > startTime + duration) return;
    const t = globalTime - startTime; // 0 to 4s (tương ứng 12-16s)

    // Fade in 0-0.3s, Fade out 15.7-16s
    let alpha = 1;
    if (t < 0.3) alpha = t / 0.3;
    else if (t > 3.7) alpha = Math.max(0, (4.0 - t) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. NGHỆ THUẬT ĐIỆN ẢNH HOÀNG THÀNH THĂNG LONG 2.5D PARALLAX
    const img = getBgImage();
    const prog = t / duration;

    if (img && img.complete && img.naturalWidth > 0) {
      const scale = 1.03 + prog * 0.08;
      const panX = 25 * prog; // Lia nhẹ sang phải tôn lên nét cung đình
      const panY = -12 * prog;

      ctx.save();
      ctx.translate(W / 2 + panX, H / 2 + panY);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -W / 2, -H / 2, W, H);
      ctx.restore();

      // Hòa sắc hoàng gia Thăng Long
      const grad = ctx.createRadialGradient(W * 0.6, H * 0.45, 250, W / 2, H / 2, 1050);
      grad.addColorStop(0, 'rgba(139, 26, 26, 0.38)');
      grad.addColorStop(0.7, 'rgba(110, 15, 15, 0.72)');
      grad.addColorStop(1, 'rgba(25, 4, 4, 0.92)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#8B1A1A';
      ctx.fillRect(0, 0, W, H);
    }

    // 12–13s (t: 0-1s): Bản đồ zoom từ toàn quốc về Hà Nội (scale 1→4, tâm zoom là Hà Nội)
    const zoomP = Math.min(1, t / 1.0);
    const curScale = 1.0 + zoomP * 3.0; // 1 -> 4

    // Vẽ bản đồ bên TRÁI (x: 160–800, y: 96–900)
    ctx.save();
    ctx.translate(hanoiScreenX, hanoiScreenY);
    ctx.scale(curScale, curScale);
    ctx.translate(-hanoiScreenX, -hanoiScreenY);

    if (window.VN_MAP_DATA) {
      ctx.save();
      ctx.translate(160, 96);
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5 / curScale;
      ctx.fillStyle = 'rgba(242, 201, 76, 0.12)';

      const pts = window.VN_MAP_DATA.mainlandPoints;
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

    // 13s (t >= 1.0s): Hiện chấm vàng + vòng cung khiên bán kính 150px quanh Hà Nội
    if (t >= 1.0) {
      const shieldAlpha = Math.min(1, (t - 1.0) / 0.3);
      ctx.save();
      ctx.shadowColor = '#F2C94C';
      ctx.shadowBlur = 24;

      // Chấm vàng tại Hà Nội
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(hanoiScreenX, hanoiScreenY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Vòng cung khiên r=150px (hướng về phía góc trên bên phải đối mặt tên giặc)
      ctx.strokeStyle = `rgba(242, 201, 76, ${shieldAlpha * alpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(hanoiScreenX, hanoiScreenY, 150, -0.65 * Math.PI, 0.15 * Math.PI);
      ctx.stroke();

      // Lớp sáng bảo vệ bên trong khiên
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

    // 13.2–13.8s (t: 1.2-1.8s): Chữ "Thăng Long 1010" cỡ 96px bên PHẢI (x=1100, y=420)
    if (t >= 1.2) {
      const textProg = Math.min(1, (t - 1.2) / 0.6);
      ctx.save();
      ctx.globalAlpha = alpha * textProg;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#F2C94C';
      ctx.font = '900 96px "Playfair Display", "Be Vietnam Pro", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText("Thăng Long 1010", 1100, 420);
      ctx.restore();
    }

    // 3 Mũi Tên Đỏ và Va Chạm Bật Ngược
    const startArrowX = 1800;
    const startArrowY = 100;
    const attackAngle = Math.atan2(hanoiScreenY - startArrowY, hanoiScreenX - startArrowX);
    const hitX = hanoiScreenX + Math.cos(attackAngle) * 150;
    const hitY = hanoiScreenY + Math.sin(attackAngle) * 150;

    arrowConfigs.forEach(cfg => {
      const flyStartT = cfg.impactT - 0.3; // Bay trong 0.3s
      const bounceEndT = cfg.impactT + 0.25; // Bật ngược trong 0.25s

      if (t >= flyStartT && t < cfg.impactT) {
        // Đang bay tới khiên
        const flyP = (t - flyStartT) / 0.3;
        const curX = startArrowX + flyP * (hitX - startArrowX);
        const curY = startArrowY + flyP * (hitY - startArrowY);
        drawArrow(ctx, curX, curY, attackAngle);
      } else if (t >= cfg.impactT && t <= bounceEndT) {
        // Bật ngược trở lại kèm xoay nhẹ
        const bounceP = (t - cfg.impactT) / 0.25;
        const curX = hitX - Math.cos(attackAngle) * (bounceP * 180);
        const curY = hitY - Math.sin(attackAngle) * (bounceP * 180);
        const bounceAngle = attackAngle + Math.PI + (bounceP * 0.4);
        drawArrow(ctx, curX, curY, bounceAngle);

        // Tia lửa va chạm nhỏ tại hitX, hitY
        ctx.save();
        ctx.shadowColor = '#F2C94C';
        ctx.shadowBlur = 18;
        for (let sp = 0; sp < 8; sp++) {
          const spAngle = (sp / 8) * Math.PI * 2;
          const spDist = bounceP * 70;
          ctx.fillStyle = (sp % 2 === 0 ? '#FFE066' : '#E63946');
          ctx.beginPath();
          ctx.arc(hitX + Math.cos(spAngle) * spDist, hitY + Math.sin(spAngle) * spDist, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });

    ctx.restore();
  }

  // 12–16s: Thanh năm đếm 1010 → 1288
  function getYearText(globalTime) {
    const t = Math.max(0, Math.min(4, globalTime - startTime));
    const yearVal = 1010 + (t / 4) * (1288 - 1010);
    return `${Math.round(yearVal)}`;
  }

  return { startTime, duration, render, getYearText };
})();
