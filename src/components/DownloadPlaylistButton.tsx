"use client";

import { Icon } from "@iconify/react";
import JSZip from "jszip";
import { useState } from "react";
import type { PlaylistData } from "@/types/playlist";

interface DownloadPlaylistButtonProps {
  playlist: PlaylistData;
}

export default function DownloadPlaylistButton({
  playlist,
}: DownloadPlaylistButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    setProgress(0);
    const zip = new JSZip();

    const allTracksToDownload = playlist.tracks.flatMap((trackSet) =>
      trackSet.tracks.map((track, index) => {
        const trackNumber = String(index + 1).padStart(2, "0");

        return {
          setLabel: trackSet.label,
          formattedName: `${trackNumber} - ${track.title}`,
          src: track.src,
        };
      }),
    );

    if (allTracksToDownload.length === 0) {
      setIsDownloading(false);
      return;
    }

    try {
      const downloadPromises = allTracksToDownload.map(async (track, index) => {
        const response = await fetch(track.src);
        if (!response.ok)
          throw new Error(`Falha ao baixar ${track.formattedName}`);

        const blob = await response.blob();

        const fileExtension = track.src.split(".").pop() || "mp3";

        const zipPath = `${track.setLabel}/${track.formattedName}.${fileExtension}`;
        zip.file(zipPath, blob);

        setProgress(
          Math.round(((index + 1) / allTracksToDownload.length) * 50),
        );
      });

      await Promise.all(downloadPromises);

      const zipContent = await zip.generateAsync(
        { type: "blob" },
        (metadata) => {
          setProgress(50 + Math.round(metadata.percent / 2));
        },
      );

      const url = window.URL.createObjectURL(zipContent);
      const link = document.createElement("a");
      link.href = url;

      const sanitizedName = playlist.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      link.download = `${sanitizedName}.zip`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar o pacote de download:", error);
      alert("Não foi possível baixar todos os arquivos.");
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownloadAll}
      disabled={isDownloading}
      className="flex items-center gap-1 rounded border border-[#322027]/60 bg-[#201117] px-2 py-0.5 font-medium text-[#806a71] text-[9px] hover:border-[#5a2e3d] hover:bg-[#2c1620] hover:text-[#f1e5e8] disabled:opacity-40"
      title="Baixar todas as faixas desta playlist em ZIP"
    >
      <Icon
        icon={
          isDownloading ? "svg-spinners:180-ring" : "ph:download-simple-bold"
        }
        width={12}
      />
      <span>{isDownloading ? `${progress}%` : "ZIP"}</span>
    </button>
  );
}
