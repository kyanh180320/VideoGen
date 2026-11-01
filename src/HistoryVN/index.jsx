import React from 'react';
import { Sequence } from 'remotion';
import { Scene1 } from './Scene1';
import { Scene2 } from './Scene2';
import { Scene3 } from './Scene3';
import { Scene4 } from './Scene4';
import { Scene5 } from './Scene5';
import { Scene6 } from './Scene6';
import { Scene7 } from './Scene7';
import { YearBar } from './YearBar';

export const HistoryVNVideo = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: 1920,
        height: 1080,
        backgroundColor: '#8B1A1A',
        overflow: 'hidden',
      }}
    >
      {/* CẢNH 1: 0–4s (Frames 0–120) */}
      <Sequence
        from={0}
        durationInFrames={120}
        name="1. Văn Lang (-2879)"
        style={{
          scale: 0.988
        }}
      >
        <Scene1 />
      </Sequence>

      {/* CẢNH 2: 4–8s (Frames 120–240) */}
      <Sequence from={120} durationInFrames={120} name="2. Bắc Thuộc & Khởi Nghĩa (111 TCN - 938)">
        <Scene2 />
      </Sequence>

      {/* CẢNH 3: 8–12s (Frames 240–360) */}
      <Sequence from={240} durationInFrames={120} name="3. Bạch Đằng 938 (938)">
        <Scene3 />
      </Sequence>

      {/* CẢNH 4: 12–16s (Frames 360–480) */}
      <Sequence from={360} durationInFrames={120} name="4. Thăng Long (1010 - 1288)">
        <Scene4 />
      </Sequence>

      {/* CẢNH 5: 16–20s (Frames 480–600) */}
      <Sequence from={480} durationInFrames={120} name="5. Mở Cõi Lê Lợi - Quang Trung (1428 - 1789)">
        <Scene5 />
      </Sequence>

      {/* CẢNH 6: 20–25s (Frames 600–750) */}
      <Sequence from={600} durationInFrames={150} name="6. Độc Lập 2/9/1945 (1945)">
        <Scene6 />
      </Sequence>

      {/* CẢNH 7: 25–30s (Frames 750–900) */}
      <Sequence from={750} durationInFrames={150} name="7. Thống Nhất & Toàn Cầu (1975 - 2026)">
        <Scene7 />
      </Sequence>

      {/* THANH NĂM CỐ ĐỊNH CHẠY TOÀN BỘ 30 GIÂY */}
      <YearBar />
    </div>
  );
};

