"use client";

import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import ReactPlayer from "react-player";

const playlists = [
  {
    id: 1,
    name: "OVERDRIVE",
    tracks: [
      {
        id: 1,
        title: "DON'T LOOK BACK",
        src: "/phonk-playlist-001/Midnight Drift.mp3",
      },
      { id: 2, title: "3:17 AM", src: "/phonk-playlist-001/3AM Rain.mp3" },
      { id: 3, title: "NO SIGNAL", src: "/phonk-playlist-001/Signal Lost.mp3" },
      { id: 4, title: "SINS", src: "/phonk-playlist-001/Midnight Static.mp3" },
      { id: 5, title: "GHOST RIDE", src: "/phonk-playlist-001/Ghost Ride.mp3" },
      { id: 6, title: "REDLINE", src: "/phonk-playlist-001/Redline.mp3" },
      {
        id: 7,
        title: "MEMORY LEAK",
        src: "/phonk-playlist-001/Faded Memory.mp3",
      },
      {
        id: 8,
        title: "AFTER DARK",
        src: "/phonk-playlist-001/Midnight Drive.mp3",
      },
      {
        id: 9,
        title: "HUNTED",
        src: "/phonk-playlist-001/Something Is Watching.mp3",
      },
      { id: 10, title: "LAST LAP", src: "/phonk-playlist-001/Final Drive.mp3" },
    ],
  },
  {
    id: 2,
    name: "OVERDRIVE V2",
    tracks: [
      {
        id: 1,
        title: "DON'T LOOK BACK",
        src: "/phonk-playlist-001/Midnight Drift_1.mp3",
      },
      { id: 2, title: "3:17 AM", src: "/phonk-playlist-001/3AM Rain_1.mp3" },
      {
        id: 3,
        title: "NO SIGNAL",
        src: "/phonk-playlist-001/Signal Lost_1.mp3",
      },
      {
        id: 4,
        title: "SINS",
        src: "/phonk-playlist-001/Midnight Static_1.mp3",
      },
      {
        id: 5,
        title: "GHOST RIDE",
        src: "/phonk-playlist-001/Ghost Ride_1.mp3",
      },
      { id: 6, title: "REDLINE", src: "/phonk-playlist-001/Redline_1.mp3" },
      {
        id: 7,
        title: "MEMORY LEAK",
        src: "/phonk-playlist-001/Faded Memory_1.mp3",
      },
      {
        id: 8,
        title: "AFTER DARK",
        src: "/phonk-playlist-001/Midnight Drive_1.mp3",
      },
      {
        id: 9,
        title: "HUNTED",
        src: "/phonk-playlist-001/Something Is Watching_1.mp3",
      },
      {
        id: 10,
        title: "LAST LAP",
        src: "/phonk-playlist-001/Final Drive_1.mp3",
      },
    ],
  },
  {
    id: 3,
    name: "NO SIGNAL",
    tracks: [
      {
        id: 1,
        title: "LOST FREQUENCY",
        src: "/phonk-playlist-002/Lost Transmission.mp3",
      },
      {
        id: 2,
        title: "BLACKOUT DRIFT",
        src: "/phonk-playlist-002/Night Streets.mp3",
      },
      {
        id: 3,
        title: "GHOST IN THE STATIC",
        src: "/phonk-playlist-002/Ghostly Drive.mp3",
      },
      {
        id: 4,
        title: "CONCRETE ECHO",
        src: "/phonk-playlist-002/Underground Rage.mp3",
      },
      {
        id: 5,
        title: "NEON GRAVE",
        src: "/phonk-playlist-002/Neon-Lit Graveyard.mp3",
      },
    ],
  },
  {
    id: 4,
    name: "NO SIGNAL V2",
    tracks: [
      {
        id: 1,
        title: "LOST FREQUENCY",
        src: "/phonk-playlist-002/Lost Transmission_1.mp3",
      },
      {
        id: 2,
        title: "BLACKOUT DRIFT",
        src: "/phonk-playlist-002/Night Streets_1.mp3",
      },
      {
        id: 3,
        title: "GHOST IN THE STATIC",
        src: "/phonk-playlist-002/Ghostly Drive_1.mp3",
      },
      {
        id: 4,
        title: "CONCRETE ECHO",
        src: "/phonk-playlist-002/Underground Rage_1.mp3",
      },
      {
        id: 5,
        title: "NEON GRAVE",
        src: "/phonk-playlist-002/Neon-Lit Graveyard_1.mp3",
      },
    ],
  },
];

