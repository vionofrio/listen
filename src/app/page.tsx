"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
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
    <div className="flex h-screen flex-col bg-[#0b0709] font-sans text-[#eee5e7] antialiased selection:bg-[#8f3f58] selection:text-white">
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

          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="group flex max-h-105 flex-col overflow-hidden rounded-2xl border border-[#2a171e] bg-[#130b0f] shadow-[0_12px_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[#482431] hover:shadow-[0_14px_45px_rgba(62,21,35,0.25)]"
              >
                <div className="border-[#28171d] border-b bg-[#170c11] px-4 py-4">
                  <div className="relative flex items-start justify-between">
                    <div className="min-w-0 pr-16">
                      <span className="font-bold text-[#a85d72] text-[9px] uppercase tracking-[0.16em]">
                        {playlist.genre}
                      </span>

                      <h3 className="mt-1.5 truncate font-bold text-[#f1e5e8] text-[15px] tracking-tight">
                        {playlist.name}
                      </h3>
                    </div>

                    <span className="absolute right-0 rounded-full border border-[#322027] bg-[#201117] px-2.5 py-1 font-medium text-[#806a71] text-[9px]">
                      {playlist.tracks[0]?.tracks.length ?? 0} faixas
                    </span>
                  </div>
                </div>

                <div className="scrollbar-thin scrollbar-thumb-[#39202a] scrollbar-track-transparent flex-1 overflow-x-auto overflow-y-auto p-2.5">
                  <div className="flex min-w-max gap-2">
                    {playlist.tracks.map((trackSet) => {
                      const trackSetIndex = playlist.tracks.findIndex(
                        (set) => set.id === trackSet.id,
                      );

                      return (
                        <div key={trackSet.id} className="min-w-55 flex-1">
                          <div className="mb-1.5 flex items-center gap-2 px-3 py-1.5">
                            <span className="h-px w-3 bg-[#4b2733]" />

                            <span className="font-semibold text-[#765d65] text-[8px] uppercase tracking-[0.16em]">
                              {trackSet.label}
                            </span>

                            <span className="h-px flex-1 bg-[#24151b]" />
                          </div>

                          <ul className="space-y-0.5">
                            {trackSet.tracks.map((track, idx) => {
                              const isCurrentTrack =
                                current.playlistId === playlist.id &&
                                current.trackSetIndex === trackSetIndex &&
                                current.trackIndex === idx;

                              return (
                                <li key={track.id}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handlePlayTrack(
                                        playlist.id,
                                        trackSetIndex,
                                        idx,
                                      )
                                    }
                                    className={`group/btn flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all duration-200 ${
                                      isCurrentTrack
                                        ? "border-[#6c3045] bg-[#341520] text-[#e8c7d0] shadow-[inset_3px_0_0_#a4526c,0_4px_15px_rgba(81,25,45,0.2)]"
                                        : "border-transparent text-[#aa969c] hover:border-[#2e1b22] hover:bg-[#1d1016] hover:text-[#e5d7da]"
                                    }`}
                                  >
                                    <div className="flex min-w-0 items-center gap-2.5">
                                      <span
                                        className={`w-4 shrink-0 text-left font-medium text-[10px] ${
                                          isCurrentTrack
                                            ? "text-[#bd7088]"
                                            : "text-[#5d4b51]"
                                        }`}
                                      >
                                        {String(idx + 1).padStart(2, "0")}
                                      </span>

                                      <span className="truncate">
                                        {track.title}
                                      </span>
                                    </div>

                                    {isCurrentTrack ? (
                                      <div className="ml-2 flex shrink-0 items-center">
                                        {isPlaying ? (
                                          <Icon
                                            icon="ph:waveform-bold"
                                            width={14}
                                            className="text-[#bc6b83]"
                                          />
                                        ) : (
                                          <Icon
                                            icon="ph:play-fill"
                                            width={13}
                                            className="text-[#bc6b83]"
                                          />
                                        )}
                                      </div>
                                    ) : (
                                      <Icon
                                        icon="ph:play-fill"
                                        width={11}
                                        className="ml-2 shrink-0 text-[#725b63] opacity-0 transition-opacity group-hover/btn:opacity-100"
                                      />
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
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
