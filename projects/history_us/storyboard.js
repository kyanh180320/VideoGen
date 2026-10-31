/**
 * ========================================================
 * DỰ ÁN VIDEO: LỊCH SỬ NƯỚC MỸ (1776 - HIỆN TẠI)
 * File Storyboard cấu hình nội dung, kịch bản & đồ họa từng cảnh
 * ========================================================
 */

(function() {
  // 1. CÁC HÀM VẼ ĐỒ HỌA ĐẶC THÙ CHO DỰ ÁN LỊCH SỬ NƯỚC MỸ
  function drawWavingFlag(ctx, x, y, width, height, t) {
    const stripes = 13;
    const stripeHeight = height / stripes;
    ctx.save();
    ctx.translate(x, y);

    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#b22234' : '#ffffff';
      ctx.beginPath();
      for (let px = 0; px <= width; px += 10) {
        const wave = Math.sin((px / 60) + (t * 3)) * 8;
        const py = i * stripeHeight + wave;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      for (let px = width; px >= 0; px -= 10) {
        const wave = Math.sin((px / 60) + (t * 3)) * 8;
        const py = (i + 1) * stripeHeight + wave;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    const cantonW = width * 0.42;
    const cantonH = stripeHeight * 7;
    ctx.fillStyle = '#3c3b6e';
    ctx.beginPath();
    for (let px = 0; px <= cantonW; px += 10) {
      const wave = Math.sin((px / 60) + (t * 3)) * 8;
      if (px === 0) ctx.moveTo(px, wave);
      else ctx.lineTo(px, wave);
    }
    for (let px = cantonW; px >= 0; px -= 10) {
      const wave = Math.sin((px / 60) + (t * 3)) * 8;
      ctx.lineTo(px, cantonH + wave);
    }
    ctx.closePath();
    ctx.fill();

    const starCenterX = cantonW / 2;
    const starCenterY = cantonH / 2 + Math.sin((starCenterX / 60) + (t * 3)) * 8;
    const starRadius = cantonH * 0.32;
    ctx.fillStyle = '#ffffff';
    for (let s = 0; s < 13; s++) {
      const angle = (s / 13) * Math.PI * 2 + (t * 0.2);
      const sx = starCenterX + Math.cos(angle) * starRadius;
      const sy = starCenterY + Math.sin(angle) * starRadius;
      window.VideoGraphics.drawStar(ctx, sx, sy, 5, 8, 4);
    }
    ctx.restore();
  }

  function drawLibertyBell(ctx, cx, cy, scale, t) {
    ctx.save();
    ctx.translate(cx, cy + Math.sin(t * 2) * 5);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(-120, -180, 240, 36);

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, -145, 25, 0, Math.PI, true);
    ctx.stroke();

    const grad = ctx.createLinearGradient(-100, 0, 100, 0);
    grad.addColorStop(0, '#8c6224');
    grad.addColorStop(0.3, '#d4af37');
    grad.addColorStop(0.7, '#fef08a');
    grad.addColorStop(1, '#684514');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(-50, -130);
    ctx.quadraticCurveTo(-90, -40, -110, 40);
    ctx.quadraticCurveTo(-125, 80, -135, 95);
    ctx.lineTo(135, 95);
    ctx.quadraticCurveTo(125, 80, 110, 40);
    ctx.quadraticCurveTo(90, -40, 50, -130);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#b45309';
    ctx.fillRect(-140, 95, 280, 20);

    ctx.strokeStyle = '#291807';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-15, 105);
    ctx.lineTo(-5, 60);
    ctx.lineTo(-20, 20);
    ctx.lineTo(-10, -20);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.font = 'bold 12px Cinzel';
    ctx.textAlign = 'center';
    ctx.fillText("PROCLAIM LIBERTY THROUGHOUT ALL THE LAND", 0, -80);
    ctx.fillText("JULY 4, 1776", 0, -60);
    ctx.restore();
  }

  function drawStatueOfLiberty(ctx, cx, cy, scale, t) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const flameGlow = ctx.createRadialGradient(85, -170, 5, 85, -170, 80 + Math.sin(t * 6) * 15);
    flameGlow.addColorStop(0, 'rgba(255, 240, 100, 0.9)');
    flameGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.5)');
    flameGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = flameGlow;
    ctx.beginPath();
    ctx.arc(85, -170, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.fillRect(-70, 80, 140, 120);
    ctx.fillRect(-90, 150, 180, 50);

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.moveTo(-35, 80);
    ctx.lineTo(-45, 20);
    ctx.lineTo(-30, -50);
    ctx.lineTo(-15, -70);
    ctx.lineTo(-15, -95);
    ctx.lineTo(15, -95);
    ctx.lineTo(15, -70);
    ctx.lineTo(40, -60);
    ctx.lineTo(75, -140);
    ctx.lineTo(90, -145);
    ctx.lineTo(80, -120);
    ctx.lineTo(45, -40);
    ctx.lineTo(35, 80);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(80, -150);
    ctx.quadraticCurveTo(70, -170, 85, -195 + Math.sin(t * 8) * 5);
    ctx.quadraticCurveTo(100, -170, 90, -150);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    for (let r = 0; r < 7; r++) {
      const rad = -Math.PI * 0.8 + (r / 6) * Math.PI * 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -95);
      ctx.lineTo(Math.cos(rad) * 35, -95 + Math.sin(rad) * 35);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMoonAndApollo(ctx, W, H, t) {
    ctx.save();
    const moonGrad = ctx.createRadialGradient(W / 2, H + 600, 200, W / 2, H + 600, 1000);
    moonGrad.addColorStop(0, '#94a3b8');
    moonGrad.addColorStop(0.7, '#475569');
    moonGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(W / 2, H + 600, 900, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    [
      { x: W * 0.3, y: H * 0.82, r: 40 },
      { x: W * 0.45, y: H * 0.88, r: 70 },
      { x: W * 0.65, y: H * 0.84, r: 50 },
      { x: W * 0.78, y: H * 0.79, r: 30 }
    ].forEach(c => {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.r, c.r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    const earthGrad = ctx.createRadialGradient(W * 0.8, H * 0.25, 10, W * 0.8, H * 0.25, 90);
    earthGrad.addColorStop(0, '#60a5fa');
    earthGrad.addColorStop(0.5, '#2563eb');
    earthGrad.addColorStop(0.8, '#1e3a8a');
    earthGrad.addColorStop(1, '#020617');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(W * 0.8, H * 0.25, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(W * 0.78, H * 0.22, 35, 0, Math.PI * 2);
    ctx.arc(W * 0.82, H * 0.27, 40, 0, Math.PI * 2);
    ctx.fill();

    const lmX = W * 0.35;
    const lmY = H * 0.75;
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(lmX - 50, lmY - 50, 100, 60);
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(lmX, lmY - 50, 40, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(lmX - 45, lmY + 10);
    ctx.lineTo(lmX - 90, lmY + 60);
    ctx.moveTo(lmX + 45, lmY + 10);
    ctx.lineTo(lmX + 90, lmY + 60);
    ctx.stroke();

    const flagX = lmX + 160;
    const flagY = lmY + 50;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(flagX, flagY);
    ctx.lineTo(flagX, flagY - 110);
    ctx.lineTo(flagX + 80, flagY - 110);
    ctx.stroke();

    drawWavingFlag(ctx, flagX, flagY - 110, 75, 45, t);
    ctx.restore();
  }

  function drawEagle(ctx, cx, cy, scale, t) {
    ctx.save();
    ctx.translate(cx, cy + Math.sin(t * 3) * 12);
    ctx.scale(scale, scale);

    const wingFlap = Math.sin(t * 5) * 25;
    ctx.fillStyle = '#332211';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-150, -80 + wingFlap, -300, -20 + wingFlap * 1.5);
    ctx.quadraticCurveTo(-180, 40, 0, 30);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(150, -80 + wingFlap, 300, -20 + wingFlap * 1.5);
    ctx.quadraticCurveTo(180, 40, 0, 30);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#452b14';
    ctx.beginPath();
    ctx.ellipse(0, 20, 35, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-25, 70);
    ctx.lineTo(0, 115);
    ctx.lineTo(25, 70);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -35, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-8, -35);
    ctx.lineTo(0, -55);
    ctx.lineTo(12, -35);
    ctx.quadraticCurveTo(0, -25, -8, -35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-8, -40, 3, 0, Math.PI * 2);
    ctx.arc(8, -40, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. ĐỊNH NGHĨA DỰ ÁN VIDEO_PROJECT
  window.VIDEO_PROJECT = {
    id: "history_us",
    meta: {
      badge: "✓ Tự Động Khớp Chuyển Cảnh Theo Tốc Độ Giọng Đọc (Zero Dead-Air)",
      title: "LỊCH SỬ NƯỚC MỸ - VIDEO STUDIO 16:9",
      subtitle: "Đọc xong câu tự chuyển cảnh ngay lập tức • 8 Giọng Tiếng Việt (4 Nam + 4 Nữ) • 4 Nhạc Nền",
      defaultVoice: "nam_minh",
      defaultMusic: "zimmer"
    },
    scenes: [
      {
        id: 0,
        cardTitle: "1. Khởi sinh 1776",
        title: "1776 • TUYÊN NGÔN ĐỘC LẬP HOA KỲ",
        sub: "Năm 1776, bản Tuyên ngôn Độc lập ra đời tại Philadelphia, khẳng định quyền tự do, bình đẳng và quyền mưu cầu hạnh phúc.",
        baseSec: 9.2,
        visual: { cameraMode: 'zoom_in' },
        render: function(ctx, t, progress, W, H, particles) {
          const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.45, 80, W * 0.5, H * 0.5, 950);
          bgGrad.addColorStop(0, '#451a03');
          bgGrad.addColorStop(0.5, '#1c1917');
          bgGrad.addColorStop(1, '#0c0a09');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, W, H);

          window.VideoGraphics.drawVolumetricGodRays(ctx, W, H, W * 0.5, H * 0.45, t * 0.3, 'rgba(245, 158, 11, 0.16)');
          window.VideoGraphics.drawCinematicLightLeaks(ctx, W, H, t);
          window.VideoGraphics.drawParticles(ctx, particles, 'gold');

          ctx.save();
          ctx.globalAlpha = 0.4;
          drawWavingFlag(ctx, W * 0.1, H * 0.15, W * 0.8, H * 0.65, t);
          ctx.restore();

          drawLibertyBell(ctx, W * 0.5, H * 0.52, 1.45, t);
          window.VideoGraphics.drawAnamorphicFlare(ctx, W, H * 0.52, 'rgba(245, 158, 11, 0.4)', t);
        }
      },
      {
        id: 1,
        cardTitle: "2. Thử thách 1861",
        title: "1861 - 1865 • NỘI CHIẾN & BẢN TUYÊN NGÔN GIẢI PHÓNG",
        sub: "Nội chiến khốc liệt bùng nổ. Tổng thống Abraham Lincoln ký Tuyên ngôn Giải phóng nô lệ, giữ vững khối thống nhất đất nước.",
        baseSec: 8.0,
        visual: { cameraMode: 'pan_left' },
        render: function(ctx, t, progress, W, H, particles) {
          const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.45, 80, W * 0.5, H * 0.5, 950);
          bgGrad.addColorStop(0, '#1e293b');
          bgGrad.addColorStop(0.5, '#0f172a');
          bgGrad.addColorStop(1, '#020617');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, W, H);

          window.VideoGraphics.drawVolumetricGodRays(ctx, W, H, W * 0.5, H * 0.35, t * 0.8, 'rgba(148, 163, 184, 0.16)');
          window.VideoGraphics.drawCinematicLightLeaks(ctx, W, H, t);
          window.VideoGraphics.drawParticles(ctx, particles, 'stars');

          ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
          for (let col = 0; col < 12; col++) {
            ctx.fillRect(col * 175 + 15, H * 0.15, 90, H * 0.7);
          }

          ctx.save();
          ctx.translate(W * 0.5, H * 0.52);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-180, 80, 360, 140);
          ctx.fillStyle = '#475569';
          ctx.fillRect(-220, 200, 440, 80);

          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(-110, 80);
          ctx.lineTo(-70, -60);
          ctx.lineTo(-40, -110);
          ctx.lineTo(-30, -145);
          ctx.lineTo(-35, -200);
          ctx.lineTo(35, -200);
          ctx.lineTo(30, -145);
          ctx.lineTo(40, -110);
          ctx.lineTo(70, -60);
          ctx.lineTo(110, 80);
          ctx.closePath();
          ctx.fill();

          ctx.font = 'bold 36px Cinzel';
          ctx.fillStyle = '#f59e0b';
          ctx.textAlign = 'center';
          ctx.fillText("EMANCIPATION PROCLAMATION", 0, 140);
          ctx.font = '600 24px Montserrat';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText("1863 • MỘT QUỐC GIA DƯỚI BẦU TRỜI TỰ DO", 0, 175);
          ctx.restore();

          window.VideoGraphics.drawAnamorphicFlare(ctx, W, H * 0.45, 'rgba(56, 189, 248, 0.35)', t);
        }
      },
      {
        id: 2,
        cardTitle: "3. Công nghiệp & Đô thị",
        title: "CUỐI TK 19 - ĐẦU TK 20 • VƯƠN MÌNH THÀNH CƯỜNG QUỐC",
        sub: "Công nghiệp bùng nổ, làn sóng di dân tấp nập qua cảng New York. Nữ thần Tự do trở thành biểu tượng niềm tin của hàng triệu người.",
        baseSec: 7.8,
        visual: { cameraMode: 'zoom_out' },
        render: function(ctx, t, progress, W, H, particles) {
          const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
          bgGrad.addColorStop(0, '#0c4a6e');
          bgGrad.addColorStop(0.5, '#b45309');
          bgGrad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, W, H);

          window.VideoGraphics.drawVolumetricGodRays(ctx, W, H, W * 0.7, H * 0.55, t, 'rgba(254, 240, 138, 0.2)');
          window.VideoGraphics.drawCinematicLightLeaks(ctx, W, H, t);
          window.VideoGraphics.drawParticles(ctx, particles, 'gold');

          ctx.fillStyle = '#0f172a';
          [
            { x: 50, w: 90, h: 350 },
            { x: 160, w: 120, h: 480 },
            { x: 300, w: 80, h: 320 },
            { x: 400, w: 140, h: 560 },
            { x: 560, w: 100, h: 400 },
            { x: 680, w: 110, h: 490 },
            { x: 810, w: 90, h: 340 }
          ].forEach(b => {
            ctx.fillRect(b.x, H - b.h, b.w, b.h);
            ctx.fillRect(b.x + b.w / 2 - 3, H - b.h - 60, 6, 60);
          });

          ctx.fillStyle = '#082f49';
          ctx.fillRect(0, H * 0.78, W, H * 0.22);
          drawStatueOfLiberty(ctx, W * 0.75, H * 0.76, 2.4, t);
          window.VideoGraphics.drawAnamorphicFlare(ctx, W, H * 0.55, 'rgba(245, 158, 11, 0.45)', t);
        }
      },
      {
        id: 3,
        cardTitle: "4. Apollo 11 (1969)",
        title: "1969 • APOLLO 11 & BƯỚC TIẾN VŨ TRỤ",
        sub: "Năm 1969, tàu Apollo 11 hạ cánh xuống Mặt Trăng. Một bước đi nhỏ của con người, một bước tiến vĩ đại của nhân loại.",
        baseSec: 10.7,
        visual: { cameraMode: 'dramatic_push' },
        render: function(ctx, t, progress, W, H, particles) {
          const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.3, 100, W * 0.5, H * 0.5, 950);
          bgGrad.addColorStop(0, '#09152e');
          bgGrad.addColorStop(0.5, '#020617');
          bgGrad.addColorStop(1, '#000000');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, W, H);

          window.VideoGraphics.drawParticles(ctx, particles, 'stars');
          window.VideoGraphics.drawCinematicLightLeaks(ctx, W, H, t);

          drawMoonAndApollo(ctx, W, H, t);
          window.VideoGraphics.drawAnamorphicFlare(ctx, W, H * 0.3, 'rgba(56, 189, 248, 0.5)', t);
        }
      },
      {
        id: 4,
        cardTitle: "5. Thế kỷ 21",
        title: "THẾ KỶ 21 • ĐỔI MỚI, TỰ DO & TƯƠNG LAI",
        sub: "Hơn hai thế kỷ kiên cường dựng xây, Hoa Kỳ vững bước dẫn đầu công nghệ, kinh tế và tự do cho tương lai.",
        baseSec: 7.9,
        visual: { cameraMode: 'pan_right' },
        render: function(ctx, t, progress, W, H, particles) {
          const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.45, 100, W * 0.5, H * 0.5, 950);
          bgGrad.addColorStop(0, '#1e3a8a');
          bgGrad.addColorStop(0.5, '#0f172a');
          bgGrad.addColorStop(1, '#020617');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, W, H);

          window.VideoGraphics.drawVolumetricGodRays(ctx, W, H, W * 0.5, H * 0.45, t * 0.4, 'rgba(59, 130, 246, 0.18)');
          window.VideoGraphics.drawCinematicLightLeaks(ctx, W, H, t);
          window.VideoGraphics.drawParticles(ctx, particles, 'gold');

          // Quả cầu 3D Holographic Globe
          window.VideoGraphics.draw3DHolographicGlobe(ctx, W * 0.5, H * 0.46, 210, t * 0.55, '#60a5fa');
          window.VideoGraphics.drawHolographicHUD(ctx, W * 0.5, H * 0.46, 260, t, '#3b82f6');

          ctx.save();
          ctx.globalAlpha = 0.35;
          drawWavingFlag(ctx, W * 0.05, H * 0.1, W * 0.9, H * 0.75, t);
          ctx.restore();

          drawEagle(ctx, W * 0.5, H * 0.42, 1.35, t);

          ctx.font = '900 48px Cinzel';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(59, 130, 246, 0.9)';
          ctx.shadowBlur = 18;
          ctx.fillText("UNITED STATES OF AMERICA", W * 0.5, H * 0.75);
          ctx.font = '700 24px Montserrat';
          ctx.fillStyle = '#f59e0b';
          ctx.fillText("1776 • TỰ DO • ĐỔI MỚI • TƯƠNG LAI", W * 0.5, H * 0.81);
          ctx.shadowBlur = 0;

          window.VideoGraphics.drawAnamorphicFlare(ctx, W, H * 0.45, 'rgba(59, 130, 246, 0.5)', t);
        }
      }
    ]
  };
})();

