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
import { useWebSocket } from "../context/WebContext";

// const REFRESH_INTERVAL_MS = 10 * 1000;

// interface Video {
//     "id": string,
//     "type": string,
//     "url": string,
//     "extractedId": string,
//     "title": string,
//     "smallImg": string,
//     "bigImg": string,
//     "active": boolean,
//     "userId": string,
//     "upvotes": number,
//     "haveUpvoted": boolean
// }

// interface StreamViewProps {
//     creatorId: string;
//     playVideo: boolean;
//     // onVote: () => void;
//     role: string;
// }

const StreamView = ({creatorId, isAdmin, roomId}) => {
    const [arr, setArr] = useState([])
    const [liked, setLiked] = useState(false);
    // const musicRef = useRef(null);
    const [inputLink, setInputLink] = useState("");
    const [currentVideo, setCurrentVideo] = useState();
    const [playNextLoader, setPlayNextLoader] = useState(false);
    const {socket} = useWebSocket();

    // console.log("i am arr", arr);
    // async function refreshStreams(){
    //     const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {credentials: "include"});
    //     const json = await res.json();
    //     setArr(json.streams.sort((a, b) => a.upvotes < b.upvotes ? 1 : -1));
    //     setCurrentVideo(video => {
    //         if(video?.id === json.activeStream?.stream?.id){
    //             return video;
    //         }
    //         return json.activeStream.stream
    //     });
    // }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // useEffect(() => {
    //     refreshStreams();
    //     const interval = setInterval(() => {
    //         refreshStreams();
    //     }, REFRESH_INTERVAL_MS)
    // },[])   

    function handleVote(streamId: string, isUpvote: boolean){
        try{
            fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
                method: "POST",
                body: JSON.stringify({
                    streamId
                })
            })
            .then(res => res.json())
            .then(updatedSong => {
                if(socket){
                    socket.send(
                        JSON.stringify({
                            type: "voteUpdate",
                            song: update
                        })
                    )
                }
            })
            // onVote();
            setLiked(true)
        } catch (e){
            console.log("from fe", e)
        }
    }

    const addToQueue = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/streams/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                creatorId: creatorId,
                url: inputLink,
                roomId: roomId
            })
        });
        const data = await res.json(); // ✅ Parse response
        console.log("data received from BE stream:- ", data);

        if(socket){
            socket.send(
                JSON.stringify({
                    type: "addSong",
                    roomId: roomId,
                    song: {
                        url: inputLink,
                        title: data.title,      
                        thumbnail: data.bigImg, 
                    },
                })
            )
        }
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

            <LeftSidebar isAdmin={isAdmin} roomId={roomId} addToQueue={addToQueue} inputLink={inputLink} YT_REGEX={YT_REGEX} setInputLink={setInputLink} />

            <div className="w-full h-full flex overflow-hidden flex-col">
                <TopBar userId={creatorId} />


                <div className="w-full h-[50vh] flex items-center scrolll justify-center px-6 pt-1 pb-2">
                    <Queue handleVote={handleVote} liked={liked} />
                    {/* queue={arr} */}
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
        </div>
    )
}

export default StreamView