"use client"
import { ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const TopBar = () => {
    const session = useSession()
    return (
        <div className="w-full h-fit pt-5 pb-3 flex justify-between items-center px-8">
                    <div className="flex font-funnel text-white text-2xl items-center">
                        <Link href="/" className="font-semibold">Home</Link>
                        <span><ChevronRight /></span>
                        <span className="text-[#808080]">Dashboard</span>
                    </div>
                    <div className="text-xl font-funnel text-white">{session?.data?.user.name}</div>
                </div>
    )
}

export default TopBar;