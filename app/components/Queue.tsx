/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { ChartNoAxesColumn, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Link2 } from "lucide-react"
import Link from "next/link"
import { useWebSocket } from "../context/WebContext";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react";

const Queue = () => {
  // @ts-ignore
    const { queue, upvoteSong, userUpvotes, setUserUpvotes, userId } = useWebSocket();
    // console.log("haa bhai liked", queue);
    const handleUpvote = (songId: unknown) => {
        // console.log("called");
        if (!songId || !userId) {
          return console.error("something missing");
        };
      // console.log("called again");
        const newUpvotes = new Set(userUpvotes);
        if (newUpvotes.has(songId)) {
          newUpvotes.delete(songId);
        } else {
          newUpvotes.add(songId);
        }
    
        setUserUpvotes(newUpvotes);
        upvoteSong(songId, userId);
      };
    // console.log("here we have queue", queue);
    function concatenateWithinLimit(text: any) {
      let count = 0;
      let result = "";
      const safeText = String(text);
      
      for (const char of safeText) {
          if (char !== " ") count++;
          if (count > 20) break;
          result += char;
      }
    
        return result;
    }

    return (
        <div className="bg-white flex flex-col md:gap-2 gap-4 pb-4 pt-4 overflow-x-auto scrolll px-6 rounded-2xl w-full h-full">
            <div className="w-full flex justify-between items-center">
                        <h1 className="text-xl font-roboto font-semibold">Next in Row</h1> 
                        {/* {userId ? userId : "no user id"} */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 border-2 rounded-full cursor-pointer hover:bg-gray-200 duration-200 ease-in-out">
                                <ChevronLeft size={18} className="" />
                            </div>
                            <div className="p-2 border-2 rounded-full cursor-pointer hover:bg-gray-200 duration-200 ease-in-out">
                            <ChevronRight size={18} />
                            </div>
                        </div>
            </div>

            <div className="flex overflow-auto items-end w-full gap-3 scrolll h-full">
            {queue.length > 0 ? (
        queue.map((item: { thumbnail: string | undefined;hasLiked: boolean; title: any; upvoteCount: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; streamId: unknown; }, index: Key | null | undefined) => (
          <div
            key={index}
            className="flex flex-col min-w-[33vw] max-w-[35vw] md:min-w-0 md:w-[13vw] gap-4 border h-full rounded-2xl text-black hover:bg-gray-50 p-2 items-center justify-between"
          >
            <div className="flex flex-col items-center gap-2 h-full">
              <div className="min-w-[12vw] min-h-[12vh] rounded-xl overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt="Preview Image"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xs font-semibold leading-none text-center">
                {concatenateWithinLimit(item.title)}
              </h1>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1 text-gray-400">
                <ChartNoAxesColumn size={20} />
                <span>{typeof item.upvoteCount === "number" && item.upvoteCount > 0 ? item.upvoteCount : ""}</span>
              </div>

              <button
                onClick={() => handleUpvote(item.streamId)}
                className={`px-2 py-1 rounded-md transition-transform duration-200 active:scale-90 ${
                  item.hasLiked || userUpvotes.has(item.streamId) ? "bg-green-500 text-white" : "bg-gray-200 text-black"
                }`}
              >
                <ChevronUp className={`${userUpvotes.has(item.streamId) ? "text-white" : "text-gray-400"}`} />
                {/* {userUpvotes.has(item.streamId) ? "Upvoted" : "Upvote"} */}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="w-full h-full ">No song in queue at the moment</div>
      )}
            </div>
        </div>
    )
}

export default Queue