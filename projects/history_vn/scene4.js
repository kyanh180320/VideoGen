/**
 * ========================================================
 * CẢNH 4 (12–16s): ĐỊNH ĐÔ THĂNG LONG & KHIÊN VÀNG CHẶN 3 MŨI TÊN ĐỎ
 * ========================================================
 */
window.HistoryVN_Scene4 = (function() {
  const startTime = 12;
  const duration = 4;

  // Tọa độ mục tiêu Hà Nội trên khung bản đồ bên TRÁI
  // Bản đồ gốc W=640, H=800, đặt tại mapX = 160, mapY = 96
  // Điểm Hà Nội cục bộ trong map là (280, 195)
  // Tọa độ màn hình toàn cục của Hà Nội trước zoom:
  // targetHanoiX = 160 + 280 = 440, targetHanoiY = 96 + 195 = 291
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

    // Fade out 15.7-16s
    let alpha = 1;
    if (t > 3.7) alpha = Math.max(0, (4.0 - t) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Nền cố định #8B1A1A
    ctx.fillStyle = '#8B1A1A';
    ctx.fillRect(0, 0, W, H);

    // 12–13s (t: 0-1s): Bản đồ zoom từ toàn quốc về Hà Nội (scale 1→4, tâm zoom là Hà Nội)
    const zoomP = Math.min(1, t / 1.0);
    const curScale = 1.0 + zoomP * 3.0; // 1 -> 4

    // Vẽ bản đồ bên TRÁI (x: 160–800, y: 96–900)
    ctx.save();
    // Giữ tâm zoom cố định tại hanoiScreenX, hanoiScreenY
    ctx.translate(hanoiScreenX, hanoiScreenY);
    ctx.scale(curScale, curScale);
    ctx.translate(-hanoiScreenX, -hanoiScreenY);

    if (window.VN_MAP_DATA) {
      ctx.save();
      ctx.translate(160, 96);
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3 / curScale; // Giữ nét mảnh khi zoom
      ctx.fillStyle = 'rgba(242, 201, 76, 0.08)';

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
      ctx.globalAlpha = alpha * shieldAlpha;

      // Chấm vàng tại Hà Nội
      ctx.fillStyle = '#F2C94C';
      ctx.beginPath();
      ctx.arc(hanoiScreenX, hanoiScreenY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Vòng cung khiên vàng hướng về góc trên bên phải (nơi quân giặc lao tới)
      // Góc hướng về (1800, 100): angle ~ -0.15 rad
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(hanoiScreenX, hanoiScreenY, 150, -Math.PI * 0.35, Math.PI * 0.25);
      ctx.stroke();

      // Cung đôi bảo vệ
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hanoiScreenX, hanoiScreenY, 162, -Math.PI * 0.3, Math.PI * 0.2);
      ctx.stroke();

      ctx.restore();
    }

    // 13.2–13.8s (t: 1.2-1.8s): Chữ "Thăng Long 1010" cỡ 96px bên PHẢI (x=1100, y=420)
    if (t >= 1.2) {
      const textProg = Math.min(1, (t - 1.2) / 0.6);
      ctx.save();
      ctx.globalAlpha = alpha * textProg;
      ctx.fillStyle = '#F2C94C';
      ctx.font = '900 96px "Playfair Display", "Be Vietnam Pro", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText("Thăng Long", 1100, 390);
      ctx.fillText("1010", 1100, 490);
      ctx.restore();
    }

    // 3 mũi tên đỏ bay từ (1800, 100) về phía Hà Nội
    // Mỗi mũi bay 0.3s, chạm khiên lúc 1.4s, 2.0s, 2.6s, bật ngược 0.25s kèm tia lửa
    const originX = 1800;
    const originY = 100;
    // Điểm chạm trên khiên (cách Hà Nội 150px trên đường thẳng tới origin)
    const dx = originX - hanoiScreenX;
    const dy = originY - hanoiScreenY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const hitX = hanoiScreenX + (dx / dist) * 150;
    const hitY = hanoiScreenY + (dy / dist) * 150;
    const flyAngle = Math.atan2(hitY - originY, hitX - originX);

    arrowConfigs.forEach((arr, idx) => {
      const flyStartT = arr.impactT - 0.3;
      const bounceEndT = arr.impactT + 0.25;

      if (t >= flyStartT && t <= bounceEndT) {
        if (t < arr.impactT) {
          // Giai đoạn 1: Đang bay tới (0.3s)
          const p = (t - flyStartT) / 0.3;
          const ax = originX + p * (hitX - originX);
          const ay = originY + p * (hitY - originY);
          drawArrow(ctx, ax, ay, flyAngle);
        } else {
          // Giai đoạn 2: Bật ngược (0.25s)
          const p = (t - arr.impactT) / 0.25;
          const bounceAngle = flyAngle + Math.PI + (idx % 2 === 0 ? 0.2 : -0.2);
          const bounceDist = p * 110;
          const ax = hitX + Math.cos(bounceAngle) * bounceDist;
          const ay = hitY + Math.sin(bounceAngle) * bounceDist;
          ctx.save();
          ctx.globalAlpha = alpha * (1 - p * 0.6);
          drawArrow(ctx, ax, ay, bounceAngle);
          ctx.restore();

          // Tia lửa nhỏ tại điểm va chạm
          ctx.save();
          ctx.strokeStyle = '#F2C94C';
          ctx.lineWidth = 2;
          for (let sp = 0; sp < 6; sp++) {
            const spAngle = (sp / 6) * Math.PI * 2;
            const spDist = p * 28;
            ctx.beginPath();
            ctx.moveTo(hitX, hitY);
            ctx.lineTo(hitX + Math.cos(spAngle) * spDist, hitY + Math.sin(spAngle) * spDist);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    });

    ctx.restore();
  }

  function getYearText(globalTime) {
    // 12–16s: đếm 1010 → 1288
    const t = Math.max(0, Math.min(1, (globalTime - 12) / 4));
    const yearVal = Math.floor(1010 + t * (1288 - 1010));
    return `${yearVal}`;
  }

  return { startTime, duration, render, getYearText };
})();

