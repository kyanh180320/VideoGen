/**
 * ========================================================
 * DỮ LIỆU BẢN ĐỒ VIỆT NAM RÚT GỌN (DƯỚI 200 ĐIỂM)
 * Chuẩn khung 600 x 800, tối ưu cho 30fps
 * ========================================================
 */

window.VN_MAP_DATA = (function() {
  // Tọa độ chuẩn của đường viền Việt Nam hình chữ S (115 điểm)
  // Trong khung chuẩn W = 600, H = 800
  const mainlandPoints = [
    [160, 45], [195, 30], [240, 20], [275, 25], [305, 45], [335, 70], [365, 85], [410, 105], [445, 125], // Hà Giang - Cao Bằng - Lạng Sơn
    [455, 150], [435, 175], [395, 185], [370, 205], [350, 235], // Quảng Ninh - Hải Phòng
    [335, 265], [320, 290], [300, 315], [290, 345], [295, 380], // Ninh Bình - Thanh Hóa - Nghệ An
    [315, 410], // VĨ TUYẾN 17 (Bến Hải - Quảng Trị)
    [340, 440], [370, 465], [395, 490], [420, 520], [440, 560], // Huế - Đà Nẵng - Quảng Nam - Quảng Ngãi
    [455, 600], [460, 640], [450, 675], [430, 700], [395, 730], // Bình Định - Phú Yên - Khánh Hòa - Bình Thuận
    [360, 755], [315, 780], [275, 795], [240, 790], [215, 775], // Bà Rịa - Bến Tre - Trà Vinh - Cà Mau (Mũi Cà Mau)
    [195, 750], [185, 720], [190, 690], [210, 670], [240, 655], // Kiên Giang - Rạch Giá - Hà Tiên
    [265, 630], [285, 590], [295, 550], [280, 520], [260, 480], // Biên giới Tây Nam (Tây Ninh - Bình Phước)
    [250, 450], [245, 420], [240, 390], [225, 360], [200, 330], // Tây Nguyên - Kon Tum - Gia Lai
    [185, 290], [165, 250], [145, 210], [130, 165], [120, 120], // Hà Tĩnh - Nghệ An - Thanh Hóa (biên giới Lào)
    [115, 90], [125, 65], [140, 50], [160, 45] // Điện Biên - Lai Châu - khép kín
  ];

  function getSvgPath(points) {
    if (!points || points.length === 0) return '';
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i][0]} ${points[i][1]}`;
    }
    return d + ' Z';
  }

  // Tách 2 nửa Bắc - Nam tại Vĩ tuyến 17 (y = 410)
  const northPoints = mainlandPoints.filter(p => p[1] <= 412);
  northPoints.push([315, 410], [245, 410]); // Nối đáy vĩ tuyến 17

  const southPoints = mainlandPoints.filter(p => p[1] >= 408);
  southPoints.unshift([245, 410], [315, 410]); // Nối đỉnh vĩ tuyến 17

  // Sông Hồng (8 điểm từ Lào Cai qua Phú Thọ, Hà Nội xuống Nam Định)
  const redRiverPoints = [
    [155, 60],   // Lào Cai
    [190, 100],  // Yên Bái
    [225, 145],  // Phú Thọ
    [255, 175],  // Vĩnh Phúc / Sơn Tây
    [280, 195],  // Hà Nội
    [310, 220],  // Hưng Yên
    [330, 245],  // Thái Bình
    [345, 270]   // Cửa Ba Lạt (Nam Định)
  ];

  // Tọa độ các điểm mốc quan trọng
  const landmarks = {
    phuTho: { x: 225, y: 145 },
    haNoi: { x: 280, y: 195 },
    thangLong: { x: 280, y: 195 },
    bachDang: { x: 375, y: 190 },
    hue: { x: 335, y: 445 },
    saiGon: { x: 310, y: 710 },
    caMau: { x: 215, y: 775 }
  };

  // Tạo danh sách ~100 chấm sáng thành phố trải từ Bắc xuống Nam
  const cityDots = [];
  for (let i = 0; i < 100; i++) {
    const t = i / 99; // từ 0 (Bắc) đến 1 (Nam)
    // Nội suy dọc theo đường xương sống chữ S
    let cx, cy;
    if (t < 0.25) {
      // Miền Bắc
      const p = t / 0.25;
      cx = 180 + p * 120 + (Math.sin(i * 1.5) * 45);
      cy = 50 + p * 180 + (Math.cos(i * 1.8) * 35);
    } else if (t < 0.6) {
      // Miền Trung hẹp
      const p = (t - 0.25) / 0.35;
      cx = 290 + p * 140 + (Math.sin(i * 2.2) * 25);
      cy = 230 + p * 300;
    } else {
      // Miền Nam nở rộng
      const p = (t - 0.6) / 0.4;
      cx = 400 - p * 180 + (Math.sin(i * 1.7) * 40);
      cy = 530 + p * 230;
    }
    cityDots.push({ x: cx, y: cy, id: i });
  }

  return {
    mainlandPoints,
    fullPath: getSvgPath(mainlandPoints),
    northPath: getSvgPath(northPoints),
    southPath: getSvgPath(southPoints),
    redRiverPoints,
    landmarks,
    cityDots
  };
})();

