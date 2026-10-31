/**
 * ========================================================
 * CẢNH 2 (4–8s): XIỀNG XÍCH VỠ TAN & BA NGỌN CỜ QUẬT KHỞI
 * ========================================================
 */
window.HistoryVN_Scene2 = (function() {
  const startTime = 4;
  const duration = 4;

  // Khởi tạo các hạt vỡ sẵn để tái hiện chuẩn xác
  const linkCount = 12;
  const chainStartX = 200;
  const chainEndX = 1720;
  const stepX = (chainEndX - chainStartX) / (linkCount - 1);
  const chainY = 480;

  const particles = [];
  for (let i = 0; i < linkCount; i++) {
    const lx = chainStartX + i * stepX;
    for (let k = 0; k < 8; k++) {
      const angle = (k / 8) * Math.PI * 2 + (i * 0.5);
      const spd = 4 + (k % 3) * 3;
      particles.push({
        origX: lx,
        origY: chainY,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 2, // Lực đẩy nhẹ
        gravity: 0.18
      });
    }
  }

  function render(ctx, globalTime, W, H) {
    if (globalTime < startTime || globalTime > startTime + duration) return;
    const t = globalTime - startTime; // 0 to 4s (tương ứng 4-8s tuyệt đối)

    // Fade out 7.7-8s
    let alpha = 1;
    if (t > 3.7) alpha = Math.max(0, (4.0 - t) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Nền cố định #8B1A1A
    ctx.fillStyle = '#8B1A1A';
    ctx.fillRect(0, 0, W, H);

    // 4–5s (t: 0-1s): 12 mắt xích oval hiện lần lượt từ trái sang phải, cách nhau 0.07s
    // 5–5.8s (t: 1-1.8s): Cả chuỗi rung ngang ±4px tốc độ tăng dần
    // 5.8s (t >= 1.8s): Vỡ thành các hạt
    if (t < 1.8) {
      let shakeX = 0;
      if (t >= 1.0) {
        const shakeProg = (t - 1.0) / 0.8;
        const freq = 15 + shakeProg * 40;
        shakeX = Math.sin((t - 1.0) * freq) * 4 * shakeProg;
      }

      ctx.save();
      ctx.translate(shakeX, 0);
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 4;

      for (let i = 0; i < linkCount; i++) {
        const appearT = i * 0.07;
        if (t >= appearT) {
          const lx = chainStartX + i * stepX;
          const isRotated = (i % 2 === 1);

          ctx.save();
          ctx.translate(lx, chainY);
          ctx.beginPath();
          if (isRotated) {
            ctx.ellipse(0, 0, 16, 34, 0, 0, Math.PI * 2);
          } else {
            ctx.ellipse(0, 0, 34, 16, 0, 0, Math.PI * 2);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();
    } else {
      // 5.8–7s (t: 1.8 - 3.0s): Các hạt vỡ bay ngẫu nhiên, có trọng lực nhẹ, mờ dần
      const shatterT = t - 1.8;
      if (shatterT < 1.2) {
        const pAlpha = Math.max(0, 1 - shatterT / 1.2);
        ctx.save();
        ctx.fillStyle = '#F2C94C';
        particles.forEach(p => {
          const px = p.origX + p.vx * (shatterT * 25);
          const py = p.origY + p.vy * (shatterT * 25) + 0.5 * p.gravity * Math.pow(shatterT * 25, 2);
          ctx.globalAlpha = alpha * pAlpha;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
    }

    // 6.3s, 6.6s, 6.9s (t: 2.3s, 2.6s, 2.9s): Lần lượt mọc 3 ngọn cờ tại x=600, 960, 1320
    // Cột vươn từ y=800 lên y=560, mỗi cờ mất 0.5s
    const flagConfigs = [
      { startT: 2.3, x: 600 },
      { startT: 2.6, x: 960 },
      { startT: 2.9, x: 1320 }
    ];

    flagConfigs.forEach((cfg, idx) => {
      if (t >= cfg.startT) {
        const flagProg = Math.min(1, (t - cfg.startT) / 0.5);
        const curTopY = 800 - flagProg * (800 - 560);

        ctx.save();
        ctx.strokeStyle = '#F2C94C';
        ctx.lineWidth = 5;

        // Cột cờ
        ctx.beginPath();
        ctx.moveTo(cfg.x, 800);
        ctx.lineTo(cfg.x, curTopY);
        ctx.stroke();

        // Lá cờ tam giác phấp phới sóng sin khi cột đã vươn lên
        if (flagProg > 0.4) {
          const cAlpha = (flagProg - 0.4) / 0.6;
          ctx.globalAlpha = alpha * cAlpha;
          ctx.fillStyle = '#F2C94C';
          ctx.beginPath();
          ctx.moveTo(cfg.x, curTopY);

          // Đường lượn sóng của lá cờ tam giác
          const flagW = 120;
          const waveTipY = curTopY + 35 + Math.sin(globalTime * 8 + idx) * 12;
          ctx.lineTo(cfg.x + flagW, waveTipY);
          ctx.lineTo(cfg.x, curTopY + 70);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    });

    ctx.restore();
  }

  function getYearText(globalTime) {
    // 4–8s: chạy nhanh từ "111 TCN" đến "938" theo ease power2.in
    const t = Math.max(0, Math.min(1, (globalTime - 4) / 4));
    const easeProg = Math.pow(t, 2); // power2.in

    if (t < 0.3) {
      return "111 TCN";
    }

    // Từ năm -111 đến +938
    const yearVal = Math.floor(-111 + easeProg * (938 - (-111)));
    if (yearVal < 0) {
      return `${Math.abs(yearVal)} TCN`;
    }
    return `${yearVal}`;
  }

  return { startTime, duration, render, getYearText };
})();

