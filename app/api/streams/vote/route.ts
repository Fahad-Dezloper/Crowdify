/* eslint-disable @typescript-eslint/no-unused-vars */
import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// const UpvoteSchema = z.object({
//     streamId: z.string(),
// })

export async function POST(req: NextRequest) {
    const session = await getServerSession();

    // Get the logged-in user
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });

    if (!user) {
        return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
    }

    try {
        const data = await req.json();
        // console.log("Received Vote Data:", data);

        const streamId = data.item?.streamId;
        if (!streamId) {
            return NextResponse.json({ message: "Stream ID is missing" }, { status: 400 });
        }

        // Check if the user has already voted
        const existingVote = await prismaClient.upvote.findFirst({
            where: {
                userId: user.id,
                streamId: streamId
            }
        });

        if (existingVote) {
            // If user clicks again, remove their vote (toggle behavior)
            const datt = await prismaClient.upvote.delete({
                where: { id: existingVote.id }
            });

            
            const upvoteCount = await prismaClient.upvote.count({
                where: { streamId: streamId }
            });

            // console.log("after unvote", datt);
            // console.log("final count", upvoteCount);
            return NextResponse.json({ message: "Vote removed", upvoteCount });
        } else {
            // If no vote exists, create a new upvote
           const dat = await prismaClient.upvote.create({
                data: {
                    user: { connect: { id: user.id } },
                    stream: { connect: { id: streamId } },
                    vote: "Upvote"
                }
            });

            const upvoteCount = await prismaClient.upvote.count({
                where: { streamId: streamId }
            });
            // console.log("after vote", dat);
            // console.log("final count", upvoteCount);
            return NextResponse.json({ message: "vote approved", upvoteCount });
        }
        
        
    } catch (e) {
        console.error("Error while voting:", e);
        return NextResponse.json({ message: "Error while processing vote" }, { status: 500 });
    }
}
