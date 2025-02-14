import { ChevronRight } from "lucide-react";

const TopBar = () => {
    return (
        <div className="w-full h-fit pt-5 pb-3 flex justify-between items-center px-8">
                    <div className="flex font-funnel text-white text-2xl items-center">
                        <h1 className="font-semibold">Home</h1>
                        <span><ChevronRight /></span>
                        <span className="text-[#808080]">Dashboard</span>
                    </div>
                    <div className="text-xl font-funnel text-white">User Details</div>
                </div>
    )
}

export default TopBar;