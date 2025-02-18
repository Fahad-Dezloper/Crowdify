"use client";
import React, { useState } from "react";
import { motion } from "motion/react";

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

const formatRoomId = (input) => {
  let cleanInput = input.replace(/-/g, "").slice(0, 9); // Remove existing dashes & limit length
  return cleanInput
    .match(/.{1,3}/g) // Group into sets of 3
    ?.join("-") || ""; // Add dashes between groups
};

const Page = () => {
  const [joinRoom, setJoinRoom] = useState("");
  const [createRoom, setCreateRoom] = useState("");

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
              onChange={(e) => setJoinRoom(e.target.value)}
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-2xl"
              onClick={() => setJoinRoom(generateRoomId())}
            >
              Generate
            </button>
            <button
              className="bg-black text-white px-4 py-2 rounded-2xl"
              // onClick={() => setJoinRoom(generateRoomId())}
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
              value={createRoom}
              onChange={(e) => setCreateRoom(formatRoomId(e.target.value))}
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-2xl"
              onClick={() => setCreateRoom(generateRoomId())}
            >
              Generate
            </button>
            <button
              className="bg-black text-white px-4 py-2 rounded-2xl"
              // onClick={() => setJoinRoom(generateRoomId())}
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
