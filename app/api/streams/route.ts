import ytdl from "ytdl-core";
import { NextRequest, NextResponse } from "next/server";

// Extract video ID from URL
function extractVideoId(url: string) {
    const match = url.match(/(?:\?v=|&v=|youtu\.be\/|embed\/|\/v\/|\/e\/|watch\?v=|watch\?.+&v=)([^&]+)/);
    return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
    const det = await req.json();
    console.log("Received data:", det);

    try {
        const extractedId = extractVideoId(det.url);
        if (!extractedId) {
            throw new Error("Invalid video ID extracted from the URL");
        }

        console.log("Fetching video details for ID:", extractedId);

        // Fetch video details using ytdl-core with cookies
        const videoInfo = await ytdl.getInfo(extractedId, {
            requestOptions: {
                headers: {
                    Cookie: "VISITOR_INFO1_LIVE=CZVyx-dlsO0; YSC=XyuakdgGZCM;",
                },
            },
        });

        const videoTitle = videoInfo.videoDetails.title;
        const thumbnails = videoInfo.videoDetails.thumbnails;
        const bigImg = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : 
            "https://www.insticc.org/node/TechnicalProgram/56e7352809eb881d8c5546a9bbf8406e.png";

        console.log("Fetched video title:", videoTitle);
        console.log("Fetched thumbnail:", bigImg);

        return NextResponse.json({
            message: "Added Stream",
            id: crypto.randomUUID(),
            title: videoTitle,
            bigImg: bigImg,
        });

    } catch (e) {
        console.error("Error occurred:", e);
        return NextResponse.json(
            {
                message: "Error while fetching video details",
                error: e,
            },
            { status: 500 }
        );
    }
}
