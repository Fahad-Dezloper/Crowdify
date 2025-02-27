import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod'
// @ts-ignore
import youtubesearchapi from 'youtube-search-api'
import { YT_REGEX } from "@/lib/utils";
import { getServerSession } from "next-auth";

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string(),
    roomId: z.string()
})

export async function POST(req: NextRequest) {
    try {
        // ✅ First, log the raw request body before parsing
        const rawBody = await req.json();
        console.log("Received raw data:", rawBody);

        // ✅ Now parse it
        const data = CreateStreamSchema.parse(rawBody);

        if (!data.url.match(YT_REGEX)) {
            return NextResponse.json({ message: "Wrong URL format" }, { status: 411 });
        }

        // console.log("reached here to add");

        const extractedId = data.url.split("?v=")[1];
        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        // console.log("YouTube API Response:", res);

        const thumbnails = res.thumbnail.thumbnails;
        // console.log("data thumb", thumbnails);

        thumbnails.sort((a: { width: number }, b: { width: number }) => (a.width < b.width ? -1 : 1));

        const stream = await prismaClient.stream.create({
            data: {
                url: data.url,
                extractedId,
                type: "Youtube",
                title: res.title ?? "Can't find your song",
                smallImg:
                    (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ??
                    "https://www.insticc.org/node/TechnicalProgram/56e7352809eb881d8c5546a9bbf8406e.png",
                bigImg:
                    thumbnails[thumbnails.length - 1].url ??
                    "https://www.insticc.org/node/TechnicalProgram/56e7352809eb881d8c5546a9bbf8406e.png",
                room: {
                    connect: {
                        code: data.roomId
                    }
                }
            }
        });

        // console.log("Stream successfully added:", stream);

        return NextResponse.json({
            message: "Added Stream",
            id: stream.id,
            title: stream.title,
            bigImg: stream.bigImg
        });
    } catch (e) {
        console.error("Error occurred:", e);

        return NextResponse.json(
            {
                message: "Error while adding a stream",
                error: e.message // ✅ Send error details to the frontend
            },
            { status: 411 }
        );
    }
}


export async function GET(req: NextRequest){
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const session = await getServerSession();

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    })

    if(!creatorId){
        return NextResponse.json({
            message: "Error"
        }, {
            status: 411
        })
    }
    
    const [streams, activeStream] = await Promise.all([await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? "",
            played: false
        }, 
        include: {
            _count: {
                select: {
                    upvotes: true
                }
            },
            upvotes: {
                where: {
                    userId: user?.id
                }
            }
        }
    }), prismaClient.currentStream.findFirst({
        where: {
            userId: creatorId
        },
        include: {
            stream: true
        }
    })])

    // console.log("here streams", streams);
    return NextResponse.json({
        streams: streams.map(({_count, ...rest}) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false
        })),
        activeStream
    })
}


// addedBy: data.creatorId,