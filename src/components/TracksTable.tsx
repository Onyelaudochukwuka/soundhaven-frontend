interface Track {
  id: number;
  title: string;
  duration: number; // Assuming duration is in seconds
  albumId?: number;
  album?: {
    // Define the structure of the Album object if you need to use it
    id: number;
    title: string;
    // other album fields...
  };
  createdAt: string; // Date in ISO format
  updatedAt: string; // Date in ISO format
  filePath?: string;
  // If you need to include playlists and genres, define them here
  // playlists?: Playlist[];
  // genres?: Genre[];
}

interface TracksTableProps {
  tracks: Track[];
}

const TracksTable: React.FC<TracksTableProps> = ({ tracks }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full leading-normal">
        <thead>
          <tr className="text-center font-bold">
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100">Title</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100">Artist</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100">Album</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100">Duration</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100">Play</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map(track => (
            <tr key={track.id} className="text-center">
              <td className="px-5 py-5 border-b border-gray-200 bg-white">{track.title}</td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white">{/* Artist name */}</td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white">{track.album ? track.album.title : 'No Album'}</td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white">{track.duration}</td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white">{/* Play Button */}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TracksTable;
