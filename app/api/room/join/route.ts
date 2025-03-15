import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    const session = await getServerSession();
    const {roomId} = await req.json();

    // console.log("rooom creating", roomId)
     const user = await prismaClient.user.findFirst({
            where: {
                email: session?.user?.email ?? ""
            }
    });

    if (!user) {
            return NextResponse.json({
                message: "Unauthenticated"
            }, {
                status: 403
            })
        }
        try {
            // Find the room by its code
            // console.log("founding room");
            const room = await prismaClient.room.findUnique({
                where: { code: roomId },
            });
            

            if (!room) {
                console.log("error room not found");
                return NextResponse.json({
                    message: "Room not found"
                }, { status: 404 });
            }
    
            // Add user to RoomUser table
            // console.log("here i have reached", room.id)
            const roomUser = await prismaClient.roomUser.create({
                data: {
                    userId: user.id,
                    roomId: room.id, 
                    role: "USER",
                },
            });
    
            // console.log("User joined the room:", roomUser);
    
            return NextResponse.json({
                message: "Joined successfully"
            }, { status: 201 });
    
        } catch (error) {
            console.error("Error joining room:", error);
            return NextResponse.json({
                message: "Error joining room"
            }, { status: 500 });
        }
}