import React from 'react';
import type { NextPage } from 'next';
import WaveSurferWithRegions from '@/components/audioPlayer/WaveSurferReactTest';

const WaveSurferTestPage: NextPage = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>WaveSurfer with Regions Test</h1>
      <WaveSurferWithRegions />
    </div>
  );
};

export default WaveSurferTestPage;