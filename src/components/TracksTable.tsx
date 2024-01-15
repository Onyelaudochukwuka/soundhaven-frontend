import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { Track, Artist, Album } from '@/types';
import { deleteTrack, fetchArtists, fetchAlbums } from '../services/apiService';
import Modal from './Modal'; // Import your modal component
import EditTrackForm from './EditTrackForm';
import { serializeValue } from '@/utils';

interface TracksTableProps {
  tracks: Track[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, field: string, value: string) => void;
  onSelectTrack: (trackFilePath: string, trackIndex: number) => void;
}

const TracksTable: React.FC<TracksTableProps> = ({ tracks, onDelete, onUpdate, onSelectTrack }) => {
  console.log("Received tracks:", tracks);

  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  console.log("TracksTable received tracks: ", tracks);

  // Fetch artists and albums only once on component mount
  useEffect(() => {
    let isMounted = true;
    const loadArtistsAndAlbums = async () => {
      try {
        const [loadedArtists, loadedAlbums] = await Promise.all([fetchArtists(), fetchAlbums()]);
        if (isMounted) {
          setArtists(loadedArtists);
          setAlbums(loadedAlbums);
        }
      } catch (error) {
        console.error('Error fetching artists/albums:', error);
      }
    };
    loadArtistsAndAlbums();

    return () => {
      isMounted = false;
    };
  }, []);

  const openModal = (track: Track) => {
    setEditingTrack(track);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrack(null);
  };

  const handleSave = (updatedTrackData: Partial<Track>) => {
    if (!editingTrack) return;

    (Object.keys(updatedTrackData) as Array<keyof Track>).forEach(field => {
      // Ensure the current field exists on editingTrack before comparing
      if (editingTrack.hasOwnProperty(field)) {
        const oldValue = editingTrack[field];
        const newValue = updatedTrackData[field];

        if (oldValue !== newValue) {
          const valueToUpdate: string = serializeValue(newValue);
          onUpdate(editingTrack.id, field, valueToUpdate);
        }
      }
    });

    closeModal();
  };

  const handleDelete = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteTrack(id);
    onDelete(id);
  };

  const handleDoubleClickOnRow = (track: Track, index: number) => {
    track.filePath && onSelectTrack(track.filePath, index);
  };

  const [openMenuTrackId, setOpenMenuTrackId] = useState<number | null>(null);

  const toggleMenu = (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); // This prevents the double-click event for playback
    setOpenMenuTrackId(openMenuTrackId === id ? null : id);
  };

  return (
    <>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Album</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tracks.map((track, index) => (
            <tr key={track.id} onDoubleClick={() => handleDoubleClickOnRow(track, index)}>
            <td className="px-4 py-2">{track.name}</td>
            <td className="px-4 py-2">{track.artist?.name ?? 'Unknown Artist'}</td>
            <td className="px-4 py-2">{track.album?.name ?? 'No Album'}</td>
            <td className="px-4 py-2">{track.duration}</td>
            <td className="px-4 py-2">
                <button onClick={(e) => toggleMenu(track.id, e)}>•••</button>
                {openMenuTrackId === track.id && (
                  <div className="menu">
                    <button onClick={() => openModal(track)}>Edit Metadata</button>
                    <button onClick={(e) => { 
                      e.stopPropagation();
                      handleDelete(track.id, e);
                    }}>Delete Track</button>
                    {/* More options can be added here */}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {editingTrack && (
          <EditTrackForm
            track={editingTrack}
            onSave={handleSave}
          />
        )}
      </Modal>
    </>
  );
};

export default TracksTable;
