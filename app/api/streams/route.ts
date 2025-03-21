import { search } from "youtube-search-without-api-key";
import { NextRequest, NextResponse } from "next/server";


function extractVideoId(url: string | null) {
    const match = url.match(/(?:\?v=|&v=|youtu\.be\/|embed\/|\/v\/|\/e\/|watch\?v=|watch\?.+&v=)([^&]+)/);
    return match ? match[1] : null;
}


export async function POST(req: NextRequest) {
    const det = await req.json();
    console.log("Received data:", det);

    try {

        const extractedId = extractVideoId(det.url);
        const query = extractedId;

        console.log("Searching YouTube for:", query);

        // Fetch search results
        const results = await search(query);

        if (!results || results.length === 0) {
            throw new Error("No results found for the given query.");
        }

        // Get the first video result
        const video = results[0];
        const videoTitle = video.title;
        const bigImg = video.thumbnail || 
            "https://www.insticc.org/node/TechnicalProgram/56e7352809eb881d8c5546a9bbf8406e.png";

        console.log("Fetched video title:", videoTitle);
        console.log("Fetched thumbnail:", bigImg);

        return NextResponse.json({
            message: "Added Stream",
            id: crypto.randomUUID(),
            title: videoTitle,
            bigImg: bigImg
        });

    } catch (e) {
        console.error("Error occurred:", e);
        return NextResponse.json(
            {
                message: "Error while fetching video details",
                error: e.message || e,
            },
            { status: 500 }
        );
    }
}
