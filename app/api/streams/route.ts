import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod'
// @ts-ignore
import youtubesearchapi from 'youtube-search-api'

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;
const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string() //should contain youtube or spotify link only
})

export async function POST(req: NextRequest){
    try { 
        const data = CreateStreamSchema.parse(await req.json());
        const isYt = data.url.match(YT_REGEX);
        if(!isYt){
            return NextResponse.json({
                message: "Wrong URL format"
            }, {
                status: 411
            })    
        }
        const extractedId = data.url.split("?v=")[1];

        const res = await youtubesearchapi.GetVideoDetails(extractedId)
        console.log(res);
        const thumbnails = res.thumbnail.thumbnails;
        console.log("data thumb", thumbnails);
        thumbnails.sort((a: {width: number}, b: {width: number}) => a.width < b.width ? -1 : 1)
       const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                url: data.url, 
                extractedId,
                type: "Youtube",
                title: res.title ?? "Can't find your song",
                smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2 ].url: thumbnails[thumbnails.length - 1].url) ?? "https://www.insticc.org/node/TechnicalProgram/56e7352809eb881d8c5546a9bbf8406e.png",
                bigImg: thumbnails[thumbnails.length - 1].url ?? "https://www.insticc.org/node/TechnicalProgram/56e7352809eb881d8c5546a9bbf8406e.png"
            }
        });
        return NextResponse.json({
            message: "Added Stream",
            id: stream.id
        })

    } catch (e) {
        console.log(e);
        return NextResponse.json({
            message: "Error while adding a stream"
        }, {
            status: 411
        })
    }
}

export async function GET(req: NextRequest){
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? ""
        }, 
        include: {
            _count: {
                select: {
                    upvotes: true
                }
            }
        }
    })

    console.log("here streams", streams);
    return NextResponse.json({
        streams: streams.map(({_count, ...rest}) => ({
            ...rest,
            upvotes: _count.upvotes
        }))
    })
}