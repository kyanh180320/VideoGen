# HƯỚNG DẪN TẠO VIDEO MỚI TỪ PROMPT (VIDEO AI ARCHITECTURE)

Hệ thống đã được module hóa hoàn toàn thành 2 tầng độc lập:
1. **Core Video Engine (Dùng chung 100%):**
   - [`core/engine.js`](file:///c:/Users/kyanh/OneDrive/Documents/VideoAI/core/engine.js): Bộ điều khiển Timeline động (Zero dead-air), WSOLA đổi giọng (8 giọng Việt), 4 thể loại nhạc nền synth, xuất video Full HD 1080p chạy ngầm êm ru, tự động ngắt dòng và khắc phụ đề Canvas.
   - [`core/graphics.js`](file:///c:/Users/kyanh/OneDrive/Documents/VideoAI/core/graphics.js): Thư viện hạt particle, tia sáng light rays, sao trời, vignette, text subtitle badge, hiệu ứng camera zoom/pan.
   - [`core/styles.css`](file:///c:/Users/kyanh/OneDrive/Documents/VideoAI/core/styles.css): Giao diện Video Studio 16:9 chuẩn mực.

2. **Dự án Nội dung (Chỉ thay đổi file này khi nhập Prompt mới):**
   - Nằm trong thư mục `projects/<tên_dự_án>/`
   - Gồm 2 file cực kỳ gọn gàng:
     1. `storyboard.js`: Cấu hình danh sách cảnh (tiêu đề, phụ đề, màu sắc, hình minh họa).
     2. `voice_assets.js`: Chứa âm thanh lồng tiếng Base64 cho từng câu.

---

## Cấu Trúc Chuẩn Của File `storyboard.js` Khi Nhập Prompt Mới

Khi bạn nhập một prompt mới, AI chỉ cần sinh ra cấu trúc dữ liệu sau:

```javascript
window.VIDEO_PROJECT = {
  id: "chu_de_video",
  meta: {
    badge: "Chủ Đề • Video 16:9",
    title: "TIÊU ĐỀ VIDEO VIẾT HOA",
    subtitle: "Mô tả ngắn gọn về nội dung video",
    defaultVoice: "nam_minh",  // hoặc nu_chuan, nam_tram, nu_truyen_cam...
    defaultMusic: "zimmer"     // zimmer, patriotic, emotional, synthwave, none
  },
  scenes: [
    {
      id: 0,
      cardTitle: "1. Mở đầu",
      title: "TIÊU ĐỀ CẢNH 1",
      sub: "Nội dung câu lồng tiếng và phụ đề tiếng Việt của cảnh 1.",
      baseSec: 8.0, // Thời lượng ước lượng (sẽ tự co giãn theo giọng đọc)
      visual: {
        bgGradient: ['#0f172a', '#1e293b', '#020617'], // Màu nền chuyển sắc
        particleColor: 'rgba(245, 158, 11, 0.6)'
      },
      // Tùy chọn: Hàm vẽ hình minh họa riêng cho cảnh (nếu không có, Engine tự vẽ đồ họa trừu tượng)
      render: function(ctx, t, progress, W, H, particles) {
        // Code vẽ hình canvas 2D riêng của cảnh này
      }
    },
    // Thêm bao nhiêu cảnh tùy thích (3, 4, 5, 8 cảnh...)
  ]
};
```

---

## Cách Chuyển Đổi Sang Dự Án Mới
Trong file [`index.html`](file:///c:/Users/kyanh/OneDrive/Documents/VideoAI/index.html), bạn chỉ cần thay đổi 2 dòng import:

```html
<!-- Nạp dự án bạn muốn phát: -->
<script src="projects/ten_du_an_moi/voice_assets.js"></script>
<script src="projects/ten_du_an_moi/storyboard.js"></script>
```

Và gọi:
```javascript
VideoEngine.loadProject(window.VIDEO_PROJECT);
```
Toàn bộ timeline, số lượng thẻ cảnh bên dưới, tiêu đề, phụ đề, giọng đọc, và tính năng xuất video 1080p sẽ tự động thích ứng với dự án mới mà không cần sửa một dòng code nào của Engine!

