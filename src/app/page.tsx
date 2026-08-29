"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import DownloadLightestButton from "@/components/DownloadLightestButton";
import DownloadPlaylistButton from "@/components/DownloadPlaylistButton";
import PlaylistTrackList from "@/components/PlaylistTrackList";
import type { PlaylistContextType, PlaylistData } from "@/types/playlist";

const VOLUME_STORAGE_KEY = "velvet-midnight-volume";

export default function Home() {
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
  const [playlistError, setPlaylistError] = useState<string | null>(null);

  const [current, setCurrent] = useState<PlaylistContextType>({
    playlistId: 1,
    trackSetIndex: 0,
    trackIndex: 0,
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") {
      return 0.8;
    }

    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);

    if (savedVolume === null) {
      return 0.8;
    }

    const parsedVolume = Number(savedVolume);

    if (!Number.isFinite(parsedVolume)) {
      return 0.8;
    }

    return Math.min(1, Math.max(0, parsedVolume));
  });

  useEffect(() => {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    let cancelled = false;

    const loadPlaylists = async () => {
      try {
        setIsLoadingPlaylists(true);
        setPlaylistError(null);

        const response = await fetch("/api/playlists", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load playlists.");
        }

        const data = (await response.json()) as PlaylistData[];

        if (cancelled) return;

        setPlaylists(data);

        if (data.length > 0) {
          setCurrent((previous) => {
            const currentPlaylist = data.find(
              (playlist) => playlist.id === previous.playlistId,
            );

            if (currentPlaylist) {
              return previous;
            }

            return {
              playlistId: data[0].id,
              trackSetIndex: 0,
              trackIndex: 0,
            };
          });
        }
      } catch (error) {
        if (cancelled) return;

        console.error(error);
        setPlaylistError("Não foi possível carregar as playlists.");
      } finally {
        if (!cancelled) {
          setIsLoadingPlaylists(false);
        }
      }
    };

    loadPlaylists();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentPlaylist = playlists.find(
    (playlist) => playlist.id === current.playlistId,
  );

  const currentTrackSet = currentPlaylist?.tracks[current.trackSetIndex];
  const currentTrack = currentTrackSet?.tracks[current.trackIndex];

  const handlePlayTrack = (
    playlistId: number,
    trackSetIndex: number,
    trackIndex: number,
  ) => {
    if (
      current.playlistId === playlistId &&
      current.trackSetIndex === trackSetIndex &&
      current.trackIndex === trackIndex
    ) {
      setIsPlaying((playing) => !playing);
      return;
    }

    setCurrent({
      playlistId,
      trackSetIndex,
      trackIndex,
    });

    setIsPlaying(true);
  };

  const handleSkipNext = () => {
    if (!currentTrackSet) return;

    setIsPlaying(true);

    if (current.trackIndex < currentTrackSet.tracks.length - 1) {
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
    if (!currentTrackSet) return;

    if (current.trackIndex > 0) {
      setCurrent({
        ...current,
        trackIndex: current.trackIndex - 1,
      });
    }
  };

  return (
    <div className="scrollbar-thin scrollbar-thumb-[#39202a] scrollbar-track-transparent flex h-screen flex-col bg-[#0b0709] font-sans text-[#eee5e7] antialiased selection:bg-[#8f3f58] selection:text-white">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-7 md:px-8 md:py-9">
          <header className="mb-7 flex items-center justify-between border-[#28171d] border-b pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#48242f] bg-[#1b0d12] text-[#c2768c] shadow-[0_0_25px_rgba(121,45,69,0.12)]">
                <Icon icon="ph:vinyl-record-fill" width={21} />
              </div>

              <div>
                <h1 className="font-extrabold text-[#f3e9eb] text-xl tracking-tight md:text-2xl">
                  Escuta Aí
                </h1>
              </div>
            </div>
          </header>

          {isLoadingPlaylists && (
            <div className="rounded-2xl border border-[#2a171e] bg-[#130b0f] px-5 py-8 text-center text-[#806a71] text-sm">
              Carregando playlists...
            </div>
          )}

          {playlistError && !isLoadingPlaylists && (
            <div className="rounded-2xl border border-[#4b2531] bg-[#1b0d12] px-5 py-8 text-center text-[#c2768c] text-sm">
              {playlistError}
            </div>
          )}

          {!isLoadingPlaylists && !playlistError && playlists.length === 0 && (
            <div className="rounded-2xl border border-[#2a171e] bg-[#130b0f] px-5 py-8 text-center text-[#806a71] text-sm">
              Nenhuma playlist encontrada.
            </div>
          )}

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="group flex max-h-80 flex-col overflow-hidden rounded-xl border border-[#2a171e] bg-[#130b0f] shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[#482431]"
              >
                <div className="border-[#28171d] border-b bg-[#170c11] px-3 py-2">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3
                        className="truncate font-extrabold text-[#f1e5e8] text-sm tracking-tight"
                        title={playlist.name}
                      >
                        {playlist.name}
                      </h3>

                      <div className="flex items-center gap-1.5 font-medium text-[#806a71] text-[10px]">
                        <span className="truncate font-semibold text-[#a85d72] text-[9px] uppercase tracking-wider">
                          {playlist.genre}
                        </span>
                        <span className="text-[#3a252d]">•</span>
                        <span className="shrink-0">
                          {playlist.tracks[0]?.tracks.length ?? 0} faixas
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-1">
                      <DownloadPlaylistButton playlist={playlist} />
                      <DownloadLightestButton playlist={playlist} />
                    </div>
                  </div>
                </div>

                <div className="scrollbar-thin scrollbar-thumb-[#39202a] scrollbar-track-transparent flex-1 overflow-y-auto bg-[#0f070a] p-1.5">
                  <PlaylistTrackList
                    playlist={playlist}
                    current={current}
                    isPlaying={isPlaying}
                    handlePlayTrack={handlePlayTrack}
                  />
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      {currentTrack && (
        <footer className="shrink-0 border-[#2a171e] border-t bg-[#10080c] shadow-[0_-12px_35px_rgba(0,0,0,0.3)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 md:flex-row md:items-center md:justify-between md:px-8">
            <div className="flex min-w-0 items-center gap-3 md:max-w-xs">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#4b2531] bg-[#241017] text-[#b7657e] shadow-[0_0_20px_rgba(105,37,57,0.18)]">
                <Icon
                  icon="ph:vinyl-record-fill"
                  width={20}
                  className={isPlaying ? "animate-spin" : ""}
                />

                {isPlaying && (
                  <span className="absolute inset-0 rounded-xl border border-[#9b4c67]/20" />
                )}
              </div>

              <div className="min-w-0">
                <h2 className="truncate font-semibold text-[#eee2e5] text-sm">
                  {currentTrack.title}
                </h2>

                <p className="mt-0.5 truncate text-[#765f66] text-[10px]">
                  {currentPlaylist?.name}
                  <span className="mx-1.5 text-[#493139]">/</span>
                  {currentTrackSet?.label}
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2 md:max-w-2xl">
              <button
                type="button"
                onClick={handleSkipPrev}
                className="rounded-xl border border-transparent p-2.5 text-[#705a61] transition-all hover:border-[#322027] hover:bg-[#1c1015] hover:text-[#c9b7bb] active:scale-95"
                aria-label="Previous track"
              >
                <Icon icon="ph:skip-back-fill" width={17} />
              </button>

              <div className="scheme-dark flex-1 overflow-hidden rounded-xl border border-[#2d1a21] bg-[#180d12]">
                <ReactPlayer
                  key={currentTrack.src}
                  src={currentTrack.src}
                  playing={isPlaying}
                  volume={volume}
                  controls={true}
                  onVolumeChange={(event) => {
                    setVolume(event.currentTarget.volume);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleSkipNext}
                  width="100%"
                  height="40px"
                />
              </div>

              <button
                type="button"
                onClick={handleSkipNext}
                className="rounded-xl border border-transparent p-2.5 text-[#705a61] transition-all hover:border-[#322027] hover:bg-[#1c1015] hover:text-[#c9b7bb] active:scale-95"
                aria-label="Next track"
              >
                <Icon icon="ph:skip-forward-fill" width={17} />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