type PlaylistContextType = {
  playlistId: number;
  trackIndex: number;
};

export default function Home() {
  const [current, setCurrent] = useState<PlaylistContextType>({
    playlistId: 1,
    trackIndex: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const currentPlaylist = playlists.find((p) => p.id === current.playlistId);
  const currentTrack = currentPlaylist?.tracks[current.trackIndex];

  const handlePlayTrack = (playlistId: number, trackIndex: number) => {
    setCurrent({
      playlistId,
      trackIndex,
    });
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipNext = () => {
    if (!currentPlaylist) {
      return;
    }

    if (current.trackIndex < currentPlaylist.tracks.length - 1) {
      setCurrent({
        ...current,
        trackIndex: current.trackIndex + 1,
      });
    } else {
      setCurrent({
        ...current,
        trackIndex: 0,
      });
    }
  };

  const handleSkipPrev = () => {
    if (current.trackIndex > 0) {
      setCurrent({
        ...current,
        trackIndex: current.trackIndex - 1,
      });
    }
  };

  const handleEnded = () => {
    handleSkipNext();
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 font-sans text-zinc-950 transition-colors duration-300 md:p-12 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-1.5">
          <h1 className="font-bold text-3xl tracking-tight md:text-4xl">
            Escuta Aí
          </h1>
        </div>
        {currentTrack && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col items-center justify-between gap-6 p-6 md:flex-row md:p-8">
              <div className="w-full space-y-1 text-center md:w-1/3 md:text-left">
                <p className="mb-2 font-semibold text-xs text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Tocando agora
                </p>
                <h2 className="w-full truncate font-semibold text-2xl tracking-tight">
                  {currentTrack.title}
                </h2>
                <p className="w-full truncate text-sm text-zinc-500 dark:text-zinc-400">
                  {currentPlaylist?.name}
                </p>
              </div>
              <div className="flex w-full flex-col items-center gap-3 md:w-1/3">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSkipPrev}
                    className="grid h-10 w-10 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    title="Previous"
                  >
                    <SkipBack size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className="grid h-12 w-12 place-items-center rounded-full bg-zinc-900 text-zinc-50 shadow-sm transition-all hover:bg-zinc-900/90 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause size={20} className="fill-current" />
                    ) : (
                      <Play size={20} className="fill-current" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipNext}
                    className="grid h-10 w-10 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    title="Next"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>
                <div className="font-medium text-xs text-zinc-500 dark:text-zinc-400">
                  Track {current.trackIndex + 1} de{" "}
                  {currentPlaylist?.tracks.length}
                </div>
              </div>
              <div className="hidden w-1/3 md:block"></div>
            </div>
            <ReactPlayer
              ref={playerRef}
              src={currentTrack.src}
              playing={isPlaying}
              controls={true}
              width="100%"
              height="50px"
              onEnded={handleEnded}
            />
          </div>
        )}
        <div className="pt-4">
          <h3 className="mb-6 font-semibold text-xl tracking-tight">
            Playlists
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="border-zinc-100 border-b p-6 pb-4 dark:border-zinc-800/50">
                  <h4 className="font-semibold text-lg tracking-tight">
                    {playlist.name}
                  </h4>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {playlist.tracks.length} tracks
                  </p>
                </div>
                <div className="p-3">
                  <ul className="space-y-1">
                    {playlist.tracks.map((track, idx) => {
                      const isCurrentTrack =
                        current.playlistId === playlist.id &&
                        current.trackIndex === idx;
                      return (
                        <li key={track.id}>
                          <button
                            type="button"
                            onClick={() => handlePlayTrack(playlist.id, idx)}
                            className={`group flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors ${isCurrentTrack ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-50" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"}`}
                          >
                            <div className="flex items-center gap-4">
                              <span
                                className={`w-4 text-left text-xs ${isCurrentTrack ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-500"}`}
                              >
                                {idx + 1}
                              </span>
                              <span>{track.title}</span>
                            </div>
                            {isCurrentTrack && (
                              <Volume2
                                size={16}
                                className={`${isPlaying ? "animate-pulse" : ""} text-zinc-900 dark:text-zinc-50`}
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
