import { ChartNoAxesColumn, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Link2 } from "lucide-react"
import Link from "next/link"
import { useWebSocket } from "../context/WebContext";

const Queue = ({handleVote, liked}) => {
    const {queue} = useWebSocket();
    // console.log("haa bhai kya  laye ho", queue);
    // console.log("haa bhai liked", liked);
    // console.log("here we have queue", queue);
    function concatenateWithinLimit(text) {
        let result = "";
        let count = 0;
    
        for (let char of text) {
            if (char !== " ") count++;
            if (count > 26) break;
            result += char;
        }
    
        return result;
    }

    return (
        <div className="bg-white w-full h-fit flex flex-col gap-4 pb-8 pt-4 overflow-x-auto scrolll px-6 rounded-2xl">
            <div className="w-full flex justify-between items-center">
                        <h1 className="text-xl font-roboto font-semibold">Next in Row</h1> 
                        <div className="flex items-center gap-3">
                            <div className="p-2 border-2 rounded-full cursor-pointer hover:bg-gray-200 duration-200 ease-in-out">
                                <ChevronLeft size={18} className="" />
                            </div>
                            <div className="p-2 border-2 rounded-full cursor-pointer hover:bg-gray-200 duration-200 ease-in-out">
                            <ChevronRight size={18} />
                            </div>
                        </div>
            </div>

            <div className="flex overflow-auto w-full gap-3 scrolll">
            {queue.length > 0 ? <>
                {queue.map((item, index) => (
                    <div key={index} className="flex flex-col gap-4 border rounded-2xl text-black hover:bg-gray-50 p-2 items-center justify-between">
                        <div className="flex flex-col items-center gap-2">
                            <div className="min-w-[10vw] h-[13vh] rounded-xl overflow-hidden">
                            <img src={item.thumbnail} alt="Preview Image" className="w-full h-full object-cover" />
                            </div>
                            <h1 className="text-xs font-semibold leading-none text-center">{concatenateWithinLimit(item.title)}</h1>
                        </div>

                        <div className="flex items-center justify-between  w-full">
                            <div className="flex  leading-none font-funnel items-end">
                            <ChartNoAxesColumn size={20} className="text-gray-400" />
                            <span>{item.upvoteCount === 0 ? "" : item.upvoteCount}</span>
                            </div>
                            <div className="flex gap-2">
                            <div onClick={() => handleVote(item)} className={`p-1  rounded-md cursor-pointer transition-transform duration-200 active:scale-90  ${liked[item.streamId] ? "bg-blue-400" : ""}`}>
                                <ChevronUp size={20} />
                            </div> 
                            </div>
                        </div>

                    </div>
                ))}
            </> : <>No song in queue at the moment</>}
            </div>
        </div>
    )
}

export default Queue