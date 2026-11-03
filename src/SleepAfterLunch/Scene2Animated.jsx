import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const Scene2Animated = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 1. Tiêu đề "ĐỒNG HỒ SINH HỌC" - Dập lò xo từ trên xuống (Frame 0 -> 22)
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 180, mass: 0.7 },
  });
  const titleY = interpolate(titleSpring, [0, 1], [-70, 0]);
  const titleScale = interpolate(titleSpring, [0, 1], [0.88, 1]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // 2. Nhân vật que suy nghĩ ("HỪM...") - Trồi mượt mà từ dưới lên khi đọc "Nhưng sự thật còn lạ hơn nhiều..."
  // Bắt đầu từ Frame 6
  const charSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 13, stiffness: 120, mass: 0.85 },
  });
  const charY = interpolate(charSpring, [0, 1], [420, 0]);
  const charOpacity = interpolate(charSpring, [0, 1], [0, 1]);

  // Nhịp thở / lắc lư nhẹ tự nhiên
  const charIdleY = frame > 35 ? Math.sin((frame - 35) * 0.08) * 4 : 0;

  // 3. Chiếc đồng hồ sinh học - Nảy lò xo scale 0 -> 1 khi giọng đọc nhắc "...chiếc đồng hồ sinh học bên trong"
  // Xuất hiện từ Frame 65 (~2.15 giây)
  const clockFrame = Math.max(0, frame - 65);
  const clockSpring = spring({
    frame: clockFrame,
    fps,
    config: { damping: 9, stiffness: 130, mass: 0.75 },
  });
  const clockScale = frame < 65 ? 0 : interpolate(clockSpring, [0, 1], [0, 1]);
  const clockRotate = frame < 65 ? -20 : interpolate(clockSpring, [0, 0.7, 1], [-20, 6, 0]);

  // Nhịp lắc lư nhẹ kiểu quả lắc đồng hồ sau khi xuất hiện
  const clockIdleRotate = frame > 95 ? Math.sin((frame - 95) * 0.1) * 2.2 : 0;

  // Fade out mượt 6 frame cuối để chuyển cảnh sang Scene 3
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        opacity: fadeOut,
      }}
    >
      {/* Lớp 1: Tiêu đề chữ đỏ vẽ tay "ĐỒNG HỒ SINH HỌC" */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: `translateX(-50%) translateY(${titleY}px) scale(${titleScale})`,
          opacity: titleOpacity,
          zIndex: 10,
        }}
      >
        <Img
          src={staticFile('sleep_images/scene_02_layers/title.png')}
          style={{
            height: 180,
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Lớp 2: Người que đứng suy nghĩ + bong bóng "HỪM..." (Asset vẽ mới 100% cực nét) */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 200,
          transform: `translateY(${charY + charIdleY}px)`,
          opacity: charOpacity,
          transformOrigin: 'bottom center',
          zIndex: 5,
        }}
      >
        <Img
          src={staticFile('sleep_images/scene_02_layers/character_clean.png')}
          style={{
            height: 780,
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Lớp 3: Chiếc đồng hồ buồn ngủ (Asset vẽ mới 100% cô lập, nảy lò xo scale 0 -> 1) */}
      <div
        style={{
          position: 'absolute',
          top: 290,
          right: 220,
          transform: `scale(${clockScale}) rotate(${clockRotate + clockIdleRotate}deg)`,
          transformOrigin: 'center center',
          zIndex: 6,
        }}
      >
        <Img
          src={staticFile('sleep_images/scene_02_layers/clock_clean.png')}
          style={{
            height: 600,
            objectFit: 'contain',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
