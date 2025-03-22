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
import {motion} from 'framer-motion';
import { toast } from "sonner"

interface StreamViewProps {
    roomId: string;
}
const StreamView = ({roomId}: StreamViewProps) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const [inputLink, setInputLink] = useState("");
    // @ts-ignore
    const {socket, creatorId, isAdmin, addSong} = useWebSocket();

    const addToQueue = async (e: React.FormEvent) => {
        e.preventDefault(); 
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
            const res = await fetch("/api/streams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": bodyData.length.toString()
                },
                body: bodyData
            });
    
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Error from API:", errorData);
                return;
            }
    
            const data = await res.json();
    
            if (socket) {
                const response = await addSong({
                    url: inputLink,
                    title: data.title,
                    thumbnail: data.bigImg,
                    streamId: data.id
                });

            toast("Song Added Successfully");
            } else {
                console.error("Error: socket is not available");
                toast("Websocket Connection not initialized")
            }
    
            setInputLink('');
    
        } catch (error) {
            console.error("Network or API error:", error);
            toast("Error Adding Successfully")
        }
    };

    return (
        <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-screen md:h-screen h-fit flex flex-col md:flex-row bg-[#101216] overflow-y-auto"
    >
      {/* Left Sidebar (For Large Screens) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hidden md:flex h-full"
      >
        <LeftSidebar 
                isAdmin={isAdmin} 
                roomId={roomId} 
                addToQueue={addToQueue}
                inputLink={inputLink} 
                YT_REGEX={YT_REGEX} 
                setInputLink={setInputLink} 
            />
      </motion.div>

      <div className="w-full h-full flex py-1 flex-col overflow-hidden">
        <TopBar userId={creatorId} />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="md:hidden"
        >
          <LeftSidebar 
                isAdmin={isAdmin} 
                roomId={roomId} 
                addToQueue={addToQueue}
                inputLink={inputLink} 
                YT_REGEX={YT_REGEX} 
                setInputLink={setInputLink} 
            />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex md:hidden my-4 p-2 rounded-2xl mx-2"
        >
          {isMobile && <MusicPlayer isAdmin={isAdmin} />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full md:h-[68vh] h-fit flex items-center justify-center px-2 md:px-4 pt-1 pb-2 overflow-x-auto"
        >
          <Queue />
        </motion.div>

        <div className="flex flex-col md:flex-row w-full h-full overflow-hidden px-2 md:px-4 py-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full"
          >
            <ChatBot isAdmin={isAdmin} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="w-full md:flex hidden md:w-[40vw] h-full"
          >
            {!isMobile && (
              <div className="w-full h-full rounded-2xl z-30 py-5 px-6 relative overflow-hidden shadow-lg before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:rounded-2xl before:border-transparent before:shadow-[inset_0_0_150px_rgba(255,255,255,0.4)] before:animate-shadowMove before:pointer-events-none">
              <MusicPlayer isAdmin={isAdmin} />
            </div>            
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
    )
}

export default StreamView