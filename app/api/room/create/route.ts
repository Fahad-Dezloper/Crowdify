/* eslint-disable @typescript-eslint/no-unused-vars */
import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    const session = await getServerSession();
    const {roomId} = await req.json();
    // console.log("room Id", roomId)

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });
    // console.log("here is am ", session?.user?.email);

    if(!user){
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        })
    }

    // console.log("here reached 2", roomId, user);
    try {
        const room = await prismaClient.room.create({
            data: {
                code: roomId,
                name: "chill",
                adminId: user.id,
                allowSongAdd: true,
            }
        });

        // console.log("Room Created on 1st:", room);
        
        const roomUser = await prismaClient.roomUser.create({
            data: {
                userId: user.id,
                roomId: room.id,
                role: "ADMIN",
            },
        });

        // console.log("Room Created on 2nd:", roomUser);        

        return NextResponse.json({
            message: "Done!"
        }, {
            status: 201
        });
    } catch (e) {
        console.log(e);
        return NextResponse.json({
            message: "Error while creating room"
        }, {
            status: 403
        })
    }
}