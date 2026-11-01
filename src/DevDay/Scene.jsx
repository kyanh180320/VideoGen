import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img, staticFile } from 'remotion';

export const DevScene = ({
  imageSrc,
  timeTag,
  title,
  subtitle,
  accentColor = '#f59e0b',
  zoomDirection = 'in', // 'in' or 'out'
  specialBadge = null,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const progress = frame / durationInFrames;

  // Fade in first 0.4s and fade out last 0.4s
  const fadeInDuration = 12; // frames
  const fadeOutDuration = 12;
  const opacity = interpolate(
    frame,
    [0, fadeInDuration, durationInFrames - fadeOutDuration, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Ken Burns 2.5D Scale & Pan
  const scale = zoomDirection === 'in'
    ? interpolate(progress, [0, 1], [1.0, 1.1])
    : interpolate(progress, [0, 1], [1.1, 1.0]);

  const panX = interpolate(progress, [0, 1], [0, zoomDirection === 'in' ? -20 : 20]);
  const panY = interpolate(progress, [0, 1], [0, -10]);

  return (
    <div
      style={{
        position: 'relative',
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        backgroundColor: '#0a0e17',
        opacity,
      }}
    >
      {/* Background Cinematic Artwork with 2.5D Ken Burns */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
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

      {/* Cinematic Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.15) 0%, rgba(10,14,23,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Glassmorphic Time Pill */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 28px',
          borderRadius: 30,
          background: 'rgba(15, 23, 42, 0.85)',
          border: `1.5px solid ${accentColor}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: accentColor,
            boxShadow: `0 0 12px ${accentColor}`,
          }}
        />
        <span
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 22,
            fontWeight: 800,
            color: '#F2C94C',
            letterSpacing: '1px',
          }}
        >
          {timeTag}
        </span>
      </div>

      {/* Special Badge if any (e.g. CI/CD or Error) */}
      {specialBadge && (
        <div
          style={{
            position: 'absolute',
            top: 130,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 24px',
            borderRadius: 8,
            backgroundColor: specialBadge.bg || 'rgba(16, 185, 129, 0.25)',
            border: `1px solid ${specialBadge.color || '#10b981'}`,
            color: specialBadge.color || '#10b981',
            fontFamily: 'Montserrat, monospace, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            boxShadow: `0 0 20px ${specialBadge.color || '#10b981'}44`,
          }}
        >
          {specialBadge.text}
        </div>
      )}

      {/* Bottom Subtitle Card */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1500,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 32,
            fontWeight: 900,
            color: accentColor,
            textShadow: '0 3px 12px rgba(0,0,0,0.9), 0 0 20px rgba(245,158,11,0.5)',
            letterSpacing: '1.5px',
          }}
        >
          {title}
        </div>

        {/* Subtitle text */}
        <div
          style={{
            padding: '16px 36px',
            borderRadius: 14,
            background: 'rgba(10, 15, 28, 0.82)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span
            style={{
              fontFamily: 'Montserrat, "Be Vietnam Pro", sans-serif',
              fontSize: 26,
              fontWeight: 600,
              color: '#FFFFFF',
              lineHeight: 1.45,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  );
};
