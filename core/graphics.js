/**
 * ========================================================
 * VIDEO AI - HIGH-END CINEMATIC GRAPHICS & SHADER ENGINE
 * Đồ họa 3D Projection, Volumetric Lighting, Embers & Parallax
 * ========================================================
 */

window.VideoGraphics = (function() {
  const sceneRenderers = {};

  /* ========================================================
     1. GSAP-GRADE EASING EQUATIONS (BỘ TOÁN CHUYỂN ĐỘNG GIA TỐC)
     ======================================================== */
  const Easing = {
    linear: t => t,
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutQuad: t => 1 - (1 - t) * (1 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeOutBack: (t, overshoot = 1.7) => {
      const c1 = overshoot;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeOutElastic: t => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    }
  };

  /* ========================================================
     2. 2.5D KEN BURNS PARALLAX CAMERA ENGINE
     ======================================================== */
  function getCameraTransform(cameraMode = 'zoom_in', progress = 0, W = 1920, H = 1080) {
    const p = Math.max(0, Math.min(1, progress));
    const smoothP = Easing.easeInOutQuad(p);

    let scale = 1.0;
    let panX = 0;
    let panY = 0;

    switch (cameraMode) {
      case 'zoom_in':
        scale = 1.0 + smoothP * 0.15;
        panY = -smoothP * 30;
        break;
      case 'zoom_out':
        scale = 1.18 - smoothP * 0.14;
        panY = smoothP * 25;
        break;
      case 'pan_left':
        scale = 1.08 + smoothP * 0.08;
        panX = (0.5 - smoothP) * 140;
        panY = -smoothP * 20;
        break;
      case 'pan_right':
        scale = 1.08 + smoothP * 0.08;
        panX = (smoothP - 0.5) * 140;
        panY = -smoothP * 20;
        break;
      case 'dramatic_push':
        scale = 1.0 + Easing.easeOutCubic(p) * 0.25;
        panY = -Easing.easeOutCubic(p) * 45;
        break;
      default:
        scale = 1.0 + smoothP * 0.1;
        break;
    }

    return { scale, panX, panY };
  }

  /* ========================================================
     3. HỆ THỐNG HẠT, TÀN LỬA RỰC RỠ & BỤI VÀNG VŨ TRỤ
     ======================================================== */
  function createParticleSystem(count = 120, width = 1920, height = 1080) {
    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1.2,
      speedX: (Math.random() - 0.5) * 1.2,
      speedY: -Math.random() * 1.5 - 0.3, // Bay bốc dần lên
      depth: Math.random() * 0.8 + 0.4,
      pulse: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 2 + 1,
      baseColor: Math.random() > 0.3 ? 'gold' : 'amber'
    }));
  }

  function updateParticles(particles, width = 1920, height = 1080) {
    particles.forEach(p => {
      p.x += (p.speedX + Math.sin(p.pulse * p.wobbleSpeed) * 0.4) * p.depth;
      p.y += p.speedY * p.depth;
      p.pulse += 0.04;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    });
  }

  // Vẽ tàn lửa / bụi vàng phát sáng đa tầng với Screen Blending
  function drawParticles(ctx, particles, type = 'gold') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    particles.forEach(p => {
      const alpha = 0.4 + Math.sin(p.pulse) * 0.35;
      const sz = p.size * p.depth;

      // Hào quang mềm quanh hạt
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 3.5);
      if (type === 'fire' || p.baseColor === 'amber') {
        glow.addColorStop(0, `rgba(254, 240, 138, ${alpha})`);
        glow.addColorStop(0.4, `rgba(245, 158, 11, ${alpha * 0.7})`);
        glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (type === 'stars') {
        glow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        glow.addColorStop(0.4, `rgba(147, 197, 253, ${alpha * 0.6})`);
        glow.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else {
        glow.addColorStop(0, `rgba(254, 243, 199, ${alpha})`);
        glow.addColorStop(0.4, `rgba(245, 158, 11, ${alpha * 0.7})`);
        glow.addColorStop(1, 'rgba(180, 83, 9, 0)');
      }

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, sz * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Tâm hạt sáng chói
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha + 0.3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, sz * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /* ========================================================
     4. VOLUMETRIC GOD-RAYS & VỆT SÁNG PHIM ĐIỆN ẢNH (LIGHT LEAKS)
     ======================================================== */
  function drawVolumetricGodRays(ctx, W, H, originX, originY, t = 0, color = 'rgba(245, 158, 11, 0.12)') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(originX, originY);

    const rays = 16;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2 + Math.sin(t * 0.2 + i) * 0.15;
      const rayWidth = 60 + Math.sin(t * 0.5 + i * 2) * 25;
      const rayLen = Math.max(W, H) * 1.6;

      ctx.save();
      ctx.rotate(angle);
      const grad = ctx.createLinearGradient(0, 0, rayLen, 0);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, color.replace(/[\d\.]+\)$/, '0.04)'));
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -rayWidth * 0.2);
      ctx.lineTo(rayLen, -rayWidth);
      ctx.lineTo(rayLen, rayWidth);
      ctx.lineTo(0, rayWidth * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Tâm phát sáng chói
    const centerFlare = ctx.createRadialGradient(0, 0, 10, 0, 0, 320);
    centerFlare.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    centerFlare.addColorStop(0.3, color);
    centerFlare.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = centerFlare;
    ctx.beginPath();
    ctx.arc(0, 0, 320, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Hiệu ứng Light Leak quang học rực rỡ ở 2 mép khung hình
  function drawCinematicLightLeaks(ctx, W, H, t = 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Đốm sáng cam ấm trôi dạt góc trên trái
    const x1 = Math.sin(t * 0.3) * 150 + 100;
    const y1 = Math.cos(t * 0.25) * 120 + 80;
    const leak1 = ctx.createRadialGradient(x1, y1, 20, x1, y1, 650);
    leak1.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
    leak1.addColorStop(0.5, 'rgba(234, 88, 12, 0.15)');
    leak1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leak1;
    ctx.fillRect(0, 0, W * 0.7, H * 0.7);

    // Đốm sáng xanh cyan trôi dạt góc dưới phải
    const x2 = W - (Math.cos(t * 0.28) * 120 + 80);
    const y2 = H - (Math.sin(t * 0.32) * 100 + 80);
    const leak2 = ctx.createRadialGradient(x2, y2, 20, x2, y2, 580);
    leak2.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
    leak2.addColorStop(0.5, 'rgba(14, 165, 233, 0.1)');
    leak2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leak2;
    ctx.fillRect(W * 0.3, H * 0.3, W * 0.7, H * 0.7);

    ctx.restore();
  }

  // Vệt sáng ngang Anamorphic Cinema
  function drawAnamorphicFlare(ctx, W, Y, color = 'rgba(245, 158, 11, 0.35)', t = 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const flareGrad = ctx.createLinearGradient(0, Y, W, Y);
    flareGrad.addColorStop(0, 'rgba(0,0,0,0)');
    flareGrad.addColorStop(0.35, color.replace(/[\d\.]+\)$/, '0.1)'));
    flareGrad.addColorStop(0.5, color);
    flareGrad.addColorStop(0.65, color.replace(/[\d\.]+\)$/, '0.1)'));
    flareGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = flareGrad;
    const h = 5 + Math.sin(t * 4) * 2;
    ctx.fillRect(0, Y - h / 2, W, h);

    const centerGlow = ctx.createRadialGradient(W / 2, Y, 2, W / 2, Y, 160);
    centerGlow.addColorStop(0, '#ffffff');
    centerGlow.addColorStop(0.35, color);
    centerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(W / 2, Y, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ========================================================
     5. ĐỒ HỌA 3D TOÁN HỌC (TRUE 3D ROTATING HOLOGRAPHIC GLOBE)
     Chiếu tọa độ 3D hình cầu lên mặt phẳng 2D (Perspective Projection)
     ======================================================== */
  function draw3DHolographicGlobe(ctx, cx, cy, radius, rotY = 0, color = '#38bdf8') {
    ctx.save();
    ctx.translate(cx, cy);

    // Hào quang không khí xung quanh quả cầu
    const rimGlow = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 1.35);
    rimGlow.addColorStop(0, 'rgba(14, 165, 233, 0.05)');
    rimGlow.addColorStop(0.7, 'rgba(56, 189, 248, 0.3)');
    rimGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rimGlow;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Vành ngoài kim loại phát sáng
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Vẽ các đường Vĩ tuyến (Latitudes 3D)
    const latSteps = 6;
    for (let i = 1; i < latSteps; i++) {
      const latAngle = (i / latSteps - 0.5) * Math.PI;
      const y = Math.sin(latAngle) * radius;
      const rAtLat = Math.cos(latAngle) * radius;

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, y, rAtLat, rAtLat * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Vẽ các đường Kinh tuyến quay 3D (Longitudes 3D)
    const lonCount = 10;
    for (let j = 0; j < lonCount; j++) {
      const lonAngle = (j / lonCount) * Math.PI * 2 + rotY;
      const visible = Math.cos(lonAngle);
      const alpha = Math.max(0.1, 0.2 + visible * 0.4);

      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = visible > 0 ? 2 : 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.abs(Math.sin(lonAngle)) * radius, radius, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Các điểm trạm phát tín hiệu 3D nhấp nháy trên bề mặt
    const nodes = [
      { lat: 0.3, lon: 0.5 },
      { lat: -0.2, lon: 1.8 },
      { lat: 0.6, lon: 3.2 },
      { lat: -0.5, lon: 4.5 },
      { lat: 0.1, lon: 5.7 }
    ];

    nodes.forEach(n => {
      const currentLon = n.lon + rotY;
      const z = Math.cos(n.lat) * Math.cos(currentLon);
      if (z > 0) { // Chỉ vẽ khi nằm ở nửa bán cầu hướng về camera
        const x = Math.cos(n.lat) * Math.sin(currentLon) * radius;
        const y = Math.sin(n.lat) * radius;

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x, y, 4 * (1 + z * 0.5), 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 10 * (1 + z * 0.5), 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  /* ========================================================
     6. VÒNG QUAY CÔNG NGHỆ & LINH PHÙ HUYỀN ẢO (HOLOGRAPHIC HUD)
     ======================================================== */
  function drawHolographicHUD(ctx, cx, cy, radius, t = 0, color = '#f59e0b') {
    ctx.save();
    ctx.translate(cx, cy);

    // Vành 1: Xoay thuận chiều kim đồng hồ có vạch thước
    ctx.save();
    ctx.rotate(t * 0.25);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    const ticks = 36;
    for (let i = 0; i < ticks; i++) {
      const angle = (i / ticks) * Math.PI * 2;
      const len = i % 4 === 0 ? 14 : 7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (radius - len), Math.sin(angle) * (radius - len));
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      ctx.stroke();
    }
    ctx.restore();

    // Vành 2: Xoay ngược chiều kim đồng hồ với các cung đứt đoạn
    ctx.save();
    ctx.rotate(-t * 0.35);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = 4;
    for (let c = 0; c < 4; c++) {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.82, c * Math.PI * 0.5 + 0.1, (c + 1) * Math.PI * 0.5 - 0.2);
      ctx.stroke();
    }
    ctx.restore();

    // Vành 3: Lưới sao bát giác linh thiêng
    ctx.save();
    ctx.rotate(t * 0.12);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-radius * 0.5, -radius * 0.5, radius, radius);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-radius * 0.5, -radius * 0.5, radius, radius);
    ctx.restore();

    ctx.restore();
  }

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  function drawVignette(ctx, W, H, innerRatio = 0.45, outerRatio = 0.85, maxAlpha = 0.65) {
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * innerRatio, W / 2, H / 2, H * outerRatio);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, `rgba(0,0,0,${maxAlpha})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  /* ========================================================
     7. KINETIC TYPOGRAPHY & CHUYỂN CẢNH ĐIỆN ẢNH
     ======================================================== */
  function drawKineticTitle(ctx, title, centerX, topY, localTime = 1) {
    if (!title) return;
    ctx.save();

    const tIn = Math.min(1, Math.max(0, localTime / 0.8));
    const scale = Easing.easeOutBack(tIn, 1.4);
    const alpha = Math.min(1, localTime / 0.4);

    ctx.translate(centerX, topY);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    // Hào quang chữ điện ảnh
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
    ctx.shadowBlur = 18;
    ctx.fillText(title, 0, 0);

    // Chữ đè lên trên sắc nét
    ctx.shadowBlur = 0;
    ctx.fillText(title, 0, 0);

    // Thanh viền vàng nở ra từ tâm theo quán tính
    const lineP = Easing.easeOutCubic(tIn);
    const maxLineW = 420;
    const currentLineW = maxLineW * lineP;

    const lineGrad = ctx.createLinearGradient(-currentLineW / 2, 0, currentLineW / 2, 0);
    lineGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
    lineGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.95)');
    lineGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = lineGrad;
    ctx.fillRect(-currentLineW / 2, 16, currentLineW, 3.5);

    ctx.restore();
  }

  function drawCanvasSubtitle(ctx, text, centerX, bottomY, maxWidth = 1580, localTime = 1) {
    if (!text) return;
    ctx.save();

    const tSlide = Math.min(1, Math.max(0, localTime / 0.5));
    const slideOffset = (1 - Easing.easeOutCubic(tSlide)) * 26;
    const alpha = Math.min(1, localTime / 0.35);

    ctx.globalAlpha = alpha;
    ctx.font = '600 32px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 46;
    const paddingX = 42;
    const paddingY = 16;
    const totalTextHeight = lines.length * lineHeight;

    let maxLineWidth = 0;
    lines.forEach(l => {
      const w = ctx.measureText(l).width;
      if (w > maxLineWidth) maxLineWidth = w;
    });

    const boxWidth = Math.min(maxWidth + paddingX * 2, maxLineWidth + paddingX * 2);
    const boxHeight = totalTextHeight + paddingY * 2;
    const boxX = centerX - boxWidth / 2;
    const boxY = (bottomY - boxHeight) + slideOffset;
    const radius = Math.min(26, boxHeight / 2);

    // Kính mờ điện ảnh siêu mịn (Cinematic Frosted Glass)
    ctx.fillStyle = 'rgba(10, 14, 26, 0.92)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
    } else {
      ctx.moveTo(boxX + radius, boxY);
      ctx.lineTo(boxX + boxWidth - radius, boxY);
      ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
      ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
      ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
      ctx.lineTo(boxX + radius, boxY + boxHeight);
      ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
      ctx.lineTo(boxX, boxY + radius);
      ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    const startY = boxY + paddingY + lineHeight / 2;
    lines.forEach((line, idx) => {
      ctx.fillText(line, centerX, startY + idx * lineHeight);
    });

    ctx.restore();
  }

  // Bộ vẽ mặc định 2.5D Parallax với HUD và Ánh sáng thể tích
  function renderGenericScene(ctx, scene, localTime, progress, W, H, particles) {
    const bg = scene.visual && scene.visual.bgGradient
      ? scene.visual.bgGradient
      : ['#0f172a', '#1e293b', '#020617'];

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, bg[0]);
    bgGrad.addColorStop(0.5, bg[1] || bg[0]);
    bgGrad.addColorStop(1, bg[2] || bg[1] || bg[0]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    drawVolumetricGodRays(ctx, W, H, W * 0.5, H * 0.45, localTime, 'rgba(245, 158, 11, 0.12)');
    drawCinematicLightLeaks(ctx, W, H, localTime);

    if (particles) {
      drawParticles(ctx, particles, 'gold');
    }

    drawHolographicHUD(ctx, W * 0.5, H * 0.45, 220, localTime, '#f59e0b');
    drawAnamorphicFlare(ctx, W, H * 0.45, 'rgba(245, 158, 11, 0.4)', localTime);

    // Con số cảnh trung tâm phát sáng
    ctx.save();
    ctx.translate(W / 2, H * 0.45);
    ctx.font = '900 90px Cinzel, serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
    ctx.shadowBlur = 25;
    ctx.fillText(`${(scene.id !== undefined ? scene.id + 1 : 1)}`, 0, 0);
    ctx.restore();
  }

  return {
    Easing,
    getCameraTransform,
    createParticleSystem,
    updateParticles,
    drawParticles,
    drawVolumetricGodRays,
    drawCinematicLightLeaks,
    drawAnamorphicFlare,
    draw3DHolographicGlobe,
    drawHolographicHUD,
    drawStar,
    drawVignette,
    drawKineticTitle,
    drawCanvasSubtitle,
    renderGenericScene
  };
})();
