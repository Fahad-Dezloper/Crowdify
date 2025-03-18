"use client";
import * as React from 'react';
import ChatBot from "@/app/components/ChatBot";
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { fetchRoomDetails } from '@/app/lib/fns/roomDetails';
import { WebSocketProvider } from '@/app/context/WebContext';
import StreamView from '@/app/components/StreamView';

const RoomPage = () => {
  const { roomId } = useParams();
  // const [socket, setSocket] = useState<WebSocket | null>(null);
  // const [messages, setMessages] = useState<string[]>([]);
  const [roomIdd, setRoomIdd] = useState<string | null>(null);
  // const [input, setInput] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (roomId) {
      // console.log("roomId.roomId", roomId);
      setRoomIdd(Array.isArray(roomId) ? roomId[0] : roomId);
    }
    fetchRoomDetails(roomId, setRoomData, setIsAdmin, setUserId);
  }, [roomId]);
  

  return (
    <WebSocketProvider roomId={roomIdd}>
    <div>
      <StreamView creatorId={userId} isAdmin={isAdmin} roomId={roomIdd} />
    </div>
    </WebSocketProvider>
  );
};

export default RoomPage;

