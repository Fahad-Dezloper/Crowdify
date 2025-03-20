/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

interface StreamViewProps {
    creatorId: string;
    isAdmin: boolean;
    roomId: string;
}

const StreamView = ({creatorId, isAdmin, roomId}: StreamViewProps) => {
    const [arr, setArr] = useState([])
    const [likedSongs, setLikedSongs] = useState({});
    // const musicRef = useRef(null);
    const [inputLink, setInputLink] = useState("");
    const [currentVideo, setCurrentVideo] = useState(true);
    const [isUpvote, setIsUpvote] = useState(false);
    const [playNextLoader, setPlayNextLoader] = useState(false);
    // @ts-ignore
    const {socket} = useWebSocket();
    

    // function handleVote(item) {
    //     console.log("Voting for stream:", item);
        
    //     try {
    //         fetch(`/api/streams/vote`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ item }),
    //         })
    //         .then(res => res.json())
    //         .then(response => {
    //             console.log(response.message);
                
    //             if (socket) {
    //                 socket.send(JSON.stringify({
    //                     type: "voteUpdate",
    //                     song: item,
    //                     upvoteCount: response.upvoteCount 
    //                 }));
    //             }
    
    //             setLikedSongs(prev => ({ ...prev, [item.streamId]: !prev[item.streamId] }));
    //             PlayNext();
    //         })
    //         .catch(error => {
    //             console.error("Error in handleVote:", error);
    //         });
    
    //     } catch (e) {
    //         console.error("Error in handleVote:", e);
    //     }
    // }     

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

// const PlayNext = async () => {
//             try {
//                 setPlayNextLoader(true);

//                 //delete the song
//                 if(currentVideo !== null){
//                     const remove = await axios.post('/api/streams/rm', currentVideo);
//                     if(socket){
//                         socket.send(
//                             JSON.stringify({
//                                 type: "updateQueue",
//                                 roomId: roomId,
//                                 song: {
//                                     currentVideo: currentVideo
//                                 }
//                             })
//                         )
//                     }
//                 }

//                 //next most upvoted song
//                 const data = await axios.get('/api/streams/next', {
//                     params: {
//                         roomId: roomId
//                     }
//                 })

//                 console.log("bhai json laaya hu", data);

//                 setCurrentVideo(data.data.stream);
//             } catch (error) {
//                 console.log(error);
//             } finally{
//                 setPlayNextLoader(false)
//             }
// }

    return (
        <div className="w-screen md:h-screen h-fit flex flex-col md:flex-row bg-[#101216] justify-between overflow-y-auto items-center">
        
        {/* Left Sidebar (For Large Screens) */}
        <div className="hidden md:flex h-full">
            <LeftSidebar 
                isAdmin={isAdmin} 
                roomId={roomId} 
                addToQueue={addToQueue} 
                inputLink={inputLink} 
                YT_REGEX={YT_REGEX} 
                setInputLink={setInputLink} 
            />
        </div>

        <div className="w-full h-full flex flex-col overflow-hidden">
            <TopBar userId={creatorId} />

            {/* Left Sidebar Below Top Bar (For Small & Medium Screens) */}
            <div className="md:hidden">
                <LeftSidebar 
                    isAdmin={isAdmin} 
                    roomId={roomId} 
                    addToQueue={addToQueue} 
                    inputLink={inputLink} 
                    YT_REGEX={YT_REGEX} 
                    setInputLink={setInputLink} 
                />
            </div>

                <div className="flex md:hidden my-4 bg-white p-2 rounded-2xl mx-2">
                    <MusicPlayer isAdmin={isAdmin}/>
                </div>

            <div className="w-full md:h-[68vh] h-fit flex items-center justify-center px-2 md:px-6 pt-1 pb-2 overflow-x-auto">
                <Queue />
            </div>

            <div className="flex flex-col md:flex-row w-full h-full overflow-hidden px-2 md:px-6 py-2 gap-4">
                <ChatBot isAdmin={isAdmin} />

                <div className="w-full md:flex hidden md:w-[40vw] h-full">
                    <div className="w-full h-full bg-white rounded-2xl py-5 px-6">
                        <MusicPlayer isAdmin={isAdmin} />
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default StreamView