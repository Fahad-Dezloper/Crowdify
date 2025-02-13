/* eslint-disable @next/next/no-img-element */
"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios";
import { ChevronDown, ChevronRight, ChevronUp, Link2, Play} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react"
import {z} from 'zod'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import { YT_REGEX } from "@/lib/utils";
import Image from "next/image";

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
const StreamView = ({creatorId, playVideo = false}: {creatorId: string; playVideo:boolean}) => {
    const [arr, setArr] = useState([])
    const [liked, setLiked] = useState(false);
    // const musicRef = useRef(null);
    const [inputLink, setInputLink] = useState("");
    const [currentVideo, setCurrentVideo] = useState();
    const [playNextLoader, setPlayNextLoader] = useState(false);

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

        // console.log("here response", res.data.streams);
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
                // currently hardcoded
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
        <div className="w-screen h-screen  flex bg-[#101216] justify-between items-center">
            {/* Last Part */}
            <div className="w-[30vw] flex flex-col bg-white h-full overflow-y-auto px-4">
                <h1 className="font-funnel text-4xl text-center py-8 font-semibold">Crowdify</h1>
                <div className="flex flex-col gap-2">
                <div className="flex gap-3">
                <Input placeholder="Add Song..." className="text-black border" value={inputLink} onChange={(e) => setInputLink(e.target.value)} />
                <Button onClick={(e) => handleSubmit(e)}>Add to Queue</Button>
                </div>
                {inputLink && inputLink.match(YT_REGEX) ? (
                <div className="bg-gray-900 border-gray-800 rounded-b-xl overflow-hidden">
                    <div className="w-full h-[23vh]">
                        <LiteYouTubeEmbed title="" id={inputLink.split("?v=")[1]}/>
                    </div>
                </div>
            ) : <div className="bg-[#101216] border-gray-800 rounded-b-xl overflow-hidden h-[23vh] text-white text-2xl flex items-center justify-center w-full font-funnel">No Preview Available</div>}
            </div>
            </div>

            <div className="w-full h-full flex flex-col">

                <div className="w-full h-[20vh] flex justify-between items-center px-8">
                    <div className="flex font-funnel text-white text-2xl items-center">
                        <h1 className="font-semibold">Home</h1>
                        <span><ChevronRight /></span>
                        <span className="text-[#808080]">Dashboard</span>
                    </div>
                    <div className="text-xl font-funnel text-white">User Details</div>
                </div>


                <div className="w-full min-h-[40vh] bg-red-400">
                    Other People spaces probably
                </div>



                <div className="flex w-full h-full">
                    <div className="w-full h-full bg-yellow-300"></div>
                    <div className="min-w-[28vw] p-6 h-full">
                        <div className="w-full h-full bg-red-300 rounded-2xl" >
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
                                {/* {playVideo && <Button disabled={playNextLoader} onClick={PlayNext}><Play /> {playNextLoader ? "Loading..." : "Play Next"}</Button>} */}
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