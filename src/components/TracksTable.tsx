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
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Artist</th> {/* Artist header added */}
          <th>Album</th>
          <th>Duration</th>
          <th>Play</th>
        </tr>
      </thead>
      <tbody>
        {tracks.map(track => (
          <tr key={track.id}>
            <td>{track.title}</td>
            <td>{/* Artist name, if available */}</td>
            <td>{track.album ? track.album.title : 'No Album'}</td>
            <td>{track.duration}</td>
            <td>{/* Play Button */}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TracksTable;
