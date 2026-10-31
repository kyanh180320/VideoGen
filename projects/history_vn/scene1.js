/**
 * ========================================================
 * CẢNH 1 (0–4s): VĂN LANG & DÒNG SÔNG HỒNG
 * ========================================================
 */
window.HistoryVN_Scene1 = (function() {
  const startTime = 0;
  const duration = 4;

  function render(ctx, globalTime, W, H) {
    if (globalTime < startTime || globalTime > startTime + duration) return;
    const t = globalTime - startTime;

    // Fade in 0-0.3s, Fade out 3.7-4s
    let alpha = 1;
    if (t < 0.3) alpha = t / 0.3;
    else if (t > 3.7) alpha = Math.max(0, (4.0 - t) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Nền cố định #8B1A1A
    ctx.fillStyle = '#8B1A1A';
    ctx.fillRect(0, 0, W, H);

    // BỐ CỤC: Bản đồ VN bên PHẢI (x: 1100–1700, y: 96–900) -> Box: x=1100, y=96, W=600, H=800
    const mapBoxX = 1100;
    const mapBoxY = 96;

    // 0.3–1.5s đường viền VN tự vẽ (stroke-dashoffset simulation)
    const strokeProg = t < 0.3 ? 0 : (t >= 1.5 ? 1 : (t - 0.3) / 1.2);
    if (strokeProg > 0 && window.VN_MAP_DATA) {
      const pts = window.VN_MAP_DATA.mainlandPoints;
      const totalPts = pts.length;
      const count = Math.max(2, Math.floor(strokeProg * totalPts));

      ctx.save();
      ctx.translate(mapBoxX, mapBoxY);
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < count; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      if (strokeProg >= 1) {
        ctx.closePath();
      }
      ctx.stroke();

      // Khi vẽ xong, tô nhẹ nền bản đồ mờ
      if (strokeProg >= 1) {
        ctx.fillStyle = 'rgba(242, 201, 76, 0.08)';
        ctx.fill();
      }
      ctx.restore();
    }

    // 1.2–2.8s: Sông Hồng chạy từ trên xuống
    if (t >= 1.2 && window.VN_MAP_DATA) {
      const riverProg = t >= 2.8 ? 1 : (t - 1.2) / 1.6;
      const rPts = window.VN_MAP_DATA.redRiverPoints;
      const maxIdx = Math.min(rPts.length - 1, Math.floor(riverProg * (rPts.length - 1)));
      const frac = (riverProg * (rPts.length - 1)) - maxIdx;

      ctx.save();
      ctx.translate(mapBoxX, mapBoxY);
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rPts[0][0], rPts[0][1]);
      for (let i = 1; i <= maxIdx; i++) {
        ctx.lineTo(rPts[i][0], rPts[i][1]);
      }
      if (maxIdx < rPts.length - 1 && frac > 0) {
        const nextP = rPts[maxIdx + 1];
        const curP = rPts[maxIdx];
        ctx.lineTo(curP[0] + (nextP[0] - curP[0]) * frac, curP[1] + (nextP[1] - curP[1]) * frac);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 1.5–3s: Chữ "Văn Lang" cỡ 96px bên TRÁI (x trượt 100 -> 160, y = 540)
    if (t >= 1.5) {
      const textProg = t >= 3.0 ? 1 : (t - 1.5) / 1.5;
      // Trượt từ x=100 sang x=160
      const textX = 100 + textProg * 60;
      const textAlpha = textProg;

      ctx.save();
      ctx.globalAlpha = alpha * textAlpha;
      ctx.fillStyle = '#F2C94C';
      ctx.font = '900 96px "Playfair Display", "Be Vietnam Pro", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText("Văn Lang", textX, 540);
      ctx.restore();
    }

    // 2.5–3.5s: Chấm sáng tại Phú Thọ nở 3 vòng tròn đồng tâm, cách nhau 0.2s (r 0→60, opacity 1→0)
    if (t >= 2.5 && t <= 3.5 && window.VN_MAP_DATA) {
      const ptTime = t - 2.5;
      const ptCoords = window.VN_MAP_DATA.landmarks.phuTho;
      const cx = mapBoxX + ptCoords.x;
      const cy = mapBoxY + ptCoords.y;

      // Chấm sáng tâm
      ctx.save();
      ctx.fillStyle = '#F2C94C';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // 3 vòng tròn đồng tâm cách nhau 0.2s
      [0, 0.2, 0.4].forEach(delay => {
        const rippleT = ptTime - delay;
        if (rippleT >= 0 && rippleT <= 0.6) {
          const rP = rippleT / 0.6;
          const r = rP * 60;
          const rAlpha = 1 - rP;
          ctx.strokeStyle = `rgba(242, 201, 76, ${rAlpha * alpha})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    ctx.restore();
  }

  function getYearText(globalTime) {
    if (globalTime < 0.3) return "";
    return "-2879 TCN";
  }

  return { startTime, duration, render, getYearText };
})();

