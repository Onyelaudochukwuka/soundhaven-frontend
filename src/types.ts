// src/types.ts

export interface User {
    id: number;
    email: string;
    password: string;
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
    filePath?: string;
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

  export interface AudioPlayerProps {
    currentTrackIndex: number;
    tracks: Track[];
    onSelectNextTrack: () => void;
    onSelectPrevTrack: () => void;
    url: string; 
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