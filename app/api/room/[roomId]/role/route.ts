import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession();
    const roomId = params.id;

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        const user = await prismaClient.user.findFirst({
            where: { email: session?.user?.email }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        console.log("here looking for users", user);

        const roomUser = await prismaClient.roomUser.findFirst({
            where: { userId: user.id, roomId: roomId }
        });

        console.log("found you ass", roomUser);

        if (!roomUser) {
            return NextResponse.json({ message: "User not in room" }, { status: 403 });
        }

        return NextResponse.json({ role: roomUser }, { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json({ message: "Error fetching role" }, { status: 500 });
    }
}
