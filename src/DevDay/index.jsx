import { Audio as Audio2 } from '@remotion/media';
import React from 'react';
import { Sequence, Audio, staticFile } from 'remotion';
import { DevScene } from './Scene';

export const DevDayVideo = () => {
  // 6 scenes, each 10 seconds (300 frames @ 30fps), total 1800 frames (60s)
  const SCENE_FRAMES = 300;

  return (
    <>
      <div
        style={{
          position: 'relative',
          width: 1920,
          height: 1080,
          backgroundColor: '#0a0e17',
          overflow: 'hidden',
        }}
      >
        {/* CẢNH 1: 0–10s (Frames 0–300) */}
        <Sequence from={0} durationInFrames={SCENE_FRAMES} name="1. 07:00 AM Cà Phê Sáng">
          <DevScene
            imageSrc="dev_images/scene1.jpg"
            timeTag="07:00 AM • MORNING COFFEE"
            title="7:00 AM • TÁCH CÀ PHÊ & KHỞI ĐẦU NGÀY MỚI"
            subtitle="7:00 AM: Thức dậy bên tách cà phê thơm và mở chiếc máy tính quen thuộc bắt đầu ngày mới."
            accentColor="#f59e0b"
            zoomDirection="in"
          />
          <Audio src={staticFile('audio/scene1.mp3')} volume={0.9} />
        </Sequence>
      
        {/* CẢNH 2: 10–20s (Frames 300–600) */}
        <Sequence from={300} durationInFrames={SCENE_FRAMES} name="2. 09:00 AM Daily Standup">
          <DevScene
            imageSrc="dev_images/scene2.jpg"
            timeTag="09:00 AM • DAILY STANDUP"
            title="9:00 AM • DAILY STANDUP CÙNG TEAM"
            subtitle="9:00 AM: Cuộc họp Daily Standup quen thuộc, cả team thảo luận sôi nổi về các tính năng mới trong sprint."
            accentColor="#3b82f6"
            zoomDirection="out"
          />
          <Audio src={staticFile('audio/scene2.mp3')} volume={0.9} />
        </Sequence>
      
        {/* CẢNH 3: 20–30s (Frames 600–900) */}
        <Sequence from={600} durationInFrames={SCENE_FRAMES} name="3. 11:30 AM Deep Work">
          <DevScene
            imageSrc="dev_images/scene3.jpg"
            timeTag="11:30 AM • DEEP WORK CODING"
            title="11:30 AM • TRẠNG THÁI DEEP WORK"
            subtitle="11:30 AM: Bước vào trạng thái Deep Work. Bật tai nghe chống ồn, từng dòng code tuôn trào theo tiếng phím cơ."
            accentColor="#06b6d4"
            zoomDirection="in"
          />
          <Audio src={staticFile('audio/scene3.mp3')} volume={0.9} />
        </Sequence>
      
        {/* CẢNH 4: 30–40s (Frames 900–1200) */}
        <Sequence from={900} durationInFrames={SCENE_FRAMES} name="4. 02:00 PM Bug 500">
          <DevScene
            imageSrc="dev_images/scene4.jpg"
            timeTag="02:00 PM • ÁC MỘNG SERVER ERROR"
            title="2:00 PM • CƠN ÁC MỘNG SERVER ERROR 500"
            subtitle='2:00 PM: Cơn ác mộng xuất hiện: "Ở máy em vẫn chạy bình thường, sao lên server lại lỗi 500?!"'
            accentColor="#ef4444"
            zoomDirection="in"
            specialBadge={{
              text: '⚠ HTTP 500: INTERNAL SERVER ERROR',
              color: '#ef4444',
              bg: 'rgba(239, 68, 68, 0.25)',
            }}
          />
          <Audio src={staticFile('audio/scene4.mp3')} volume={0.9} />
        </Sequence>
      
        {/* CẢNH 5: 40–50s (Frames 1200–1500) */}
        <Sequence from={1200} durationInFrames={SCENE_FRAMES} name="5. 05:30 PM Deploy Thành Công">
          <DevScene
            imageSrc="dev_images/scene5.jpg"
            timeTag="05:30 PM • CI/CD DEPLOY SUCCESS"
            title="5:30 PM • CI/CD BÁO XANH TOÀN BỘ!"
            subtitle="5:30 PM: Sau 3 tiếng debug toát mồ hôi, cuối cùng bug đã biến mất. Hệ thống CI/CD báo xanh toàn bộ!"
            accentColor="#10b981"
            zoomDirection="in"
            specialBadge={{
              text: '✓ CI/CD PIPELINE PASSED • DEPLOY SUCCESSFUL',
              color: '#10b981',
              bg: 'rgba(16, 185, 129, 0.25)',
            }}
          />
          <Audio src={staticFile('audio/scene5.mp3')} volume={0.9} />
        </Sequence>
      
        {/* CẢNH 6: 50–60s (Frames 1500–1800) */}
        <Sequence from={1500} durationInFrames={SCENE_FRAMES} name="6. 07:00 PM Hoàng Hôn & Tự Hào">
          <DevScene
            imageSrc="dev_images/scene6.jpg"
            timeTag="07:00 PM • TWILIGHT REFLECTION"
            title="7:00 PM • GẬP MÁY & TỰ HÀO"
            subtitle="7:00 PM: Gập máy lại, ngắm nhìn hoàng hôn thành phố. Một ngày mệt mỏi nhưng đầy tự hào của một Dev."
            accentColor="#F2C94C"
            zoomDirection="out"
          />
          <Audio src={staticFile('audio/scene6.mp3')} volume={0.9} />
        </Sequence>
      </div>
      <Audio2
        src={staticFile(
          'audio/ElevenLabs_2026-11-01T18_09_56_Tung Dang - Deep, Warm and Resonant_pvc_sp91_s96_sb63_v4.mp3'
        )}
        durationInFrames={1296.98}
      />
    </>
  );
};
