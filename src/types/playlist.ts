export type Track = {
  id: number;
  title: string;
  src: string;
};

export type TrackSet = {
  id: string;
  label: string;
  tracks: Track[];
};

export type PlaylistData = {
  id: number;
  name: string;
  genre: string;
  tracks: TrackSet[];
};

export type PlaylistContextType = {
  playlistId: number;
  trackSetIndex: number;
  trackIndex: number;
};
