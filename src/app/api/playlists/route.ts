import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { PlaylistData } from "@/types/playlist";

export async function GET() {
  try {
    const playlistsDirectory = path.join(process.cwd(), "public", "playlists");
    const files = await readdir(playlistsDirectory);
    const playlistFiles = files
      .filter((file) => file.toLowerCase().endsWith(".json"))
      .sort();

    const playlists = await Promise.all(
      playlistFiles.map(async (file) => {
        const filePath = path.join(playlistsDirectory, file);
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
