/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod'
// @ts-ignore
// import youtubesearchapi from 'youtube-search-api'
import { Client, MusicClient } from "youtubei";
import { getServerSession } from "next-auth";

const youtube = new Client();
const music = new MusicClient();


const CreateStreamSchema = z.object({
    creatorId: z.string() || null,
    url: z.string(),
    roomId: z.string()
})

function extractVideoId(url: string) {
    const match = url.match(/(?:\?v=|&v=|youtu\.be\/|embed\/|\/v\/|\/e\/|watch\?v=|watch\?.+&v=)([^&]+)/);
    return match ? match[1] : null;
}


export async function POST(req: NextRequest) {
    try {
        // ✅ First, log the raw request body before parsing
        const rawBody = await req.json();
        console.log("Received raw data:", rawBody);

        // ✅ Now parse it
        const data = rawBody;

        // if (!data.url.match(YT_REGEX)) {
        //     return NextResponse.json({ message: "Wrong URL format" }, { status: 411 });
        // }

        // console.log("reached here to add");

        const extractedId = extractVideoId(data.url);
        console.log('extractedId is', extractedId);
        if (!extractedId) {
            throw new Error("Invalid video ID extracted from the URL");
        }
        const res = await youtube.getVideo(extractedId);
        // console.log("YouTube API Response:", res);

        // const thumbnails = res.thumbnail.thumbnails;
        // console.log("data thumb", thumbnails);

        // thumbnails.sort((a: { width: number }, b: { width: number }) => (a.width < b.width ? -1 : 1));

        // const stream = await prismaClient.stream.create({
        //     data: {
        //         url: data.url,
        //         extractedId,
        //         type: "Youtube",
        //         title: res?.title ?? "Can't find your song",
        //         smallImg:
        //             res?.thumbnails[0].url ??
        //             "https://www.insticc.org/node/TechnicalProgram/56e7352809eb881d8c5546a9bbf8406e.png",
        //         bigImg:
        //             res?.thumbnails[res.thumbnails.length - 1].url ??
        //             "https://www.insticc.org/node/TechnicalProgram/56e7352809eb881d8c5546a9bbf8406e.png",
        //         room: {
        //             connect: {
        //                 code: data.roomId
        //             }
        //         }
        //     }
        // });

        console.log(res?.title)
        console.log(res?.thumbnails[res.thumbnails.length - 1].url)
        // console.log("Stream successfully added:", stream);

        return NextResponse.json({
            message: "Added Stream",
            id: crypto.randomUUID(),
            title: res?.title,
            bigImg: res?.thumbnails[res.thumbnails.length - 1].url ??
            "https://www.insticc.org/node/TechnicalProgram/56e7352809eb881d8c5546a9bbf8406e.png",
        });
    } catch (e) {
        console.error("Error occurred:", e);

        return NextResponse.json(
            {
                message: "Error while adding a stream",
                error: e
            },
            { status: 411 }
        );
    }
}


// export async function GET(req: NextRequest){
//     const creatorId = req.nextUrl.searchParams.get("creatorId");
//     const session = await getServerSession();

//     const user = await prismaClient.user.findFirst({
//         where: {
//             email: session?.user?.email ?? ""
//         }
//     })

//     if(!creatorId){
//         return NextResponse.json({
//             message: "Error"
//         }, {
//             status: 411
//         })
//     }
    
//     const [streams, activeStream] = await Promise.all([await prismaClient.stream.findMany({
//         where: {
//             // @ts-ignore
//             userId: creatorId ?? "",
//             played: false
//         }, 
//         include: {
//             _count: {
//                 select: {
//                     upvotes: true
//                 }
//             },
//             upvotes: {
//                 where: {
//                     userId: user?.id
//                 }
//             }
//         }
//         // @ts-ignore
//     }), prismaClient.currentStream.findFirst({
//         where: {
//             userId: creatorId
//         },
//         include: {
//             stream: true
//         }
//     })])

//     // console.log("here streams", streams);
//     return NextResponse.json({
//         // @ts-ignore
//         streams: streams.map(({_count, ...rest}) => ({
//             ...rest,
//             upvotes: _count.upvotes,
//             haveUpvoted: rest.upvotes.length ? true : false
//         })),
//         activeStream
//     })
// }


// addedBy: data.creatorId,