/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowRight, Music, Plus, Sparkles } from "lucide-react";
import AudioVisualizer from "@/components/fancy/AudioVisulalizer";
import Navbar from "../components/Navbar";

const generateRoomId = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let roomId = "";
  for (let i = 0; i < 9; i++) {
    if (i > 0 && i % 3 === 0) {
      roomId += "-";
    }
    roomId += characters[Math.floor(Math.random() * characters.length)];
  }
  return roomId;
};

const formatRoomId = (input: string) => {
  const cleanInput = input.replace(/-/g, "").slice(0, 9);
  return cleanInput.match(/.{1,3}/g)?.join("-") || "";
};

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
};

const Page = () => {
  const [createRoomId, setcreateRoomId] = useState("");
  const [joinRoom, setJoinRoom] = useState("");
  const router = useRouter();

  async function jointheRoom(joinRoomId: string) {
    if (!joinRoomId) {
      alert("Room ID cannot be empty!");
      return;
    }
    router.push(`/room/${joinRoomId}`);
  }

  async function createtheRoom(createRoomId: string) {
    if (!createRoomId) {
      alert("Room ID cannot be empty!");
      return;
    }
    try {
      const res = await axios.post("/api/room/create", {
        roomId: createRoomId,
      });
      if (!res) {
        console.log("Error while creating room");
      }
      router.push(`/room/${createRoomId}`);
    } catch {
      console.log("Error while creating room");
    }
  }

  const buttonClasses = "relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-2 text-lg font-medium group/btn sm:w-auto w-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300";
  const buttonOverlayClasses = "absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300";

  return (
    <>
      <Navbar />
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 md:p-8"
         style={{
           background: 'linear-gradient(to bottom, #0f1729, #1a103c)'
         }}>
      <AudioVisualizer />
      
      {/* Gradient Orbs */}
      <div className="absolute  inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '-4s' }}></div>
      </div>

      <div className="w-full flex flex-col items-center max-w-lg mx-auto space-y-8 md:space-y-2 relative z-10 px-4 sm:px-0">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-funnel animate-neon text-white pb-2 leading-none lg:leading-none tracking-wider whitespace-nowrap">
            Music Stream
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base font-light tracking-wider">
            Create or join your sonic experience
          </p>
        </div>

        <div className="space-y-12">
          <div className="group">
            <h2 className="font-funnel text-2xl md:text-3xl text-white mb-6 flex items-center gap-3 group-hover:text-blue-400 transition-colors duration-300">
              <Music className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              Join Room
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={joinRoom}
                  onChange={(e) => setJoinRoom(formatRoomId(e.target.value))}
                  placeholder="abc-def-ghi"
                  maxLength={11}
                  className="w-full bg-white/10 font-funnel backdrop-blur-xl border-2 border-white/20 rounded-2xl px-6 py-4 text-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/15 transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
              </div>
              <button className={buttonClasses} onClick={() => jointheRoom(joinRoom)}>
                <span className="relative z-10">Join</span>
                <ArrowRight size={20} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                <div className={buttonOverlayClasses}></div>
              </button>
            </div>
          </div>

          <div className="group">
            <h2 className="font-funnel text-2xl md:text-3xl text-white mb-6 flex items-center gap-3 group-hover:text-purple-400 transition-colors duration-300">
              <Sparkles className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
              Create Room
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
              <div className="relative flex-1 flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={createRoomId}
                    onChange={(e) => setcreateRoomId(formatRoomId(e.target.value))}
                    placeholder="abc-def-ghi"
                    className="w-full bg-white/10 font-funnel backdrop-blur-xl border-2 border-white/20 rounded-2xl px-6 py-4 text-lg text-white placeholder-white/40"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                </div>
                <button 
                  onClick={() => setcreateRoomId(generateRoomId())}
                  className="aspect-square w-[60px] h-[60px] bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/15 hover:scale-105 transition-all duration-300"
                >
                  <Plus size={24} className="transition-transform group-hover:rotate-180 duration-300" />
                </button>
              </div>
              <button onClick={() => createtheRoom(createRoomId)} className={buttonClasses}>
                <span className="relative z-10">Create</span>
                <ArrowRight size={20} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                <div className={buttonOverlayClasses}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Page;