"use client";

import { Icon } from "@iconify/react";
import JSZip from "jszip";
import { useState } from "react";
import type { PlaylistData } from "@/types/playlist";

interface DownloadLightestButtonProps {
  playlist: PlaylistData;
}

export default function DownloadLightestButton({
  playlist,
}: DownloadLightestButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const downloadLightestTracks = async () => {
    setIsDownloading(true);
    setProgress(0);
    const zip = new JSZip();

    try {
      const tracksByTitle: Record<string, { setLabel: string; src: string }[]> =
        {};

      playlist.tracks.forEach((trackSet) => {
        trackSet.tracks.forEach((track) => {
          if (!tracksByTitle[track.title]) {
            tracksByTitle[track.title] = [];
          }
          tracksByTitle[track.title].push({
            setLabel: trackSet.label,
            src: track.src,
          });
        });
      });

      const uniqueTitles = Object.keys(tracksByTitle);
      const chosenTracks: { title: string; setLabel: string; src: string }[] =
        [];

      const analyzePromises = uniqueTitles.map(async (title, index) => {
        const versions = tracksByTitle[title];
        let lightestVersion = versions[0];
        let minSize = Infinity;

        const sizePromises = versions.map(async (version) => {
          try {
            const res = await fetch(version.src, { method: "HEAD" });
            const contentLength = res.headers.get("content-length");
            if (contentLength) {
              const size = parseInt(contentLength, 10);
              if (size < minSize) {
                minSize = size;
                lightestVersion = version;
              }
            }
          } catch (err) {
            console.error(
              `Erro ao checar tamanho de ${title} (${version.setLabel}):`,
              err,
            );
          }
        });

        await Promise.all(sizePromises);

        chosenTracks.push({
          title,
          setLabel: lightestVersion.setLabel,
          src: lightestVersion.src,
        });

        setProgress(Math.round(((index + 1) / uniqueTitles.length) * 20));
      });

      await Promise.all(analyzePromises);

      const downloadPromises = chosenTracks.map(async (track, index) => {
        const response = await fetch(track.src);
        if (!response.ok) throw new Error(`Falha ao baixar ${track.title}`);

        const blob = await response.blob();
        const fileExtension = track.src.split(".").pop() || "mp3";

        const trackNumber = String(index + 1).padStart(2, "0");

        const fileName = `${trackNumber} - ${track.title} (${track.setLabel}).${fileExtension}`;

        zip.file(fileName, blob);

        setProgress(20 + Math.round(((index + 1) / chosenTracks.length) * 50));
      });

      await Promise.all(downloadPromises);

      const zipContent = await zip.generateAsync(
        { type: "blob" },
        (metadata) => {
          setProgress(70 + Math.round(metadata.percent * 0.3));
        },
      );

      const url = window.URL.createObjectURL(zipContent);
      const link = document.createElement("a");
      link.href = url;

      const sanitizedName = playlist.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      link.download = `${sanitizedName}-curtas.zip`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro no download inteligente:", error);
      alert("Ocorreu um erro ao processar o download otimizado.");
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  return (
    <button
      type="button"
      onClick={downloadLightestTracks}
      disabled={isDownloading}
      className="flex items-center gap-1.5 rounded-full border border-[#203227] bg-[#112015] px-2.5 py-1 font-medium text-[#6a8071] text-[10px] transition-all duration-200 hover:border-[#2e5a3d] hover:bg-[#162c1c] hover:text-[#e5f1e8] disabled:cursor-not-allowed disabled:opacity-50"
      title="Baixar todas as faixas desta playlist em ZIP (as versões mais curtas)"
    >
      <Icon
        icon={isDownloading ? "svg-spinners:180-ring" : "ph:lightning-bold"}
        width={12}
      />
      <span>{isDownloading ? `${progress}%` : "ZIP"}</span>
    </button>
  );
}
