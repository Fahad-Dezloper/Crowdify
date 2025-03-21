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
import MusicPlayer from "./MusicPlayer";
import Queue from "./Queue";
import LeftSidebar from "./leftSidebar";
import TopBar from "./Topbar";
import ChatBot from "./ChatBot";
import { useWebSocket } from "../context/WebContext";

interface StreamViewProps {
    roomId: string;
}
// creatorId={userId} isAdmin={isAdmin} roomId={roomIdd}
const StreamView = ({roomId}: StreamViewProps) => {
    const [arr, setArr] = useState([])
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const [likedSongs, setLikedSongs] = useState({});
    // const musicRef = useRef(null);
    const [inputLink, setInputLink] = useState("");
    const [currentVideo, setCurrentVideo] = useState(true);
    const [isUpvote, setIsUpvote] = useState(false);
    const [playNextLoader, setPlayNextLoader] = useState(false);
    // @ts-ignore
    const {socket, creatorId, isAdmin, addSong} = useWebSocket();

    const addToQueue = async (e: React.FormEvent) => {
        e.preventDefault();
    
        console.log("Event triggered for addToQueue");
        console.log("creatorId:", creatorId);
        console.log("inputLink:", inputLink);
        console.log("roomId:", roomId);
    
        // Ensure values are defined
        if (!creatorId || !inputLink || !roomId) {
            console.error("Missing required fields");
            return;
        }
    
        const bodyData = JSON.stringify({
            creatorId,
            url: inputLink,
            roomId
        });
    
        try {
            const res = await fetch("/api/streams", { // Removed trailing slash
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": bodyData.length.toString() // Optional fix for 411 error
                },
                body: bodyData
            });
    
            // Handle non-200 responses
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Error from API:", errorData);
                return;
            }
    
            const data = await res.json();
            console.log("Data received from BE stream:", data);
    
            if (socket) {
                const response = await addSong({
                    url: inputLink,
                    title: data.title,
                    thumbnail: data.bigImg,
                    streamId: data.id
                });
                console.log("Socket response:", response);
            } else {
                console.error("Error: socket is not available");
            }
    
            setInputLink(''); // Clear input field after success
    
        } catch (error) {
            console.error("Network or API error:", error);
        }
    };

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
                {isMobile && <MusicPlayer isAdmin={isAdmin} />}
                </div>

            <div className="w-full md:h-[68vh] h-fit flex items-center justify-center px-2 md:px-6 pt-1 pb-2 overflow-x-auto">
                <Queue />
            </div>

            <div className="flex flex-col md:flex-row w-full h-full overflow-hidden px-2 md:px-6 py-2 gap-4">
                <ChatBot isAdmin={isAdmin} />

                <div className="w-full md:flex hidden md:w-[40vw] h-full">
                {!isMobile && (
                        <div className="w-full h-full bg-white rounded-2xl py-5 px-6">
                            <MusicPlayer isAdmin={isAdmin} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    </div>
    )
}

export default StreamView