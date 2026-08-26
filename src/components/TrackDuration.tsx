"use client";

import { useEffect, useState } from "react";

interface TrackDurationProps {
  src: string;
}

export default function TrackDuration({ src }: TrackDurationProps) {
  const [duration, setDuration] = useState<string>("--:--");

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = "metadata";

    const handleLoadedMetadata = () => {
      const totalSeconds = audio.duration;

      if (!isNaN(totalSeconds) && isFinite(totalSeconds)) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

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

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.load();
    };
  }, [src]);

  return <span className="font-mono text-[#806a71] text-xs">{duration}</span>;
}
