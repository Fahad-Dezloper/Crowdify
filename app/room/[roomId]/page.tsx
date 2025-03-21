/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import * as React from 'react';
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { WebSocketProvider } from '@/app/context/WebContext';
import StreamView from '@/app/components/StreamView';
import axios from 'axios';

const RoomPage = () => {
  const { roomId } = useParams();
  const [roomIdd, setRoomIdd] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const res = await axios.get("/api/user/fetchUser");
      // console.log("res from room page", res);
      setUserId(res.data.user.id);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (roomId) {
      setRoomIdd(Array.isArray(roomId) ? roomId[0] : roomId);
      fetchUser();
    }
  }, [roomId]);

  if (!roomIdd || !userId || loading) {
    return <div>Loading...</div>;
  }

  return (
    <WebSocketProvider roomId={roomIdd} userId={userId}>
      <div className="w-full h-full overflow-y-auto">
        <StreamView roomId={roomIdd} />
      </div>
    </WebSocketProvider>
  );
};

export default RoomPage;
