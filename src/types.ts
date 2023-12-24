// src/types.ts

export interface Track {
    id: number;
    title: string;
    duration: number; // Assuming duration is stored in seconds
    albumId?: number; // Optional if not all tracks have an associated album
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    filePath: string; // Optional if not all tracks have a file path
    // album?: Album; // Optional album object
    // playstlists?: Playlist[]; // Optional array of playlists
    // genres?: Genre[]; // Optional array of genres
}
