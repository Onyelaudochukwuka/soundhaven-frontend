import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { Track } from '@/types';
import { deleteTrack } from '../services/apiService';

interface TracksTableProps {
  tracks: Track[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, field: string, value: string) => void;
  onSelectTrack: (trackFilePath: string, trackIndex: number) => void;
}

const TracksTable: React.FC<TracksTableProps> = ({ tracks, onDelete, onUpdate, onSelectTrack }) => {
  const [editCell, setEditCell] = useState<{ id: number, field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleDoubleClick = (track: Track, field: keyof Track) => {
    setEditCell({ id: track.id, field });
    setEditValue(track[field] as string);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleBlur = () => {
    if (editCell) {
      onUpdate(editCell.id, editCell.field, editValue);
      // Update track information in the database
      // updateTrackMetadata(editCell.id, { [editCell.field]: editValue });
    }
    setEditCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const handleDelete = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering onSelectTrack when deleting
    try {
      await deleteTrack(id);
      onDelete(id); // Call the callback to update the state
    } catch (error) {
      console.error('Failed to delete the track:', error);
    }
  };
  return (
    <table>
      <thead>
        <tr>
          <th className="text-left px-4 py-2">Play</th>
          <th className="text-left px-4 py-2">Title</th>
          <th className="text-left px-4 py-2">Artist</th>
          <th className="text-left px-4 py-2">Album</th>
          <th className="text-left px-4 py-2">Duration</th>
          <th className="text-left px-4 py-2">Delete</th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((track, index) => (
          <tr key={track.id}>
            <td className="px-4 py-2">
              <button onClick={(e) => {
                e.stopPropagation(); // Prevent row click when playing track
                track.filePath && onSelectTrack(track.filePath, index);
              }}>
                <FontAwesomeIcon icon={faPlay} />
              </button>
            </td>
            {['title', 'artist', 'album', 'duration'].map((field) => {
              const isEditing = editCell?.id === track.id && editCell.field === field;

              let cellValue: React.ReactNode;
              switch (field) {
                case 'album':
                  cellValue = track.album ? track.album.title : 'No Album';
                  break;
                case 'artist':
                  // Assuming artist is a string or you have a logic to get artist name
                  cellValue = track.artist || 'Unknown Artist';
                  break;
                default:
                  cellValue = track[field as keyof Track];
              }

              return (
                <td
                  key={field}
                  className="px-4 py-2"
                  onDoubleClick={() => handleDoubleClick(track, field as keyof Track)}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  ) : (
                    cellValue || ''
                  )}
                </td>
              );
            })}
            <td className="px-4 py-2">
              <button onClick={(e) => handleDelete(track.id, e)}>X</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TracksTable;
