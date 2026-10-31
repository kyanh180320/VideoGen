/**
 * ========================================================
 * CẢNH 3 (8–12s): BẠCH ĐẰNG 938 & CỌC NHỌN ĐẬP TAN THUYỀN GIẶC
 * ========================================================
 */
window.HistoryVN_Scene3 = (function() {
  const startTime = 8;
  const duration = 4;

  // 9 cọc nhọn trải từ x=700 đến x=1500
  const stakeCount = 9;
  const stakeStartX = 700;
  const stakeEndX = 1500;
  const stakeStep = (stakeEndX - stakeStartX) / (stakeCount - 1);
  const stakes = [];
  for (let i = 0; i < stakeCount; i++) {
    stakes.push({
      x: stakeStartX + i * stakeStep,
      h: 240 + (i % 3) * 50,
      tilt: (i % 2 === 0 ? 0.06 : -0.05),
      startT: 0.5 + i * 0.08 // từ 8.5 đến 9.3s tương đối
    });
  }

  // 3 thuyền hình thang
  const boatConfigs = [
    { startX: -200, targetX: 680, w: 140, h: 45, y: 640 },
    { startX: -360, targetX: 840, w: 160, h: 50, y: 720 },
    { startX: -520, targetX: 1020, w: 150, h: 48, y: 800 }
  ];

  function render(ctx, globalTime, W, H) {
    if (globalTime < startTime || globalTime > startTime + duration) return;
    const t = globalTime - startTime; // 0 to 4s (tương ứng 8-12s)

    // Fade out 11.7-12s
    let alpha = 1;
    if (t > 3.7) alpha = Math.max(0, (4.0 - t) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Nền cố định #8B1A1A
    ctx.fillStyle = '#8B1A1A';
    ctx.fillRect(0, 0, W, H);

    // 8–8.5s (t: 0-0.5s): Chữ "Bạch Đằng 938" cỡ 96px căn giữa phía trên (y=200)
    const textAlpha = Math.min(1, t / 0.5);
    ctx.save();
    ctx.globalAlpha = alpha * textAlpha;
    ctx.fillStyle = '#F2C94C';
    ctx.font = '900 96px "Playfair Display", "Be Vietnam Pro", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Bạch Đằng 938", 960, 200);
    ctx.restore();

    // 8.5–9.3s (t: 0.5-1.3s): 9 cọc nhọn nhô lên từ dưới mặt nước (y=720 nhô lên)
    stakes.forEach(s => {
      if (t >= s.startT) {
        const riseProg = Math.min(1, (t - s.startT) / 0.4);
        const curH = s.h * riseProg;

        ctx.save();
        ctx.translate(s.x, 820);
        ctx.rotate(s.tilt);
        ctx.fillStyle = '#F2C94C';

        // Tam giác cọc cao nhọn
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(18, 0);
        ctx.lineTo(0, -curH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    });

    // 9–10.3s: 3 thuyền chạy từ trái sang phải
    // 10.3–10.8s: va vào cọc, khựng lại, nghiêng 8°
    boatConfigs.forEach((b, idx) => {
      if (t >= 1.0) {
        let curX;
        let tiltAngle = 0;

        if (t < 2.3) {
          // Đang lao tới (9-10.3s)
          const runP = (t - 1.0) / 1.3;
          curX = b.startX + runP * (b.targetX - b.startX);
        } else if (t < 2.8) {
          // Va vào cọc khựng lại và nghiêng 8 độ (10.3-10.8s)
          curX = b.targetX;
          const tiltP = (t - 2.3) / 0.5;
          tiltAngle = (8 * Math.PI / 180) * Math.sin(tiltP * Math.PI / 2);
        } else {
          curX = b.targetX;
          tiltAngle = 8 * Math.PI / 180;
        }

        ctx.save();
        ctx.translate(curX, b.y);
        ctx.rotate(tiltAngle);

        // Vẽ thuyền hình thang đơn giản
        ctx.strokeStyle = '#F2C94C';
        ctx.fillStyle = 'rgba(242, 201, 76, 0.25)';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-b.w / 2 + 25, b.h / 2);
        ctx.lineTo(b.w / 2 - 25, b.h / 2);
        ctx.lineTo(b.w / 2, -b.h / 2);
        ctx.lineTo(-b.w / 2, -b.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cột buồm gãy nghiêng
        ctx.beginPath();
        ctx.moveTo(0, -b.h / 2);
        ctx.lineTo(15, -b.h / 2 - 40);
        ctx.stroke();

        ctx.restore();
      }
    });

    // CẢ CẢNH: 3 lớp sóng nước sin chuyển động liên tục (nửa dưới y 540–960)
    // Biên độ 20, 30, 40px, tốc độ khác nhau
    const waveLayers = [
      { yBase: 580, amp: 20, freq: 0.008, speed: 3.5, alpha: 0.35, width: 2 },
      { yBase: 680, amp: 30, freq: 0.006, speed: 2.2, alpha: 0.55, width: 3 },
      { yBase: 800, amp: 40, freq: 0.005, speed: 1.5, alpha: 0.85, width: 4 }
    ];

    waveLayers.forEach(w => {
      ctx.save();
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = w.width;
      ctx.globalAlpha = alpha * w.alpha;

      ctx.beginPath();
      ctx.moveTo(0, w.yBase);
      for (let x = 0; x <= W; x += 20) {
        const sy = w.yBase + Math.sin(x * w.freq + globalTime * w.speed) * w.amp;
        ctx.lineTo(x, sy);
      }
      ctx.stroke();
      ctx.restore();
    });

    // 11–12s (t: 3.0-4.0s): Vòng sáng vàng loang ra từ giữa màn hình (960, 540), r 0→1000, nét 6px, mờ dần
    if (t >= 3.0) {
      const ringP = (t - 3.0) / 1.0;
      const r = ringP * 1000;
      const ringAlpha = Math.max(0, 1 - ringP);

      ctx.save();
      ctx.strokeStyle = `rgba(242, 201, 76, ${ringAlpha * alpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(960, 540, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  function getYearText(globalTime) {
    // Đứng yên ở "938", nhấp sáng nhẹ một lần lúc 11s
    return "938";
  }

  return { startTime, duration, render, getYearText };
})();

