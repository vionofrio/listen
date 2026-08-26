"use client";

import { useEffect, useState } from "react";

interface TrackDurationProps {
  src: string;
}

export default function TrackDuration({ src }: TrackDurationProps) {
  const [duration, setDuration] = useState<string>("--:--");

  useEffect(() => {
    // Cria um objeto de áudio em memória para ler os metadados
    const audio = new Audio(src);
    audio.preload = "metadata"; // Baixa apenas as propriedades básicas (tamanho, duração)

    const handleLoadedMetadata = () => {
      const totalSeconds = audio.duration;

      if (!isNaN(totalSeconds) && isFinite(totalSeconds)) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        // Formata para ter sempre dois dígitos (Ex: 3:05 ao invés de 3:5)
        const formattedMinutes = String(minutes).padStart(2, "0");
        const formattedSeconds = String(seconds).padStart(2, "0");

        setDuration(`${formattedMinutes}:${formattedSeconds}`);
      }
    };

    const handleError = () => {
      setDuration("--:--");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);

    // Limpeza da memória ao desmontar o componente
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.load(); // Força a interrupção de qualquer download em segundo plano
    };
  }, [src]);

  return <span className="font-mono text-[#806a71] text-xs">{duration}</span>;
}
