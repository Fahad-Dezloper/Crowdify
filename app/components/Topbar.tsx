/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronRight } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useWebSocket } from "../context/WebContext";

interface TopBarProps {
    userId: string;
}

const TopBar = ({ userId }: TopBarProps) => {
    // @ts-ignore
    const { userDets } = useWebSocket();

    function copyToClipboard() {
        const value = `http://crowdify-one.vercel.app/room/${userId}`;
        navigator.clipboard.writeText(value)
            .then(() => console.log("Copied to clipboard:", value))
            .catch(err => console.error("Failed to copy:", err));
    }

    return (
        <div className="w-full h-fit pt-4 pb-3 flex sm:flex-row justify-between items-center px-4 sm:px-6 md:px-4 gap-3 sm:gap-0">
            {/* Navigation */}
            <div className="flex items-center font-funnel text-white text-lg sm:text-xl md:text-2xl">
                <Link href="/" className="font-semibold">Home</Link>
                <span><ChevronRight /></span>
                <span className="text-[#808080]">Dashboard</span>
            </div>

            {/* User Actions */}
            <div className="flex gap-2 sm:gap-3 items-center">
                <Button className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2" onClick={copyToClipboard}>
                    Share
                </Button>
                <Popover>
                    <PopoverTrigger>
                        <Avatar>
                            <AvatarImage src={userDets?.data ? userDets.data.user.image : "https://github.com/shadcn.png"} alt="@shadcn" />
                            <AvatarFallback>FK</AvatarFallback>
                        </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit bg-black border-none">
                        <Button onClick={() => signOut()}>Sign out</Button>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

export default TopBar;
