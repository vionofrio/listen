"use client";

import { useEffect, useState } from "react";
import type { PlaylistContextType, PlaylistData } from "@/types/playlist";

interface PlaylistTrackListProps {
  playlist: PlaylistData;
  current: PlaylistContextType;
  isPlaying: boolean;
  handlePlayTrack: (
    playlistId: number,
    trackSetIndex: number,
    trackIndex: number,
  ) => void;
}

export default function PlaylistTrackList({
  playlist,
  current,
  isPlaying,
  handlePlayTrack,
}: PlaylistTrackListProps) {
  const [shortestTracks, setShortestTracks] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    let isMounted = true;

    const tracksByTitle: Record<string, string[]> = {};
    playlist.tracks.forEach((set) => {
      set.tracks.forEach((t) => {
        if (!tracksByTitle[t.title]) tracksByTitle[t.title] = [];
        tracksByTitle[t.title].push(t.src);
      });
    });

    const checkSizes = async () => {
      const results: Record<string, string> = {};

      const promises = Object.entries(tracksByTitle).map(
        async ([title, srcs]) => {
          if (srcs.length < 2) return;

          try {
            let minSize = Infinity;
            let shortestSrc = "";
            const sizes: number[] = [];

            await Promise.all(
              srcs.map(async (src) => {
                const res = await fetch(src, { method: "HEAD" });
                const length = res.headers.get("content-length");
                if (length) {
                  const size = parseInt(length, 10);
                  sizes.push(size);
                  if (size < minSize) {
                    minSize = size;
                    shortestSrc = src;
                  }
                }
              }),
            );

            const hasDifference = new Set(sizes).size > 1;
            if (shortestSrc && hasDifference) {
              results[title] = shortestSrc;
            }
          } catch (e) {
            console.error("Erro ao checar metadados de tamanho:", e);
          }
        },
      );

      await Promise.all(promises);

      if (isMounted) {
        setShortestTracks(results);
      }
    };

    checkSizes();
    return () => {
      isMounted = false;
    };
  }, [playlist]);

  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {playlist.tracks.map((trackSet, trackSetIndex) => (
          <div key={trackSet.id} className="flex flex-col">
            <div className="mb-1.5 flex items-center gap-2 px-2.5">
              <span className="font-bold font-mono text-[#bd7088]/80 text-[9px] uppercase tracking-widest">
                {trackSet.label}
              </span>
              <span className="h-px flex-1 bg-[#28171d]/60" />
            </div>

            <ul className="space-y-0.5">
              {trackSet.tracks.map((track, idx) => {
                const isCurrentTrack =
                  current.playlistId === playlist.id &&
                  current.trackSetIndex === trackSetIndex &&
                  current.trackIndex === idx;

                const isPlayingNow = isCurrentTrack && isPlaying;

                const isShortest = shortestTracks[track.title] === track.src;

                return (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() =>
                        handlePlayTrack(playlist.id, trackSetIndex, idx)
                      }
                      className={`group flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition-all duration-150 ${
                        isCurrentTrack
                          ? "border-[#bd7088] border-l-2 bg-[#241218] text-[#f1e5e8]"
                          : "text-[#aa969c] hover:bg-[#1d1016]/40 hover:text-[#f1e5e8]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex w-4 shrink-0 items-center font-mono text-[10px]">
                          {isPlayingNow ? (
                            <div className="mb-px flex h-2.5 w-2.5 items-end gap-[1.5px]">
                              <span className="h-full w-[1.5px] animate-[pulse_0.6s_infinite] rounded-full bg-[#bd7088]" />
                              <span className="h-1/2 w-[1.5px] animate-[pulse_0.4s_infinite] rounded-full bg-[#bd7088]" />
                              <span className="h-3/4 w-[1.5px] animate-[pulse_0.5s_infinite] rounded-full bg-[#bd7088]" />
                            </div>
                          ) : (
                            <span
                              className={
                                isCurrentTrack
                                  ? "text-[#bd7088]"
                                  : "text-[#5d4b51]"
                              }
                            >
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                          )}
                        </div>

                        <span
                          className={`truncate ${isCurrentTrack ? "font-semibold" : "font-medium"}`}
                        >
                          {track.title}
                        </span>
                      </div>

                      {isShortest && (
                        <div
                          className="flex items-center"
                          title="Esta versão é mais curta"
                        >
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ea371] shadow-[0_0_6px_rgba(94,163,113,0.6)]" />
                          <span className="ml-1 hidden font-semibold text-[#5ea371]/80 text-[9px] lowercase italic tracking-wide group-hover:inline">
                            Curta
                          </span>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
