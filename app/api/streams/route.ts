/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import ytdl from "ytdl-core";
import { getServerSession } from "next-auth";

// Schema for validation
const CreateStreamSchema = z.object({
  creatorId: z.string().nullable(),
  url: z.string(),
  roomId: z.string(),
});

// Function to extract Video ID from a YouTube URL
function extractVideoId(url: string) {
  const match = url.match(
    /(?:\?v=|&v=|youtu\.be\/|embed\/|\/v\/|\/e\/|watch\?v=|watch\?.+&v=)([^&]+)/
  );
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  const det = await req.json();
  console.log("data is det", det);

  try {
    const rawBody = det;
    console.log("Received raw data:", rawBody);

    const data = rawBody;
    const extractedId = extractVideoId(data.url);
    console.log("extractedId is", extractedId);

    if (!extractedId) {
      throw new Error("Invalid video ID extracted from the URL");
    }

    console.log("Fetching video details...");
    
    // Fetch video metadata using ytdl-core
    const videoInfo = await ytdl.getInfo(extractedId);
    const { videoDetails } = videoInfo;

    console.log("Fetched video details:", videoDetails.title);

    // Extract the best available thumbnail
    const thumbnail =
      videoDetails.thumbnails.length > 0
        ? videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url
        : "https://www.insticc.org/node/TechnicalProgram/56e7352809eb881d8c5546a9bbf8406e.png";

    return NextResponse.json({
      message: "Added Stream",
      id: crypto.randomUUID(),
      title: videoDetails.title,
      bigImg: thumbnail,
    });
  } catch (e) {
    console.error("Error occurred:", e);

    return NextResponse.json(
      {
        message: "Error while adding a stream",
        error: e,
      },
      { status: 411 }
    );
  }
}