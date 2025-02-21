/* eslint-disable @next/next/no-img-element */
"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Link2, Play} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react"
import {z} from 'zod'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { YT_REGEX } from "@/lib/utils";
import Image from "next/image";
import MusicPlayer from "./MusicPlayer";
import Queue from "./Queue";
import LeftSidebar from "./leftSidebar";
import TopBar from "./Topbar";
import ChatBot from "./ChatBot";

const REFRESH_INTERVAL_MS = 10 * 1000;

interface Video {
    "id": string,
    "type": string,
    "url": string,
    "extractedId": string,
    "title": string,
    "smallImg": string,
    "bigImg": string,
    "active": boolean,
    "userId": string,
    "upvotes": number,
    "haveUpvoted": boolean
}

interface StreamViewProps {
    creatorId: string;
    playVideo: boolean;
    // onVote: () => void;
    role: string;
}

const StreamView = ({creatorId, playVideo = false, role}: StreamViewProps) => {
    const [arr, setArr] = useState([])
    const [liked, setLiked] = useState(false);
    // const musicRef = useRef(null);
    const [inputLink, setInputLink] = useState("");
    const [currentVideo, setCurrentVideo] = useState();
    const [playNextLoader, setPlayNextLoader] = useState(false);

    // console.log("i am arr", arr);
    async function refreshStreams(){
        const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {credentials: "include"});
        const json = await res.json();
        setArr(json.streams.sort((a, b) => a.upvotes < b.upvotes ? 1 : -1));
        setCurrentVideo(video => {
            if(video?.id === json.activeStream?.stream?.id){
                return video;
            }
            return json.activeStream.stream
        });
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        refreshStreams();
        const interval = setInterval(() => {
            refreshStreams();
        }, REFRESH_INTERVAL_MS)
    },[])   

    function handleVote(streamId: string, isUpvote: boolean){
        try{
            fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
                method: "POST",
                body: JSON.stringify({
                    streamId
                })
            })
            // onVote();
            setLiked(true)
        } catch (e){
            console.log("from fe", e)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        alert("clicked")
        const res = await fetch("/api/streams/", {
            method: "POST",
            body: JSON.stringify({
                creatorId: creatorId,
                url: inputLink
            })
        });
        // setArr([...prev, await res.json()])
        setInputLink('');
    }

    const PlayNext = async () => {
        if(arr.length > 0){
            try {
                setPlayNextLoader(true);
                const data = await fetch('/api/streams/next', {
                    method: "GET",
                })
                const json = await data.json();
                setCurrentVideo(json.stream);
            } catch (error) {
                console.log(error);
            } finally{
                setPlayNextLoader(false)
            }
        }
    }

    return (
        <div className="w-screen h-screen flex bg-[#101216] justify-between items-center">

            <LeftSidebar handleSubmit={handleSubmit} inputLink={inputLink} YT_REGEX={YT_REGEX} setInputLink={setInputLink} />

            <div className="w-full h-full flex overflow-hidden flex-col">
                <TopBar userId={creatorId} />


                <div className="w-full h-fit flex items-center scrolll justify-center px-6 pt-1 pb-2">
                    <Queue queue={arr} handleVote={handleVote} liked={liked}/>
                </div>




                <div className="flex w-full h-full overflow-hidden px-6 py-5 gap-4">            
                    <ChatBot />

                    <div className="w-[40vw] h-full">
                        <div className="w-full h-full bg-[#e6e6e6] rounded-2xl p-5 px-8" >
                            {currentVideo ? (
                                <MusicPlayer video={currentVideo} onClick={PlayNext} />
                                        ) : 
                                        (
                                        <div className="w-full h-full bg-gray-400 flex flex-col rounded-2xl">
                                            <div className="w-full h-full bg-blue-400">
                                            </div>
                                            <div className="w-full h-full bg-yellow-400">
                                                    <Button onClick={PlayNext}>Play Next</Button>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
            </div>

        {/* currnet video and preview*/}
            {/* 
            <div className="">
                <h1 className="text-white font-semibold text-2xl text-center">Now Playing</h1>
                {currentVideo ? (
                <div>
                    {playVideo ? <>
                        <iframe width={"100%"} height={300} src={`https://www.youtube.com/embed/${currentVideo.extractedId}?autoplay=1`} allow="autoplay"></iframe>
                    </> : <>
                    <img 
                        src={currentVideo.bigImg} 
                        className="w-full h-72 object-cover rounded"
                    />
                    <p className="mt-2 text-center font-semibold text-white">{currentVideo.title}</p>
                </>}
            </div>) : (
                <p className="text-center py-8 text-gray-400">No video playing</p>
            )}
            </div> */}

    {/* {playVideo && <Button disabled={playNextLoader} onClick={PlayNext}><Play /> {playNextLoader ? "Loading..." : "Play Next"}</Button>}       */}
    
     
{/* Queue Box */}
            {/* <div className="px-6 py-4 w-[30vw] h-full border-r-2 backdrop-blur-sm overflow-y-auto flex flex-col">
                <h1 className="font-funnel text-3xl text-white mb-7">Upcoming</h1>
                {arr.map((item: Video, index) => (
                    <div key={index} className="flex gap-4 hover:bg-gray-500 p-2 items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <div className="max-w-[8vw] max-h-[10vh] rounded-xl overflow-hidden">
                            <img src={item.bigImg} alt="Preview Image" className="w-full h-full object-cover" />
                            </div>
                            <h1 className="text-[0.65rem] font-semibold leading-none">{item.title}</h1>
                        </div>

                        <div className="flex bg-black rounded-2xl py-2 px-3 text-sm items-center">
                            <button onClick={() => handleVote(item.id, item.haveUpvoted ? false : true)} className="flex gap-4 items-center text-white">
                            {item.haveUpvoted ? <div className="flex gap-6"><ChevronDown size={18} /></div> : <div className="flex gap-6"><ChevronUp  size={18} className={`${liked && "text-blue-800"}`} /></div>}{item.upvotes} 
                            </button>
                            <Link href={item.url}><Link2 size={18} /></Link>
                        </div>

                    </div>
                ))}
            </div> */}
        </div>
    )
}

export default StreamView