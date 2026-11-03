import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Scene2Animated } from './Scene2Animated';

const SLEEP_SCENES = [
  {
    id: 1,
    startSec: 0.0,
    endSec: 6.8,
    imageSrc: 'sleep_images/scene_01.jpg',
    subtitle: 'Bạn vừa ăn trưa xong, mắt bắt đầu nặng trĩu, đầu gật gù trước màn hình. Bạn nghĩ: “Chắc tại ăn no quá?”',
    zoomDir: 'in',
  },
  {
    id: 2,
    startSec: 6.8,
    endSec: 12.7,
    imageSrc: 'sleep_images/scene_02.jpg',
    subtitle: 'Nhưng sự thật còn lạ hơn nhiều. Cơ thể bạn có một chiếc đồng hồ sinh học bên trong.',
    zoomDir: 'out',
  },
  {
    id: 3,
    startSec: 12.7,
    endSec: 17.7,
    imageSrc: 'sleep_images/scene_03.jpg',
    subtitle: 'Nó lên xuống nhịp suốt cả ngày, và đầu giờ chiều là lúc độ tỉnh táo tụt xuống một nhịp.',
    zoomDir: 'in',
  },
  {
    id: 4,
    startSec: 17.7,
    endSec: 23.4,
    imageSrc: 'sleep_images/scene_04.jpg',
    subtitle: 'Ngay cả khi bạn bỏ bữa, cơn buồn ngủ vẫn có thể ghé thăm. Vậy bữa ăn có liên quan không?',
    zoomDir: 'out',
  },
  {
    id: 5,
    startSec: 23.4,
    endSec: 28.3,
    imageSrc: 'sleep_images/scene_05.jpg',
    subtitle: 'Có. Ăn quá no hoặc nhiều tinh bột có thể làm cơn buồn ngủ rõ hơn.',
    zoomDir: 'in',
  },
  {
    id: 6,
    startSec: 28.3,
    endSec: 33.4,
    imageSrc: 'sleep_images/scene_06.jpg',
    subtitle: 'Nhưng nó chỉ là người khuếch đại, không phải thủ phạm chính. Vậy làm sao đối phó?',
    zoomDir: 'out',
  },
  {
    id: 7,
    startSec: 33.4,
    endSec: 39.0,
    imageSrc: 'sleep_images/scene_07.jpg',
    subtitle: 'Ra ngoài đón nắng vài phút, đi bộ ngắn, uống nước, hoặc chợp mắt khoảng 20 phút.',
    zoomDir: 'in',
  },
  {
    id: 8,
    startSec: 39.0,
    endSec: 43.8,
    imageSrc: 'sleep_images/scene_08.jpg',
    subtitle: 'Lần tới khi mí mắt nặng xuống sau bữa trưa, hãy nhớ: đó không phải bạn lười.',
    zoomDir: 'out',
  },
  {
    id: 9,
    startSec: 43.8,
    endSec: 47.02,
    imageSrc: 'sleep_images/scene_09.jpg',
    subtitle: 'Đó là chiếc đồng hồ cổ xưa trong người bạn đang gõ cửa.',
    zoomDir: 'in',
  },
];

const DoodleSceneCard = ({ imageSrc, zoomDir, isFirst, isLast }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = frame / Math.max(1, durationInFrames);

  // Subtle pop-in entrance + gentle Ken Burns zoom so 2D doodle feels alive without cropping text
  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 140, mass: 0.7 },
  });

  const baseScale = zoomDir === 'in'
    ? interpolate(progress, [0, 1], [1.0, 1.035])
    : interpolate(progress, [0, 1], [1.035, 1.0]);

  const popScale = isFirst ? 1 : interpolate(entrance, [0, 1], [0.97, 1.0]);
  const scale = baseScale * popScale;

  const fadeFrames = 6;
  const opacity = interpolate(
    frame,
    [
      0,
      isFirst ? 1 : fadeFrames,
      durationInFrames - (isLast ? 8 : fadeFrames),
      durationInFrames,
    ],
    [isFirst ? 1 : 0, 1, 1, isLast ? 0 : 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        opacity,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const SleepAfterLunchVideo = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      {SLEEP_SCENES.map((scene, index) => {
        const fromFrame = Math.round(scene.startSec * fps);
        const endFrame = Math.round(scene.endSec * fps);
        const durationInFrames = Math.max(1, endFrame - fromFrame);

        return (
          <Sequence
            key={scene.id}
            from={fromFrame}
            durationInFrames={durationInFrames}
            name={`${scene.id}. [${scene.startSec.toFixed(1)}s - ${scene.endSec.toFixed(1)}s]`}
          >
            {scene.id === 2 ? (
              <Scene2Animated />
            ) : (
              <DoodleSceneCard
                imageSrc={scene.imageSrc}
                zoomDir={scene.zoomDir}
                isFirst={index === 0}
                isLast={index === SLEEP_SCENES.length - 1}
              />
            )}
          </Sequence>
        );
      })}

      {/* Full narration audio track from public/audio/sleep/ */}
      <Audio src={staticFile('audio/sleep/test_1_phut_chatgpt.wav')} volume={1.0} />
    </AbsoluteFill>
  );
};

