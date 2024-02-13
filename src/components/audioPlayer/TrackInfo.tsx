import React from 'react';
import { Track } from '../../../types/types'; // Adjust the import path as needed

interface TrackInfoProps {
  // Make track optional to handle cases where it might not be provided
  track?: Track | null;
}

const TrackInfo: React.FC<TrackInfoProps> = ({ track }) => {
  // Check if track is not provided or null and render alternative content
  if (!track) {
    return <div>Loading track information...</div>; // or any other placeholder you prefer
  }

  return (
    <div className="text-center">
      {/* Safely access track.name with a fallback for undefined track */}
      <h2 className="text-lg font-bold">{track.name || 'Unknown Track'}</h2>
      {/* Safely access track.artist.name with fallbacks for undefined track or artist */}
      <p className="text-sm text-gray-500">{track.artist?.name || 'Unknown Artist'}</p>
    </div>
  );
};

export default TrackInfo;
