import { prismaClient } from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest){
    const songRemove = await req.json();

    console.log("songRemove", songRemove);

    const stream = await prismaClient.stream.delete({
        where: {
            id: songRemove.id
        }
    })

    console.log("song removed successfuly", stream);
    return NextResponse.json(stream);
}