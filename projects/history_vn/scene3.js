/**
 * ========================================================
 * CẢNH 3 (8–12s): BẠCH ĐẰNG 938 & CỌC NHỌN ĐẬP TAN THUYỀN GIẶC
 * Tích hợp Nghệ Thuật Điện Ảnh (Cinematic Art) & 2.5D Parallax Camera
 * ========================================================
 */
window.HistoryVN_Scene3 = (function() {
  const startTime = 8;
  const duration = 4;

  let bgImg = null;
  function getBgImage() {
    if (!bgImg && window.VN_IMAGE_ASSETS && window.VN_IMAGE_ASSETS.scene3) {
      bgImg = new Image();
      bgImg.src = window.VN_IMAGE_ASSETS.scene3;
    }
    return bgImg;
  }

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

    // Fade in 0-0.3s, Fade out 11.7-12s
    let alpha = 1;
    if (t < 0.3) alpha = t / 0.3;
    else if (t > 3.7) alpha = Math.max(0, (4.0 - t) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. NGHỆ THUẬT ĐIỆN ẢNH BẠCH ĐẰNG VỚI 2.5D PARALLAX PAN
    const img = getBgImage();
    const prog = t / duration;

    if (img && img.complete && img.naturalWidth > 0) {
      const scale = 1.05 + prog * 0.06;
      const panX = (0.5 - prog) * 40; // Lia ngang trên dòng sông sương mù
      const panY = -8 * prog;

      ctx.save();
      ctx.translate(W / 2 + panX, H / 2 + panY);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -W / 2, -H / 2, W, H);
      ctx.restore();

      // Hòa sắc điện ảnh Bạch Đằng Giang
      const grad = ctx.createRadialGradient(960, 400, 300, W / 2, H / 2, 1100);
      grad.addColorStop(0, 'rgba(139, 26, 26, 0.32)');
      grad.addColorStop(0.7, 'rgba(120, 20, 20, 0.65)');
      grad.addColorStop(1, 'rgba(25, 4, 4, 0.90)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#8B1A1A';
      ctx.fillRect(0, 0, W, H);
    }

    // 8–8.5s (t: 0-0.5s): Chữ "Bạch Đằng 938" cỡ 96px căn giữa phía trên (y=200)
    const textAlpha = Math.min(1, t / 0.5);
    ctx.save();
    ctx.globalAlpha = alpha * textAlpha;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#F2C94C';
    ctx.font = '900 96px "Playfair Display", "Be Vietnam Pro", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Bạch Đằng 938", 960, 200);
    ctx.restore();

    // 8.5–9.3s (t: 0.5-1.3s): 9 cọc nhọn nhô lên từ dưới mặt nước (y=820 nhô lên)
    stakes.forEach(s => {
      if (t >= s.startT) {
        const riseProg = Math.min(1, (t - s.startT) / 0.4);
        const curH = s.h * riseProg;

        ctx.save();
        ctx.translate(s.x, 820);
        ctx.rotate(s.tilt);
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 12;

        // Thân cọc nhọn vát sắc cạnh
        ctx.fillStyle = '#F2C94C';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(18, 0);
        ctx.lineTo(0, -curH);
        ctx.closePath();
        ctx.fill();

        // Mũi cọc bịt sắt phản chiếu
        ctx.fillStyle = '#FFF2B2';
        ctx.beginPath();
        ctx.moveTo(-6, -curH + 45);
        ctx.lineTo(6, -curH + 45);
        ctx.lineTo(0, -curH);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    });

    // 9–10.3s: 3 thuyền chạy từ trái sang phải
    // 10.3–10.8s: va vào cọc, khựng lại, nghiêng 8°
    boatConfigs.forEach((b) => {
      if (t >= 1.0) {
        let curX;
        let tiltAngle = 0;

        if (t < 2.3) {
          const runP = (t - 1.0) / 1.3;
          curX = b.startX + runP * (b.targetX - b.startX);
        } else if (t < 2.8) {
          curX = b.targetX;
          const tiltP = (t - 2.3) / 0.5;
          tiltAngle = (8 * Math.PI / 180) * Math.sin(tiltP * Math.PI / 2);
        } else {
          curX = b.targetX;
          tiltAngle = 8 * Math.PI / 180;
        }

        ctx.save();
        ctx.translate(curX + b.w / 2, b.y + b.h / 2);
        ctx.rotate(tiltAngle);
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 12;

        ctx.strokeStyle = '#F2C94C';
        ctx.fillStyle = 'rgba(242, 201, 76, 0.45)';
        ctx.lineWidth = 3.5;

        // Thân thuyền hình thang
        ctx.beginPath();
        ctx.moveTo(-b.w / 2, -b.h / 2);
        ctx.lineTo(b.w / 2, -b.h / 2);
        ctx.lineTo(b.w / 2 - 25, b.h / 2);
        ctx.lineTo(-b.w / 2 + 25, b.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cánh buồm
        ctx.beginPath();
        ctx.moveTo(0, -b.h / 2);
        ctx.lineTo(0, -b.h / 2 - 50);
        ctx.lineTo(35, -b.h / 2 - 20);
        ctx.closePath();
        ctx.fillStyle = 'rgba(242, 201, 76, 0.7)';
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    });

    // 3 Lớp Sóng Nước Sin Chuyển Động Liên Tục
    const waveLayers = [
      { amp: 20, freq: 0.005, speed: 3.5, yBase: 650, color: 'rgba(242, 201, 76, 0.15)' },
      { amp: 30, freq: 0.004, speed: 2.2, yBase: 730, color: 'rgba(242, 201, 76, 0.28)' },
      { amp: 40, freq: 0.003, speed: 1.5, yBase: 820, color: 'rgba(242, 201, 76, 0.45)' }
    ];

    waveLayers.forEach(w => {
      ctx.save();
      ctx.fillStyle = w.color;
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, w.yBase);

      for (let x = 0; x <= W; x += 30) {
        const wy = w.yBase + Math.sin(x * w.freq + t * w.speed) * w.amp;
        ctx.lineTo(x, wy);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // 11–12s (t: 3.0-4.0s): Vòng sáng vàng loang ra từ giữa màn hình (960, 540) bán kính 0→1000, dày 6px, mờ dần
    if (t >= 3.0) {
      const shockProg = t - 3.0; // 0 -> 1.0
      const curR = shockProg * 1000;
      const shockAlpha = 1 - shockProg;

      ctx.save();
      ctx.shadowColor = '#F2C94C';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = `rgba(242, 201, 76, ${shockAlpha * alpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(960, 540, curR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // 8–12s: Thanh năm đứng yên ở "938", nhấp sáng nhẹ một lần lúc 11s (11.0 - 11.4s)
  function getYearText() {
    return "938";
  }

  return { startTime, duration, render, getYearText };
})();
