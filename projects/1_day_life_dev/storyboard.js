/**
 * ========================================================
 * DỰ ÁN VIDEO 60 GIÂY: 1 NGÀY CUỘC SỐNG CỦA LẬP TRÌNH VIÊN
 * Đầy đủ 6 phân cảnh theo đúng kịch bản và Prompt người dùng
 * Điều khiển bởi Timeline động, tích hợp 2.5D Ken Burns Parallax
 * ========================================================
 */

(function () {
  // Preload and cache images from Base64 or local paths
  const devImages = {};
  function getDevImage(sceneKey) {
    if (devImages[sceneKey]) return devImages[sceneKey];
    const img = new Image();
    if (window.DEV_IMAGE_ASSETS && window.DEV_IMAGE_ASSETS[sceneKey]) {
      img.src = window.DEV_IMAGE_ASSETS[sceneKey];
    } else {
      img.src = `projects/1_day_life_dev/assets/${sceneKey}.jpg`;
    }
    devImages[sceneKey] = img;
    return img;
  }

  // Helper: Ken Burns 2.5D camera zoom and pan
  function drawKenBurns(ctx, img, progress, W, H, zoomStart, zoomEnd, panX, panY) {
    if (!img.complete || img.naturalWidth === 0) {
      // Fallback dark gradient
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      return;
    }
    const currentZoom = zoomStart + (zoomEnd - zoomStart) * progress;
    const currentPanX = panX * progress;
    const currentPanY = panY * progress;

    ctx.save();
    ctx.translate(W / 2 + currentPanX, H / 2 + currentPanY);
    ctx.scale(currentZoom, currentZoom);
    ctx.drawImage(img, -W / 2, -H / 2, W, H);
    ctx.restore();
  }

  // Helper: Draw Cinematic Vignette
  function drawVignette(ctx, W, H, intensity = 0.55) {
    const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.65);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, `rgba(5, 10, 20, ${intensity})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Helper: Draw Floating Confetti (for Scene 5 Celebration)
  const confettiColors = ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'];
  function drawConfetti(ctx, t, W, H) {
    ctx.save();
    const count = 45;
    for (let i = 0; i < count; i++) {
      const seed = i * 137.5;
      const speed = 80 + (i % 7) * 25;
      const x = ((seed + t * speed * 0.3) % (W + 200)) - 100;
      const y = ((t * speed + seed * 3) % (H + 150)) - 50;
      const size = 6 + (i % 5) * 3;
      const rot = t * 2.5 + i;
      const color = confettiColors[i % confettiColors.length];

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.75 + Math.sin(t * 3 + i) * 0.2;
      ctx.fillRect(-size / 2, -size / 4, size, size / 2);
      ctx.restore();
    }
    ctx.restore();
  }

  // Helper: Draw Floating Code Stream (for Scene 3 Deep Work)
  const codeLines = [
    'const asyncPipeline = await engine.compile();',
    'if (response.status === 200) dispatch(success());',
    'function optimizeRender(ctx, fps) { return fast; }',
    'export const DEV_FLOW = { status: "FOCUS_MAX" };',
    'useEffect(() => { streamAudio.connect(speaker); }, []);',
    'docker compose up --build -d production'
  ];
  function drawCodeParticles(ctx, t, W, H) {
    ctx.save();
    ctx.font = '600 18px "Fira Code", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < codeLines.length; i++) {
      const y = 140 + i * 95;
      const x = ((W + 400) - ((t * 45 + i * 280) % (W + 600))) - 200;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText(codeLines[i], x, y);
    }
    ctx.restore();
  }

  // Master scenes array (60s total, 10s per scene)
  const scenes = [
    {
      id: 0,
      startTime: 0,
      duration: 10,
      timeTag: "07:00 AM",
      cardTitle: "1. 7:00 AM Cà Phê & Khởi Đầu",
      title: "7:00 AM • TÁCH CÀ PHÊ & KHỞI ĐẦU",
      sub: "7:00 AM: Thức dậy bên tách cà phê thơm và mở chiếc máy tính quen thuộc bắt đầu ngày mới.",
      prompt: "Cozy morning sunrise, hot steaming coffee and open glowing code laptop, cinematic warm 16:9",
      render: function (ctx, t, progress, W, H) {
        const img = getDevImage('scene1');
        drawKenBurns(ctx, img, progress, W, H, 1.0, 1.08, 15, -10);
        drawVignette(ctx, W, H, 0.45);

        // Warm morning golden rays
        const sunGrad = ctx.createRadialGradient(W * 0.85, H * 0.2, 50, W * 0.85, H * 0.2, W * 0.7);
        sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
        sunGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
        sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, W, H);
      }
    },
    {
      id: 1,
      startTime: 10,
      duration: 10,
      timeTag: "09:00 AM",
      cardTitle: "2. 9:00 AM Daily Standup",
      title: "9:00 AM • DAILY STANDUP CÙNG TEAM",
      sub: "9:00 AM: Cuộc họp Daily Standup quen thuộc, cả team thảo luận sôi nổi về các tính năng mới trong sprint.",
      prompt: "Modern tech office meeting room, engineering team discussing in front of glass whiteboard",
      render: function (ctx, t, progress, W, H) {
        const img = getDevImage('scene2');
        drawKenBurns(ctx, img, progress, W, H, 1.06, 1.0, -25, 10);
        drawVignette(ctx, W, H, 0.48);

        // Tech grid lines in background
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 120) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        ctx.restore();
      }
    },
    {
      id: 2,
      startTime: 20,
      duration: 10,
      timeTag: "11:30 AM",
      cardTitle: "3. 11:30 AM Deep Work Coding",
      title: "11:30 AM • TRẠNG THÁI DEEP WORK",
      sub: "11:30 AM: Bước vào trạng thái Deep Work. Bật tai nghe chống ồn, từng dòng code tuôn trào theo tiếng phím cơ.",
      prompt: "Close-up hands typing on mechanical keyboard, dual monitors with dark VS Code, neon glows",
      render: function (ctx, t, progress, W, H) {
        const img = getDevImage('scene3');
        drawKenBurns(ctx, img, progress, W, H, 1.0, 1.1, 0, -18);
        drawVignette(ctx, W, H, 0.55);

        // Flowing cyber code lines
        drawCodeParticles(ctx, t, W, H);

        // Neon cyan edge glow
        const glow = ctx.createLinearGradient(0, H - 200, 0, H);
        glow.addColorStop(0, 'rgba(6, 182, 212, 0)');
        glow.addColorStop(1, 'rgba(6, 182, 212, 0.22)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, H - 200, W, 200);
      }
    },
    {
      id: 3,
      startTime: 30,
      duration: 10,
      timeTag: "02:00 PM",
      cardTitle: "4. 2:00 PM Ác Mộng Bug 500",
      title: "2:00 PM • CƠN ÁC MỘNG SERVER ERROR 500",
      sub: '2:00 PM: Cơn ác mộng xuất hiện: "Ở máy em vẫn chạy bình thường, sao lên server lại lỗi 500?!"',
      prompt: "Frustrated developer staring at red error logs, intense dramatic mood",
      render: function (ctx, t, progress, W, H) {
        const img = getDevImage('scene4');

        // Dramatic camera pulse
        const shake = Math.sin(t * 18) * (progress < 0.3 ? 3 : 0.8);
        drawKenBurns(ctx, img, progress, W, H, 1.05, 1.12, shake, 0);
        drawVignette(ctx, W, H, 0.65);

        // Red alert pulsating scanlines
        const pulse = 0.15 + Math.sin(t * 8) * 0.08;
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.fillRect(0, 0, W, H);

        // Error message badge
        ctx.save();
        ctx.font = '800 24px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f87171';
        ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
        ctx.shadowBlur = 12;
        ctx.fillText('⚠ HTTP 500: INTERNAL SERVER ERROR — UNHANDLED PROMISE REJECTION', W / 2, 140);
        ctx.restore();
      }
    },
    {
      id: 4,
      startTime: 40,
      duration: 10,
      timeTag: "05:30 PM",
      cardTitle: "5. 5:30 PM Deploy Thành Công",
      title: "5:30 PM • CI/CD BÁO XANH TOÀN BỘ!",
      sub: "5:30 PM: Sau 3 tiếng debug toát mồ hôi, cuối cùng bug đã biến mất. Hệ thống CI/CD báo xanh toàn bộ!",
      prompt: 'Triumphant programmer celebrating, screen glowing with green "Deploy Success", confetti particles',
      render: function (ctx, t, progress, W, H) {
        const img = getDevImage('scene5');
        drawKenBurns(ctx, img, progress, W, H, 1.0, 1.09, 0, 10);
        drawVignette(ctx, W, H, 0.45);

        // Radiant green aura
        const greenGlow = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.7);
        greenGlow.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
        greenGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = greenGlow;
        ctx.fillRect(0, 0, W, H);

        // Floating celebratory confetti
        drawConfetti(ctx, t, W, H);

        // Success Badge
        ctx.save();
        ctx.font = '900 28px "Montserrat", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = 'rgba(52, 211, 153, 0.9)';
        ctx.shadowBlur = 15;
        ctx.fillText('✓ PIPELINE PASSED • DEPLOYED TO PRODUCTION SUCCESSFULLY', W / 2, 140);
        ctx.restore();
      }
    },
    {
      id: 5,
      startTime: 50,
      duration: 10,
      timeTag: "07:00 PM",
      cardTitle: "6. 7:00 PM Hoàng Hôn Thành Phố",
      title: "7:00 PM • GẬP MÁY & TỰ HÀO",
      sub: "7:00 PM: Gập máy lại, ngắm nhìn hoàng hôn thành phố. Một ngày mệt mỏi nhưng đầy tự hào của một Dev.",
      prompt: "Silhouette of programmer standing by glass window overlooking night city skyline at twilight",
      render: function (ctx, t, progress, W, H) {
        const img = getDevImage('scene6');
        drawKenBurns(ctx, img, progress, W, H, 1.1, 1.0, -15, -10);
        drawVignette(ctx, W, H, 0.52);

        // Twilight purple & amber gradient
        const twilight = ctx.createLinearGradient(0, 0, 0, H);
        twilight.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
        twilight.addColorStop(0.6, 'rgba(245, 158, 11, 0.1)');
        twilight.addColorStop(1, 'rgba(15, 23, 42, 0.35)');
        ctx.fillStyle = twilight;
        ctx.fillRect(0, 0, W, H);

        // Twinkling stars / city bokeh
        ctx.save();
        for (let i = 0; i < 25; i++) {
          const bx = ((i * 83) % W);
          const by = ((i * 59) % (H * 0.6));
          const bAlpha = 0.3 + Math.sin(t * 4 + i) * 0.25;
          ctx.fillStyle = `rgba(253, 224, 71, ${bAlpha})`;
          ctx.beginPath();
          ctx.arc(bx, by, 1.5 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  ];

  /**
   * Vẽ Thanh Đồng Hồ Thời Gian Cố Định ở góc trên cùng
   */
  function drawTimeBadge(ctx, globalTime, W, H) {
    const scIdx = Math.min(scenes.length - 1, Math.floor(globalTime / 10));
    const sc = scenes[scIdx];
    if (!sc) return;

    ctx.save();
    // Glassmorphism Time Pill
    const pillW = 220;
    const pillH = 46;
    const pillX = W / 2 - pillW / 2;
    const pillY = 50;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;

    // Rounded rectangle
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 23);
    ctx.fill();
    ctx.stroke();

    // Time text
    ctx.fillStyle = '#F2C94C';
    ctx.font = '800 22px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🕒 ${sc.timeTag}`, W / 2, pillY + pillH / 2);
    ctx.restore();
  }

  // Export Project Configuration
  window.PROJECT_1_DAY_LIFE_DEV = {
    id: "1_day_life_dev",
    meta: {
      badge: "Cuộc Sống Lập Trình Viên • 60 Giây • 1920x1080 (16:9)",
      title: "1 NGÀY CỦA LẬP TRÌNH VIÊN (60S)",
      subtitle: "Từ tách cà phê sáng, daily standup, deep work, bug 500, deploy thành công đến hoàng hôn",
      defaultVoice: "nam_minh",
      defaultMusic: "synthwave",
      duration: 60
    },
    scenes: scenes,
    drawYearBar: drawTimeBadge
  };
})();

