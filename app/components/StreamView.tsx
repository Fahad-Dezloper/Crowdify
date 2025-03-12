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
    const [likedSongs, setLikedSongs] = useState({});
    // const musicRef = useRef(null);
    const [inputLink, setInputLink] = useState("");
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isUpvote, setIsUpvote] = useState(false);
    const [playNextLoader, setPlayNextLoader] = useState(false);
    const {socket} = useWebSocket();
    

    function handleVote(item) {
        console.log("Voting for stream:", item);
        
        try {
            fetch(`/api/streams/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item }),
            })
            .then(res => res.json())
            .then(response => {
                console.log(response.message);
                
                if (socket) {
                    socket.send(JSON.stringify({
                        type: "voteUpdate",
                        song: item,
                        upvoteCount: response.upvoteCount 
                    }));
                }
    
                setLikedSongs(prev => ({ ...prev, [item.streamId]: !prev[item.streamId] }));
                PlayNext();
            })
            .catch(error => {
                console.error("Error in handleVote:", error);
            });
    
        } catch (e) {
            console.error("Error in handleVote:", e);
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
        const data = await res.json();
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
                        streamId: data.id
                    },
                })
            )
        }
        setInputLink('');
    }

const PlayNext = async () => {
            try {
                setPlayNextLoader(true);

                //delete the song
                if(currentVideo !== null){
                    const remove = await axios.post('/api/streams/rm', currentVideo);
                    if(socket){
                        socket.send(
                            JSON.stringify({
                                type: "updateQueue",
                                roomId: roomId,
                                song: {
                                    currentVideo: currentVideo
                                }
                            })
                        )
                    }
                }


                
                //next most upvoted song
                const data = await axios.get('/api/streams/next', {
                    params: {
                        roomId: roomId
                    }
                })

                console.log("bhai json laaya hu", data);

                setCurrentVideo(data.data.stream);
            } catch (error) {
                console.log(error);
            } finally{
                setPlayNextLoader(false)
            }
}

    return (
        <div className="w-screen h-screen flex bg-[#101216] justify-between items-center">

            <LeftSidebar isAdmin={isAdmin} roomId={roomId} addToQueue={addToQueue} inputLink={inputLink} YT_REGEX={YT_REGEX} setInputLink={setInputLink} />

            <div className="w-full h-full flex overflow-hidden flex-col">
                <TopBar userId={creatorId} />


                <div className="w-full h-[50vh] flex items-center scrolll justify-center px-6 pt-1 pb-2">
                    <Queue handleVote={handleVote} liked={likedSongs} />
                    {/* queue={arr} */}
                </div>


                <div className="flex w-full h-full overflow-hidden px-6 py-5 gap-4">            
                    <ChatBot />

                    <div className="w-[40vw] h-full">
                        <div className="w-full h-full bg-[#e6e6e6] rounded-2xl p-5 px-8" >
                            {currentVideo ? (
                                <MusicPlayer video={currentVideo} onClick={() => PlayNext()} />
                                        ) : 
                                        (
                                        <div className="w-full h-full  flex flex-col rounded-2xl">
                                            <img src="/carddd.png" alt="card" className="w-full h-full object-cover" />
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