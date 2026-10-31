/**
 * ========================================================
 * DỰ ÁN VIDEO 30 GIÂY: LỊCH SỬ VIỆT NAM (1920x1080, 30FPS)
 * Điều khiển bởi 1 Timeline GSAP chính, kết nối 7 scenes
 * Tuân thủ nghiêm ngặt 100% tài liệu mô tả chi tiết của người dùng
 * ========================================================
 */

(function() {
  const scenes = [
    {
      id: 0,
      startTime: 0,
      duration: 4,
      cardTitle: "1. Văn Lang (-2879)",
      title: "VĂN LANG • -2879 TCN",
      sub: "Từ thuở Hồng Bàng, nước Văn Lang ra đời bên dòng sông Hồng.",
      render: function(ctx, t, progress, W, H) {
        if (window.HistoryVN_Scene1) {
          window.HistoryVN_Scene1.render(ctx, t, W, H);
        }
      }
    },
    {
      id: 1,
      startTime: 4,
      duration: 4,
      cardTitle: "2. Bắc Thuộc (111 TCN - 938)",
      title: "KHỞI NGHĨA PHÁ XIỀNG XÍCH",
      sub: "Hơn một nghìn năm Bắc thuộc, người Việt chưa bao giờ ngừng đứng lên.",
      render: function(ctx, t, progress, W, H) {
        if (window.HistoryVN_Scene2) {
          window.HistoryVN_Scene2.render(ctx, t, W, H);
        }
      }
    },
    {
      id: 2,
      startTime: 8,
      duration: 4,
      cardTitle: "3. Bạch Đằng (938)",
      title: "BẠCH ĐẰNG 938",
      sub: "Năm 938, Ngô Quyền đại thắng Bạch Đằng, mở ra kỷ nguyên độc lập.",
      render: function(ctx, t, progress, W, H) {
        if (window.HistoryVN_Scene3) {
          window.HistoryVN_Scene3.render(ctx, t, W, H);
        }
      }
    },
    {
      id: 3,
      startTime: 12,
      duration: 4,
      cardTitle: "4. Thăng Long (1010 - 1288)",
      title: "THĂNG LONG 1010",
      sub: "Lý, Trần dời đô về Thăng Long, ba lần đánh bại quân Nguyên Mông.",
      render: function(ctx, t, progress, W, H) {
        if (window.HistoryVN_Scene4) {
          window.HistoryVN_Scene4.render(ctx, t, W, H);
        }
      }
    },
    {
      id: 4,
      startTime: 16,
      duration: 4,
      cardTitle: "5. Mở Cõi (1428 - 1789)",
      title: "LÊ LỢI - QUANG TRUNG",
      sub: "Lê Lợi, Quang Trung nối tiếp, giữ vững bờ cõi.",
      render: function(ctx, t, progress, W, H) {
        if (window.HistoryVN_Scene5) {
          window.HistoryVN_Scene5.render(ctx, t, W, H);
        }
      }
    },
    {
      id: 5,
      startTime: 20,
      duration: 5,
      cardTitle: "6. Độc Lập (2/9/1945)",
      title: "2/9/1945",
      sub: "Hơn tám mươi năm bị đô hộ, ngày 2 tháng 9 năm 1945, Bác Hồ đọc Tuyên ngôn Độc lập.",
      render: function(ctx, t, progress, W, H) {
        if (window.HistoryVN_Scene6) {
          window.HistoryVN_Scene6.render(ctx, t, W, H);
        }
      }
    },
    {
      id: 6,
      startTime: 25,
      duration: 5,
      cardTitle: "7. Thống Nhất & Toàn Cầu (1975 - 2026)",
      title: "VIỆT NAM",
      sub: "Đất nước thống nhất năm 1975, đổi mới năm 1986, và hôm nay Việt Nam vươn mình ra thế giới.",
      render: function(ctx, t, progress, W, H) {
        if (window.HistoryVN_Scene7) {
          window.HistoryVN_Scene7.render(ctx, t, W, H);
        }
      }
    }
  ];

  /**
   * Vẽ Thanh Năm cố định ở y = 960–1080 (chữ 72px, căn giữa x = 960)
   * Luôn khớp cảnh đang chiếu theo đúng mô tả
   */
  function drawFixedYearBar(ctx, globalTime, W, H) {
    let yearText = "";
    let scale = 1.0;
    let blinkAlpha = 1.0;

    if (globalTime < 4) {
      if (window.HistoryVN_Scene1) yearText = window.HistoryVN_Scene1.getYearText(globalTime);
    } else if (globalTime < 8) {
      if (window.HistoryVN_Scene2) yearText = window.HistoryVN_Scene2.getYearText(globalTime);
    } else if (globalTime < 12) {
      if (window.HistoryVN_Scene3) {
        yearText = window.HistoryVN_Scene3.getYearText(globalTime);
        // Nhấp sáng nhẹ một lần lúc 11s (11.0 - 11.4s)
        if (globalTime >= 11.0 && globalTime <= 11.4) {
          const bp = (globalTime - 11.0) / 0.4;
          blinkAlpha = 0.5 + Math.sin(bp * Math.PI) * 0.5;
        }
      }
    } else if (globalTime < 16) {
      if (window.HistoryVN_Scene4) yearText = window.HistoryVN_Scene4.getYearText(globalTime);
    } else if (globalTime < 20) {
      if (window.HistoryVN_Scene5) yearText = window.HistoryVN_Scene5.getYearText(globalTime);
    } else if (globalTime < 25) {
      if (window.HistoryVN_Scene6) {
        yearText = window.HistoryVN_Scene6.getYearText(globalTime);
        if (window.HistoryVN_Scene6.getYearScale) {
          scale = window.HistoryVN_Scene6.getYearScale(globalTime);
        }
      }
    } else {
      if (window.HistoryVN_Scene7) yearText = window.HistoryVN_Scene7.getYearText(globalTime);
    }

    if (!yearText) return;

    ctx.save();
    // Vùng thanh năm cố định y = 960 đến 1080
    const barCenterY = 1020;

    ctx.translate(960, barCenterY);
    ctx.scale(scale, scale);
    ctx.globalAlpha = blinkAlpha;

    ctx.fillStyle = '#F2C94C';
    ctx.font = '900 72px "Playfair Display", "Be Vietnam Pro", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.fillText(yearText, 0, 0);

    ctx.restore();
  }

  window.PROJECT_HISTORY_VN = {
    id: "history_vn",
    meta: {
      badge: "Lịch Sử Việt Nam • 30 Giây • 1920x1080 (16:9)",
      title: "LỊCH SỬ VIỆT NAM (30 GIÂY)",
      subtitle: "Từ Văn Lang, Ngô Quyền, Thăng Long, Lê Lợi - Quang Trung đến 2/9/1945 và Đổi Mới",
      defaultVoice: "nam_tram",
      defaultMusic: "patriotic",
      duration: 30
    },
    scenes: scenes,
    drawYearBar: drawFixedYearBar
  };
})();
