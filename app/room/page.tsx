"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  return cleanInput
    .match(/.{1,3}/g)
    ?.join("-") || ""; 
};


const Page = () => {
  const [createRoomId, setcreateRoomId] = useState("");
  const [joinRoom, setJoinRoom] = useState("");
  const router = useRouter();


  async function jointheRoom(joinRoomId: string){
    if (!joinRoomId) {
      alert("Room ID cannot be empty!");
      return;
    }
    alert(joinRoomId);
    try {
      const res = await axios.post("/api/room/join", {
        roomId: joinRoomId
      })
      if(!res){
        console.log("Error while joining room");  
      }
      router.push(`/room/${res.data.id}`);
    } catch {
      console.log("Error while joining room");
    }
  }

  async function createtheRoom(createRoomId: string){
    if (!createRoomId) {
      alert("Room ID cannot be empty!");
      return;
    }
    alert(createRoomId);
    try {
      const res = await axios.post("/api/room/create", {
        roomId: createRoomId
      })
      if(!res){
        console.log("Error while creating room");  
      }
      console.log("here is the response recieved", res);
      router.push(`/room/${createRoomId}`);
    } catch {
      console.log("Error while creating room");
    }
  }

  return (
    <motion.div className="w-screen bg-white h-screen p-6">
      <motion.div className="primaryGradient w-full h-full flex-col gap-3 rounded-2xl font-funnel text-3xl font-semibold flex items-center justify-center text-white">
        Join or Create a Room
        <div className="flex flex-col gap-2">
          <h1>Join a room</h1>
          <div className="flex gap-2">
            <input
              type="text"
              className="text-black p-3 rounded-2xl outline-none"
              placeholder="abc-def-ghi"
              value={joinRoom}
              maxLength={11}
              onChange={(e) => setJoinRoom(e.target.value)}
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-2xl"
              onClick={() => jointheRoom(joinRoom)}
            >
              GO
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1>Create a room</h1>
          <div className="flex gap-2">
            <input
              type="text"
              className="text-black p-3 rounded-2xl outline-none"
              placeholder="abc-def-ghi"
              maxLength={11}
              value={createRoomId}
              onChange={(e) => setcreateRoomId(formatRoomId(e.target.value))}
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-2xl"
              onClick={() => setcreateRoomId(generateRoomId())}
            >
              +
            </button>
            <button
              className="bg-black text-white px-4 py-2 rounded-2xl"
              onClick={() => createtheRoom(createRoomId)}
            >
              GO
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Page;
