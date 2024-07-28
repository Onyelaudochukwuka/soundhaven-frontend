import React, { useState, useEffect, useCallback } from "react";
import { Track, Artist, Album, Comment, User } from "../../../types/types";
import Modal from "../Modal"; // Import your modal component
import EditTrackForm from "./EditTrackForm";
import { serializeValue } from "@/utils/utils";
import { useTracks } from "@/hooks/UseTracks";
import { usePlayback } from "@/hooks/UsePlayback";
import { useAuth } from "@/hooks/UseAuth";
import { usePlaylists } from "@/hooks/UsePlaylists";
import TrackItem from "./TrackItem";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface TracksTableProps {
  tracks: Track[];
  onSelectTrack: (
    trackId: number,
    trackFilePath: string,
    trackIndex: number
  ) => void;
  onDelete: (id: number) => void;
  onUpdate: (trackId: number, field: string, value: string) => void;
  isPlaylistView: boolean;
  currentPlaylistId: number | null;
  removeTrackFromPlaylist: (
    playlistId: number,
    trackId: number
  ) => Promise<void>;
  deleteTrack: (trackId: number) => Promise<void>;
  setSelectedTrackId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedTrackId: number | null;
  onReorderTracks?: (startIndex: number, endIndex: number) => void;
}

const TracksTable: React.FC<TracksTableProps> = ({
  tracks,
  onSelectTrack,
  onUpdate,
  isPlaylistView,
  currentPlaylistId,
  setSelectedTrackId,
  selectedTrackId,
  onReorderTracks,
}) => {
  const { selectTrack, currentTrack } = usePlayback();
  const { deleteTrack, setTracks } = useTracks();
  const { removeTrackFromPlaylist } = usePlaylists();
  const { user, token } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [openMenuTrackId, setOpenMenuTrackId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
  };

  const toggleMenu = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuTrackId(openMenuTrackId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the menu and not on the menu items, close the menu
      if (
        openMenuTrackId !== null &&
        !event.target.closest(".menu-container") &&
        !event.target.closest(".menu-item")
      ) {
        setOpenMenuTrackId(null);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Remove event listener on cleanup
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuTrackId]);

  const handleTrackSelect = (trackId: number) => {
    setSelectedTrackId(trackId);
  };

  const handleTrackDragEnd = useCallback(
    (result) => {
      console.log("handleTrackDragEnd called with result:", result);
      if (!result.destination) {
        console.log("No destination, returning");
        return;
      }
      if (!isPlaylistView) {
        console.log("Not in playlist view, returning");
        return;
      }
      if (!onReorderTracks) {
        console.log("onReorderTracks not available, returning");
        return;
      }

      onReorderTracks(result.source.index, result.destination.index);
    },
    [isPlaylistView, onReorderTracks]
  );

  console.log("TracksTable: Rendering with tracks", tracks);

  return (
    <>
      <DragDropContext onDragEnd={handleTrackDragEnd}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Artist
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Album
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <Droppable droppableId="tracks" direction="vertical">
            {(provided) => (
              <tbody
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="bg-white divide-y divide-gray-200"
              >
                {tracks.map((track, index) => (
                  <Draggable
                    key={`track-${track.id}`}
                    draggableId={`track-${track.id}`}
                    index={index}
                    isDragDisabled={!isPlaylistView}
                  >
                    {(provided, snapshot) => (
                      // <tr
                      //   ref={provided.innerRef}
                      //   {...provided.draggableProps}
                      //   {...provided.dragHandleProps}
                      //   className={`${
                      //     snapshot.isDragging ? "bg-gray-100" : ""
                      //   }`}
                      // >
                      <TrackItem
                        key={track.id}
                        track={track}
                        index={index}
                        onDelete={handleDelete}
                        onUpdate={onUpdate}
                        onEdit={openModal}
                        isCurrent={currentTrack?.id === track.id}
                        isSelected={selectedTrackId === track.id}
                        onSelectTrack={setSelectedTrackId}
                        provided={provided}
                        snapshot={snapshot}
                      />
                      // </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {editingTrack && (
          <EditTrackForm
            track={editingTrack}
            closeModal={closeModal}
            fetchTracks={() => {}}
          />
        )}
      </Modal>
    </>
  );
};

export default TracksTable;
