/**
 * ========================================================
 * CẢNH 2 (4–8s): XIỀNG XÍCH VỠ TAN & BA NGỌN CỜ QUẬT KHỞI
 * Tích hợp Nghệ Thuật Điện Ảnh (Cinematic Art) & 2.5D Parallax Camera
 * ========================================================
 */
window.HistoryVN_Scene2 = (function() {
  const startTime = 4;
  const duration = 4;

  let bgImg = null;
  function getBgImage() {
    if (!bgImg && window.VN_IMAGE_ASSETS && window.VN_IMAGE_ASSETS.scene2) {
      bgImg = new Image();
      bgImg.src = window.VN_IMAGE_ASSETS.scene2;
    }
    return bgImg;
  }

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

  // 3 ngọn cờ
  const flagConfigs = [
    { x: 600, startT: 2.3 },  // 6.3s (t = 2.3)
    { x: 960, startT: 2.6 },  // 6.6s (t = 2.6)
    { x: 1320, startT: 2.9 }  // 6.9s (t = 2.9)
  ];

  function render(ctx, globalTime, W, H) {
    if (globalTime < startTime || globalTime > startTime + duration) return;
    const t = globalTime - startTime; // 0 to 4s (tương ứng 4-8s tuyệt đối)

    // Fade in 0-0.3s, Fade out 7.7-8s
    let alpha = 1;
    if (t < 0.3) alpha = t / 0.3;
    else if (t > 3.7) alpha = Math.max(0, (4.0 - t) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. NGHỆ THUẬT ĐIỆN ẢNH VỚI 2.5D KEN BURNS PUSH-IN
    const img = getBgImage();
    const prog = t / duration;

    if (img && img.complete && img.naturalWidth > 0) {
      const scale = 1.02 + prog * 0.10; // Phóng tới mạnh mẽ 1.02 -> 1.12
      const panY = -15 * prog;

      ctx.save();
      ctx.translate(W / 2, H / 2 + panY);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -W / 2, -H / 2, W, H);
      ctx.restore();

      // Ánh sáng bão tố và lửa quật khởi
      const grad = ctx.createRadialGradient(W / 2, chainY, 200, W / 2, H / 2, 1000);
      grad.addColorStop(0, 'rgba(139, 26, 26, 0.35)');
      grad.addColorStop(0.7, 'rgba(110, 15, 15, 0.70)');
      grad.addColorStop(1, 'rgba(20, 2, 2, 0.92)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#8B1A1A';
      ctx.fillRect(0, 0, W, H);
    }

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
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#F2C94C';
      ctx.lineWidth = 4.5;

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
        ctx.shadowColor = '#F2C94C';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FFE066';
        particles.forEach(p => {
          const px = p.origX + p.vx * (shatterT * 25);
          const py = p.origY + p.vy * (shatterT * 25) + 0.5 * p.gravity * Math.pow(shatterT * 25, 2);
          ctx.globalAlpha = alpha * pAlpha;
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
    }

    // 6.3s, 6.6s, 6.9s: Ba ngọn cờ mọc lên từ y=800 lên y=560, mất 0.5s mỗi cờ
    flagConfigs.forEach((flag) => {
      if (t >= flag.startT) {
        const flagProg = Math.min(1, (t - flag.startT) / 0.5);
        const curTopY = 800 - flagProg * (800 - 560);
        const waveTime = t * 6;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 14;

        // Cột cờ
        ctx.strokeStyle = '#F2C94C';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(flag.x, 800);
        ctx.lineTo(flag.x, curTopY);
        ctx.stroke();

        // Lá cờ tam giác phấp phới sóng sin
        if (flagProg > 0.3) {
          const flagScale = (flagProg - 0.3) / 0.7;
          const flagW = 110 * flagScale;
          const flagH = 70 * flagScale;

          const waveOffset1 = Math.sin(waveTime) * 8;
          const waveOffset2 = Math.cos(waveTime * 1.2) * 10;

          ctx.fillStyle = '#DA251D';
          ctx.strokeStyle = '#F2C94C';
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.moveTo(flag.x, curTopY);
          ctx.lineTo(flag.x + flagW + waveOffset1, curTopY + flagH / 2 + waveOffset2);
          ctx.lineTo(flag.x, curTopY + flagH);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    });

    ctx.restore();
  }

  // 4–8s: Thanh năm chạy nhanh từ "111 TCN" đến "938" (ease power2.in)
  function getYearText(globalTime) {
    const t = Math.max(0, Math.min(4, globalTime - startTime));
    const prog = t / 4;
    const easeProg = Math.pow(prog, 2);

    const yearVal = -111 + easeProg * (938 - (-111));
    const roundYear = Math.round(yearVal);

    if (roundYear < 0) {
      return `${Math.abs(roundYear)} TCN`;
    } else {
      return `${roundYear}`;
    }
  }

  return { startTime, duration, render, getYearText };
})();
