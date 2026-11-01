import React from 'react';
import { Composition } from 'remotion';
import { HistoryVNVideo } from './HistoryVN';
import { DevDayVideo } from './DevDay';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="DevDay"
        component={DevDayVideo}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HistoryVN"
        component={HistoryVNVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
