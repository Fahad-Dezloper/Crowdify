/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronRight } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useWebSocket } from "../context/WebContext";

interface TopBarProps {
    userId: string;
}

const TopBar = ({ userId }: TopBarProps) => {
    // @ts-ignore
    const { userDets } = useWebSocket();
    // console.log("from topbar", userDets);


    function copyToClipboard(){
        const value = `http://localhost:3000/room/${userId}`;
            navigator.clipboard.writeText(value)
                .then(() => {
                    console.log("Copied to clipboard:", value);
                })
                .catch(err => {
                    console.error("Failed to copy:", err);
                });
    }
    // const session = useSession()
    return (
        <div className="w-full h-fit pt-5 pb-3 flex justify-between items-center px-8">
                    <div className="flex font-funnel text-white text-2xl items-center">
                        <Link href="/" className="font-semibold">Home</Link>
                        <span><ChevronRight /></span>
                        <span className="text-[#808080]">Dashboard</span>
                    </div>
                    {/* <div className="text-xl font-funnel text-white">{session?.data?.user.name}</div> */}
                    {/* <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>FK</AvatarFallback>
                    </Avatar> */}
                    <div className="flex gap-2 items-center">
                    <Button onClick={copyToClipboard}>
                        Share
                    </Button>
                    <Popover>
                        <PopoverTrigger>
                        <Avatar>
                            <AvatarImage src={`${userDets?.data ? userDets.data.user.image : "https://github.com/shadcn.png"}`} alt="@shadcn" />
                            <AvatarFallback>FK</AvatarFallback>
                        </Avatar>
                        </PopoverTrigger>
                        <PopoverContent  className="w-fit bg-black border-none">
                            <Button onClick={() => signOut()}>Sign out</Button>
                        </PopoverContent>
                    </Popover>
                    </div>
                </div>
    )
}

export default TopBar;