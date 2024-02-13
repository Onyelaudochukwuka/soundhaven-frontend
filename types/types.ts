// src/types.ts

export interface User {
    id: number;
    email: string;
    // password: string;
    name?: string;
    createdAt: string;
    updatedAt: string;
    playlists: Playlist[];
    followedArtists: Artist[];
    refreshTokens: RefreshToken[];
  }
  
  export interface RefreshToken {
    id: number;
    token: string;
    userId: number;
    user: User;
    expiresIn: string;
  }
  
  export interface Artist {
    id: number;
    name: string;
    bio?: string;
    createdAt: string;
    updatedAt: string;
    albums: Album[];
    followers: User[];
  }
  
  export interface Album {
    id: number;
    name: string; 
    releaseDate: string;
    artistId: number;
    artist: Artist;
    tracks: Track[];
  }
  
  export interface Track {
    id: number;
    name: string;
    duration: number;
    artistId?: number;
    artist?: Artist;
    albumId?: number;
    album?: Album;
    createdAt: string;
    updatedAt: string;
    playlists: Playlist[];
    genres: Genre[];
    filePath: string;  
  }
  
  export interface Playlist {
    id: number;
    title: string;
    description?: string;
    userId: number;
    user: User;
    tracks: Track[];
  }
  
  export interface Genre {
    id: number;
    name: string;
    tracks: Track[];
  }
  
  export interface TracksInPlaylist {
    track: Track;
    trackId: number;
    playlist: Playlist;
    playlistId: number;
  }
  
  export interface TracksInGenre {
    track: Track;
    trackId: number;
    genre: Genre;
    genreId: number;
  }
  
  export interface AudioControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onSkipForward: () => void;
    onSkipBackward: () => void;
    onPlayNext: () => void;
    onPlayPrevious: () => void;
    onPlaybackSpeedChange: (speed: number) => void;
    onToggleFavorite: () => void;
    onVolumeChange: (volume: number) => void;
    isFavorite: boolean;
    playbackSpeed: number;
    volume: number;
  }

  export type TrackUpdatePayload = {
    [P in keyof Track]?: string;
  };

  export type Comment = {
    id: number;
    userName: string; 
    content: string;
    trackId: number;
    userId?: number; // userId is optional
    createdAt: Date;
    marker?: Marker; // marker is optional and should be of type Marker
    replies?: Comment[]; // Optional array of reply comments
    replyToId?: number; // Optional ID of the comment being replied to
    replyTo?: Comment; // Optional Comment being replied to
  };
  
  export type Marker = {
    id: number;
    time: number; // Time in seconds
    commentId?: number; // commentId is optional
    comment?: Comment; // Optional Comment associated with the marker
    trackId: number; // ID of the associated track
    createdAt: Date;
  };
  
  export type ErrorResponse = {
    message: string;
    errors?: { [key: string]: string[] };
  };

  export interface ApiError<T = unknown> extends Error {
    response?: {
      status?: number;
      statusText?: string;
      json?: () => Promise<T>;
    };
  }

  export interface DecodedToken {
    userId: number; // Custom property for user ID
    sub?: string;   // Subject - standard JWT property, often used for user ID
    exp?: number;   // Expiration time
    iat?: number;   // Issued at time
  }