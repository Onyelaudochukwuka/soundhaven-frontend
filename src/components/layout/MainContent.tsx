// components/MainContent.jsx
import FileUpload from '../FileUpload';
import TracksTable from '../TracksTable';
import ErrorMessage from '../ErrorMessage';
import AudioPlayer from '../AudioPlayer';
import { Track } from '@/types';

interface MainContentProps {
    tracks: Track[];
    error: string;
    loadTracks: () => Promise<void>;
  }
  
  const MainContent: React.FC<MainContentProps> = ({ tracks, error, loadTracks }) => {
    const handleUploadSuccess = async () => {
      await loadTracks();
    };
  
    return (
      <main className="flex flex-col items-center flex-1 p-4">
        {error && <ErrorMessage message={error} />}
        <h1 className="text-2xl font-bold mb-4">Welcome to SoundHaven</h1>
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        <TracksTable tracks={tracks} />
      </main>
    );
  };
  
  export default MainContent;