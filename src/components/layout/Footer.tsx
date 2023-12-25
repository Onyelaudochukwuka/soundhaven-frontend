// components/Footer.jsx
import React from 'react';
import AudioPlayer from '../AudioPlayer';
import { Track } from '@/types';

interface FooterProps {
  tracks: Track[];
}

const Footer: React.FC<FooterProps> = ({ tracks }) => {
  return (
    <footer className="p-4">
      {tracks.map(track => (
        <div key={track.id}>
          <h3>{track.title}</h3>
          <AudioPlayer url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${track.filePath}`} />
        </div>
      ))}
    </footer>
  );
};

export default Footer;
