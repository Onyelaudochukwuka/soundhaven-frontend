import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { Track, Artist, Album } from '@/types';
import { deleteTrack, fetchArtists, fetchAlbums, createArtist, createAlbum } from '../services/apiService';

interface TracksTableProps {
  tracks: Track[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, field: string, value: string) => void;
  onSelectTrack: (trackFilePath: string, trackIndex: number) => void;
}

const TracksTable: React.FC<TracksTableProps & { isEditing: boolean, setIsEditing: (isEditing: boolean) => void }> = ({ tracks, onDelete, onUpdate, onSelectTrack, isEditing, setIsEditing }) => {
  const [editCell, setEditCell] = useState<{ id: number, field: keyof Track } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

    // Fetch artists and albums
    useEffect(() => {
      const loadArtistsAndAlbums = async () => {
        const artistsData = await fetchArtists();
        const albumsData = await fetchAlbums();
        setArtists(artistsData);
        setAlbums(albumsData);
      };
      loadArtistsAndAlbums();
    }, []);

  const handleDoubleClick = (track: Track, field: keyof Track) => {
    // Prevent editing of the duration field
    if (field === 'duration') {
      return;
    }
  
    setEditCell({ id: track.id, field });
    let initialValue = '';
    if (field === 'album') {
      initialValue = track.album?.title ?? ''; // Correct for album
    } else if (field === 'artist') {
      initialValue = track.artist ?? 'Unknown Artist'; // Correct for artist
    } else {
      initialValue = track[field] as string; // Directly use the string value for other fields
    }
    setEditValue(initialValue);
    setIsEditing(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditValue(e.target.value);
  };

  const handleBlur = async () => {
    if (editCell) {
      if (editCell.field === 'artist' && editValue === 'create_new') {
        const artistName = prompt('Enter new artist name:');
        if (artistName) {
          const newArtist = await createArtist({ name: artistName });
          setArtists([...artists, newArtist]);
          onUpdate(editCell.id, editCell.field, artistName); // Update the track with the new artist
        }
      } else if (editCell.field === 'album' && editValue === 'create_new') {
        const albumTitle = prompt('Enter new album title:');
        if (albumTitle) {
          const newAlbum = await createAlbum({ title: albumTitle });
          setAlbums([...albums, newAlbum]);
          onUpdate(editCell.id, editCell.field, albumTitle); // Update the track with the new album
        }
      } else {
        onUpdate(editCell.id, editCell.field, editValue);
      }
      setEditCell(null);
    }
  };  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === ' ') {
      e.stopPropagation(); // Stop the event from propagating
      // Allow default behavior for spacebar (adding space)
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

  const handleCreateNew = async (field: keyof Track, trackId: number) => {
    if (field === 'artist') {
      const artistData = { /* ... */ }; // Define artist data
      const newArtist = await createArtist(artistData);
      const artistName = newArtist.name; // Extract the artist's name
      onUpdate(trackId, field, artistName);
    } else if (field === 'album') {
      const albumData = { /* ... */ }; // Define album data
      const newAlbum = await createAlbum(albumData);
      const albumTitle = newAlbum.title; // Extract the album's title
      onUpdate(trackId, field, albumTitle);
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
                e.stopPropagation();
                track.filePath && onSelectTrack(track.filePath, index);
              }}>
                <FontAwesomeIcon icon={faPlay} />
              </button>
            </td>
            {['title', 'artist', 'album', 'duration'].map((field) => {
              const isEditing = editCell?.id === track.id && editCell.field === field;
  
              let cellValue: React.ReactNode;
              if (isEditing) {
                if (field === 'artist' || field === 'album') {
                  cellValue = (
                    <select value={editValue} onChange={handleInputChange} onBlur={handleBlur}>
                      {field === 'artist' && artists.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                      {field === 'album' && albums.map(a => <option key={a.id} value={a.title}>{a.title}</option>)}
                      <option value="create_new">Create New</option>
                    </select>
                  );
                } else {
                  cellValue = (
                    <input
                      type="text"
                      value={editValue}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      autoFocus
                    />
                  );
                }
              } else {
                switch (field) {
                  case 'album':
                    cellValue = track.album?.title ?? 'No Album';
                    break;
                  case 'artist':
                    cellValue = track.artist ?? 'Unknown Artist';
                    break;
                  default:
                    cellValue = track[field as keyof Track]?.toString() ?? '';
                    break;
                }
              }
  
              return (
                <td
                  key={field}
                  className="px-4 py-2"
                  onDoubleClick={() => handleDoubleClick(track, field as keyof Track)}
                >
                  {cellValue}
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