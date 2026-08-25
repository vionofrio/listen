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

    // 1. Coleta todas as faixas achatadas em uma única lista para processar o progresso
    const allTracksToDownload = playlist.tracks.flatMap((trackSet) =>
      trackSet.tracks.map((track) => ({
        setLabel: trackSet.label, // Ex: "V1", "V2"
        title: track.title, // Ex: "Staring at the Ceiling"
        src: track.src, // Ex: "/too-tired-too-sad/Staring at the Ceiling.mp3"
      })),
    );

    if (allTracksToDownload.length === 0) {
      setIsDownloading(false);
      return;
    }

    try {
      // 2. Faz o download em paralelo de todos os MP3s mapeados no JSON
      const downloadPromises = allTracksToDownload.map(async (track, index) => {
        const response = await fetch(track.src);
        if (!response.ok) throw new Error(`Falha ao baixar ${track.title}`);

        const blob = await response.blob();

        // Pega a extensão original do arquivo (.mp3)
        const fileExtension = track.src.split(".").pop() || "mp3";

        // Organiza os arquivos dentro do ZIP criando subpastas por versão (Ex: V1/Staring at the Ceiling.mp3)
        const zipPath = `${track.setLabel}/${track.title}.${fileExtension}`;
        zip.file(zipPath, blob);

        // Atualiza a primeira metade da barra de progresso (0% a 50%) baseado nos downloads concluídos
        setProgress(
          Math.round(((index + 1) / allTracksToDownload.length) * 50),
        );
      });

      await Promise.all(downloadPromises);

      // 3. Compacta tudo em um arquivo .zip
      const zipContent = await zip.generateAsync(
        { type: "blob" },
        (metadata) => {
          // Atualiza a segunda metade da barra de progresso (50% a 100%) baseado na compactação
          setProgress(50 + Math.round(metadata.percent / 2));
        },
      );

      // 4. Dispara o download nativo no navegador
      const url = window.URL.createObjectURL(zipContent);
      const link = document.createElement("a");
      link.href = url;

      // Nomeia o arquivo com o nome da playlist limpo (sem espaços problemáticos)
      const sanitizedName = playlist.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      link.download = `${sanitizedName}.zip`;

      document.body.appendChild(link);
      link.click();

      // Limpeza de cache e DOM
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
      className="flex items-center gap-1.5 rounded-full border border-[#322027] bg-[#201117] px-2.5 py-1 font-medium text-[#806a71] text-[10px] transition-all duration-200 hover:border-[#5a2e3d] hover:bg-[#2c1620] hover:text-[#f1e5e8] disabled:cursor-not-allowed disabled:opacity-50"
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
