import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { Track, Artist, Album, Comment, User } from '../../types/types';
import { fetchArtists, fetchAlbums } from '../services/apiService';
import Modal from './Modal'; // Import your modal component
import EditTrackForm from './EditTrackForm';
import { serializeValue } from '@/utils/utils';
import { useTracks } from '@/hooks/UseTracks';
import { usePlayback } from '@/hooks/UsePlayback';

interface TracksTableProps {
  tracks: Track[];
  onSelectTrack: (trackId: number, trackFilePath: string, trackIndex: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (trackId: number, field: string, value: string) => void;
}

const TracksTable: React.FC<TracksTableProps> = ({ onSelectTrack, onDelete, onUpdate }) => {
  const { selectTrack, currentTrack } = usePlayback();
  const { tracks, fetchTracks, deleteTrack } = useTracks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [openMenuTrackId, setOpenMenuTrackId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);


  useEffect(() => {
    const initFetch = async () => {
      setIsLoading(true);
      try {
        await fetchTracks();
      } catch (err) {
        setFetchError('Failed to load tracks. Please try again later.'); // Corrected from setError to setFetchError
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    initFetch();
    console.log("TracksTable received tracks: ", tracks);
  }, []);

  useEffect(() => {
    console.log("TracksTable: Tracks updated", tracks);
  }, [tracks]);


  const openModal = (track: Track) => {
    setEditingTrack(track);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrack(null);
  };

  const handleDelete = async (id: number) => {
    await deleteTrack(id);
    fetchTracks();
  };

  const handleDoubleClickOnRow = useCallback((track: Track, index: number) => {
    console.log("Track double-clicked:", track);
    selectTrack(track, index);
  }, [selectTrack]);

  const toggleMenu = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuTrackId(openMenuTrackId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the menu and not on the menu items, close the menu
      if (
        openMenuTrackId !== null &&
        !event.target.closest('.menu-container') &&
        !event.target.closest('.menu-item')
      ) {
        setOpenMenuTrackId(null);
      }
    };
  
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
  
    // Remove event listener on cleanup
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuTrackId]);

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
            <tr key={track.id}
              onDoubleClick={() => handleDoubleClickOnRow(track, index)}
              className={`hover:bg-gray-100 ${track.id === currentTrack?.id ? 'bg-blue-100' : ''}`}
            >

              <td className="px-4 py-2">{track.name}</td>
              <td className="px-4 py-2">{track.artist?.name ?? 'Unknown Artist'}</td>
              <td className="px-4 py-2">{track.album?.name ?? 'No Album'}</td>
              <td className="px-4 py-2">{track.duration}</td>
              <td className="px-4 py-2 relative">
                <button onClick={(e) => toggleMenu(track.id, e)}>•••</button>
                {openMenuTrackId === track.id && (
                  <div className="absolute right-0 bg-white shadow-lg rounded-md z-10 menu-item">
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents click from bubbling to the parent element
                        openModal(track);
                        setOpenMenuTrackId(null); // Closes the menu
                      }}>
                      Edit Metadata
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 menu-item"
                      onClick={async (e) => {
                        e.stopPropagation(); // Prevents click from bubbling to the parent element
                        await handleDelete(track.id);
                        setOpenMenuTrackId(null); // Closes the menu
                      }}>
                      Delete Track
                    </button>
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
            closeModal={closeModal}
            fetchTracks={fetchTracks}
          />
        )}
      </Modal>
    </>
  );
};

export default TracksTable;
