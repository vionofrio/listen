import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { PlaylistData } from "@/types/playlist";

export async function GET() {
  try {
    const playlistsDirectory = path.join(process.cwd(), "public", "playlists");
    const entries = await readdir(playlistsDirectory, { withFileTypes: true });
    const playlistDirectories = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    const playlists = await Promise.all(
      playlistDirectories.map(async (directory) => {
        const directoryPath = path.join(playlistsDirectory, directory);
        const files = await readdir(directoryPath);
        const playlistFile = files.find((file) =>
          file.toLowerCase().endsWith(".json"),
        );

        if (!playlistFile) {
          throw new Error(`No playlist JSON found in ${directory}.`);
        }

        const filePath = path.join(directoryPath, playlistFile);
        const contents = await readFile(filePath, "utf8");
        return JSON.parse(contents) as PlaylistData;
      }),
    );

    playlists.sort((a, b) => a.id - b.id);

    return NextResponse.json(playlists);
  } catch (error) {
    console.error("Failed to load playlists:", error);

    return NextResponse.json(
      { error: "Failed to load playlists." },
      { status: 500 },
    );
  }
}
