// store details in cookies so dont have to fetch from db again and again

import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

      // Use the parameters
    //   console.log('roomId:', roomId);

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });

    if(!user){
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        })
    }
    const findRoomId = await prismaClient.room.findFirst({
        where: {
            code: roomId ?? ""
        }
    });

    const mostUpvotedStream = await prismaClient.stream.findFirst({
        where: {
            roomId: findRoomId?.id
        },
        orderBy: {
            upvotes: {
                _count: "desc"
            }
        }
    });
    
    // console.log(mostUpvotedStream);

    // console.log("hree is the stream", mostUpvotedStream);

    return NextResponse.json({
        stream: mostUpvotedStream
    })
}

// export async function GET(request) {
//         const { searchParams } = new URL(request.url);
//       const roomId = searchParams.get('roomId');

//         // Use the parameters
//         console.log('roomId:', roomId);

//         return NextResponse.status(200).json({ message: 'Parameters received' });
// }