import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import { useWebSocket } from "../context/WebContext";
import Switch from "@/components/fancy/Button1";
import CopyButton from "@/components/fancy/CopytoClipboard";

import { FC } from "react";

interface LeftSidebarProps {
    addToQueue: (e: React.MouseEvent<HTMLButtonElement>) => void;
    inputLink: string;
    YT_REGEX: RegExp;
    setInputLink: (value: string) => void;
    isAdmin: boolean;
    roomId: string;
}


const LeftSidebar: FC<LeftSidebarProps> = ({ addToQueue, inputLink, YT_REGEX, setInputLink, isAdmin, roomId }) => {
    // @ts-ignore
    const { songAddStatus } = useWebSocket();
    console.log("left sidebar song add status",songAddStatus )

    return (
        <div className="min-w-[22vw] h-full py-5 px-3">
            <div className="min-w-[22vw] rounded-2xl flex flex-col bg-white h-full overflow-y-auto px-4">
                <h1 className="font-funnel text-4xl text-center py-8 font-semibold">Crowdify</h1>
                {/* <span className="w-full flex justify-center items-center font-funnel text-xl">{isAdmin ? "Admin" : "User"}</span> */}
                {/* <span>staus is {songAddStatus ? "yes" : "no"}</span> */}
                <div className="w-full flex flex-row-reverse justify-between items-center  min-h-[80px]">
                {isAdmin ? <Switch /> : ""}
                {/* <span>{roomId}</span> */}
                <div className="py-2">
                    <CopyButton roomId={roomId} />
                </div>
                </div>
                <div className="flex flex-col gap-2">
                
                {songAddStatus ? <>
                    <div className="flex gap-3">
                <Input placeholder="Add Song..." className="text-black border" value={inputLink} onChange={(e) => setInputLink(e.target.value)} />
                <Button onClick={(e) => addToQueue(e)}>Add to Queue</Button>
                </div>
                {inputLink && inputLink.match(YT_REGEX) ? (
                <div className="bg-gray-900 border-gray-800 rounded-b-xl overflow-hidden">
                    <div className="w-full h-[23vh]">
                        <LiteYouTubeEmbed title="" id={inputLink.split("?v=")[1]}/>
                    </div>
                </div>
            ) : <div className="bg-[#101216] border-gray-800 rounded-b-xl overflow-hidden h-[23vh] text-white text-2xl flex items-center justify-center w-full font-funnel">No Preview Available</div>}
                </> : <>
                    {isAdmin ? <>
                    <div className="flex gap-3">
                <Input placeholder="Add Song..." className="text-black border" value={inputLink} onChange={(e) => setInputLink(e.target.value)} />
                <Button onClick={(e) => addToQueue(e)}>Add to Queue</Button>
                </div>
                {inputLink && inputLink.match(YT_REGEX) ? (
                <div className="bg-gray-900 border-gray-800 rounded-b-xl overflow-hidden">
                    <div className="w-full h-[23vh]">
                        <LiteYouTubeEmbed title="" id={inputLink.split("?v=")[1]}/>
                    </div>
                </div>
            ) : <div className="bg-[#101216] border-gray-800 rounded-b-xl overflow-hidden h-[23vh] text-white text-2xl flex items-center justify-center w-full font-funnel">No Preview Available</div>}
                </> : ""}
                </>}
        
        </div>
            </div>
        </div>
    )
}

export default LeftSidebar