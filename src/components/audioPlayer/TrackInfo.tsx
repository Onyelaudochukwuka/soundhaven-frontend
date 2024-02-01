import React from 'react';
import { Track } from '@/types'; // Adjust the import path as needed

interface TrackInfoProps {
  track: Track;
}

const TrackInfo: React.FC<TrackInfoProps> = ({ track }) => {
  return (
    <div className="text-center">
      <h2 className="text-lg font-bold">{track.name}</h2>
      <p className="text-sm text-gray-500">{track.artist?.name || 'Unknown Artist'}</p>
    </div>
  );
};

export default TrackInfo;
