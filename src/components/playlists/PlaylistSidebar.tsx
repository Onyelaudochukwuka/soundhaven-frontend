import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { Playlist, Track } from "../../../types/types";
import { usePlaylists } from "@/hooks/UsePlaylists";
import { useAuth } from "@/hooks/UseAuth";
import { useTracks } from "@/hooks/UseTracks";
import PlaylistItem from "./PlaylistItem";
import DuplicateTrackModal from "./DuplicateTrackModal";
import {
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DragDropContext,
} from "react-beautiful-dnd";
import DragDropErrorBoundary from "@/error-boundaries/DragDropErrorBoundary";

interface MemoizedDraggableProps {
  playlist: Playlist;
  index: number;
  children: (provided: DraggableProvided) => React.ReactElement;
}

const MemoizedDraggable = memo<MemoizedDraggableProps>(({ playlist, index, children }) => (
  <Draggable
    key={`playlist-${playlist.id}`}
    draggableId={`playlist-${playlist.id}`}
    index={index}
  >
    {children}
  </Draggable>
));

interface PlaylistSidebarProps {
  onSelectPlaylist: (tracks: Track[], playlistId: number) => void;
  onViewAllTracks: () => void;
  onDeletePlaylist: (playlistId: number) => void;
}

const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({
  onSelectPlaylist,
  onViewAllTracks,
  onDeletePlaylist,
}) => {
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    fetchPlaylists,
    addTrackToPlaylist,
    fetchPlaylistById,
    updatePlaylistOrder,
    setPlaylists,
  } = usePlaylists();
  const { user, token } = useAuth();
  const { fetchTracks } = useTracks();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState<number | null>(
    null
  );
  const [playlistName, setPlaylistName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(
    null
  );

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateTrackInfo, setDuplicateTrackInfo] = useState<{
    playlistId: number;
    trackId: number;
  } | null>(null);

  const libraryButtonRef = useRef<HTMLButtonElement>(null);
  const [isDndReady, setIsDndReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setIsDndReady(true);
      fetchPlaylists().then(() => setIsLoading(false));
    } else {
      setIsDndReady(false);
      setIsLoading(false);
    }
  }, [token, fetchPlaylists]);

  useEffect(() => {
    if (editingPlaylistId !== null) {
      const playlist = playlists.find((pl) => pl.id === editingPlaylistId);
      if (playlist) {
        setPlaylistName(playlist.name);
      }
    }
  }, [editingPlaylistId, playlists]);

  useEffect(() => {
    console.log("Playlists updated:", playlists);
  }, [playlists]);

  console.log("Rendering PlaylistSidebar, playlists:", playlists);

  const handleCreatePlaylist = async () => {
    try {
      console.log("Creating new playlist...");
      const newName = `New Playlist ${playlists.length + 1}`;
      console.log("New playlist name:", newName);

      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("User:", user);
      console.log("User ID:", user.id);

      const playlistData: Omit<Playlist, "id" | "user" | "tracks"> = {
        name: newName,
        userId: user.id,
        description: "A new playlist",
      };

      console.log("Playlist data being sent:", playlistData);

      const newPlaylist = await createPlaylist(playlistData);

      console.log(
        "New playlist received:",
        JSON.stringify(newPlaylist, null, 2)
      );
      console.log("New playlist type:", typeof newPlaylist);
      console.log("New playlist keys:", Object.keys(newPlaylist));

      if (!newPlaylist) {
        console.error("New playlist is falsy:", newPlaylist);
        throw new Error("Failed to create new playlist: Playlist is falsy");
      }

      if (!newPlaylist.id) {
        console.error("New playlist has no id:", newPlaylist);
        throw new Error("Failed to create new playlist: Playlist has no id");
      }

      console.log("Playlist creation completed successfully");
      console.log(
        "Adding new playlist to state:",
        JSON.stringify(newPlaylist, null, 2)
      );
    } catch (error) {
      console.error("Error creating playlist:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create playlist"
      );
    }
  };

  const handlePlaylistNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistName(e.target.value);
  };

  const handlePlaylistNameBlur = async () => {
    if (editingPlaylistId !== null) {
      await updatePlaylist(editingPlaylistId, { name: playlistTitle });
      setEditingPlaylistId(null);
    }
  };

  const handleAddTrackToPlaylist = async (
    playlistId: number,
    trackId: number,
    force: boolean = false
  ) => {
    try {
      const result = await addTrackToPlaylist(playlistId, trackId, force);
      if (result.status === "DUPLICATE" && !force) {
        setDuplicateTrackInfo({ playlistId, trackId });
        setIsDuplicateModalOpen(true);
      } else {
        console.log("Track added successfully:", result);
        // Update the playlist in the UI
        const updatedPlaylist = await fetchPlaylistById(playlistId);
        if (updatedPlaylist) {
          // Update the playlists state with the new playlist
          // This depends on how your state is structured
          // For example:
          // setPlaylists(prevPlaylists => prevPlaylists.map(p => p.id === playlistId ? updatedPlaylist : p));
        }
      }
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      setError("Failed to add track to playlist");
    }
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLLIElement>,
    playlistId: number
  ) => {
    e.preventDefault();
    const trackId = e.dataTransfer.getData("text/plain");
    await handleAddTrackToPlaylist(playlistId, Number(trackId));
  };

  const handleConfirmDuplicateAdd = async () => {
    if (duplicateTrackInfo) {
      await handleAddTrackToPlaylist(
        duplicateTrackInfo.playlistId,
        duplicateTrackInfo.trackId,
        true
      );
      setIsDuplicateModalOpen(false);
      setDuplicateTrackInfo(null);
    }
  };

  const handleLibraryClick = async () => {
    try {
      await fetchTracks();
    } catch (error) {
      setError("Failed to load tracks");
    }
  };

  const handlePlaylistSelect = async (playlistId: number) => {
    try {
      const playlist = await fetchPlaylistById(playlistId);
      console.log(`Fetched playlist ${playlistId}:`, playlist);
      if (playlist && playlist.tracks) {
        onSelectPlaylist(playlist.tracks, playlistId);
        setSelectedPlaylistId(playlistId);
      } else {
        console.error("Playlist or tracks not found");
        setError("Failed to load playlist tracks");
      }
    } catch (error: any) {
      if (error.message === "Forbidden resource") {
        console.error(
          "Access forbidden: You do not have permission to view this playlist."
        );
      } else {
        console.error("Error fetching playlist:", error);
      }
      setError("Failed to load playlist");
    }
  };

  const handleDeletePlaylist = useCallback(
    async (playlistId: number) => {
      try {
        await deletePlaylist(playlistId);
        setSelectedPlaylistId(null);
        onDeletePlaylist(playlistId);
        libraryButtonRef.current?.focus();
      } catch (error) {
        console.error("Error deleting playlist:", error);
        setError("Failed to delete playlist");
      }
    },
    [deletePlaylist, onDeletePlaylist]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedPlaylistId !== null
      ) {
        event.preventDefault();
        handleDeletePlaylist(selectedPlaylistId);
      }
    },
    [selectedPlaylistId, handleDeletePlaylist]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      console.log("onDragEnd called with result:", result);
      if (!result.destination) {
        console.log("No destination, returning");
        return;
      }
      if (result.source.index === result.destination.index) {
        console.log("Source and destination index are the same, returning");
        return;
      }  
  
      console.log("Current playlists:", playlists);
      const newPlaylists = Array.from(playlists);
      const [reorderedItem] = newPlaylists.splice(result.source.index, 1);
      newPlaylists.splice(result.destination.index, 0, reorderedItem);
  
      console.log("New playlist order:", newPlaylists.map(p => p.id));

      // Update the playlists state optimistically
      setPlaylists(newPlaylists);
  
      // Call API to update the order in the backend
      const playlistIds = newPlaylists.map((playlist) => playlist.id);
      updatePlaylistOrder(playlistIds)
        .then((updatedPlaylists) => {
          console.log("Playlists returned from API:", updatedPlaylists);
          // Update with the server response to ensure consistency
          setPlaylists(updatedPlaylists);
        })
        .catch((error) => {
          console.error("Failed to update playlist order:", error);
          console.error("Error details:", error.response?.data);
          // Revert to the original order if the API call fails
          fetchPlaylists();
        });
    },
    [playlists, setPlaylists, updatePlaylistOrder, fetchPlaylists]
  );

  useEffect(() => {
    console.log("isDndReady: •", isDndReady);
    console.log("playlists:", playlists);
  }, [isDndReady, playlists]);

  useEffect(() => {
    if (playlists.length > 0) {
      setIsDndReady(true);
    }
  }, [playlists]);

  if (isLoading) {
    return <div>Loading playlists...</div>;
  }

  if (!token) {
    return null; // Or return a message like "Please log in to view playlists"
  }

  console.log(
    "Playlist IDs before render:",
    playlists.map((p) => p.id)
  );

  console.log("Rendering Droppable");

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="playlist-sidebar p-4 bg-gray-800 text-white min-w-48">
      <button
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded"
        onClick={handleCreatePlaylist}
      >
        Add Playlist
      </button>
      <button
        ref={libraryButtonRef}
        className="w-full hover:text-blue-400 text-white font-bold py-2 mt-2 rounded my-1 text-left"
        onClick={onViewAllTracks}
      >
        {user ? `${user.name}'s Library` : "Anon’s Library"}
      </button>

      <h3 className="font-bold my-1 py-2 border-b border-t border-gray-600">
        Playlists
      </h3>

      {playlists.length > 0 && (
          <Droppable droppableId="playlists">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="px-1"
              >
                {playlists.length > 0 &&
                  playlists.map((playlist, index) => {
                    console.log(
                      `Rendering Draggable for playlist: ${playlist.id}`
                    );
                    return playlist && playlist.id ? (
                      <MemoizedDraggable
                        key={`playlist-${playlist.id}`}
                        playlist={playlist}
                        index={index}
                      >
                        {(provided) => {
                              console.log(`Rendering Draggable content for playlist: ${playlist.id}`);
                              return (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handlePlaylistSelect(playlist.id)}
                          >
                              {/* <div>{playlist.name}</div> */}

                              <PlaylistItem
                                playlist={playlist}
                                onEdit={() => {}}
                                onSelect={() =>
                                  handlePlaylistSelect(playlist.id)
                                }
                                isSelected={playlist.id === selectedPlaylistId}
                                onDrop={(e) => handleDrop(e, playlist.id)}
                                onDelete={() =>
                                  handleDeletePlaylist(playlist.id)
                                }
                              />
                          </li>
                        );
                        }}
                      </MemoizedDraggable>
                    ) : null;
                  })}

                {provided.placeholder}
              </ul>
            )}
          </Droppable>
      )}
      <DuplicateTrackModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        onConfirm={handleConfirmDuplicateAdd}
      />
    </div>
    </DragDropContext>
  );
};

export default PlaylistSidebar;
