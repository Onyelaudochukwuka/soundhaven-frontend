// WaveSurferTestPage.tsx
import React from 'react';
import WaveSurferWithRegions from '@/components/audioPlayer/WaveSurferReactTest';

const WaveSurferTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-4">WaveSurfer Test Page</h1>
        <div className="bg-white shadow-xl rounded-lg p-6">
          <WaveSurferWithRegions />
        </div>
      </div>
    </div>
  );
};

export default WaveSurferTestPage;
