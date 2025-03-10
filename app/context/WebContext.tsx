/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchRoomDetails } from "../lib/fns/roomDetails";

interface WebSocketContextProps {
  messages: string[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const WebSocketProvider = ({children, roomId}: {children: React.ReactNode}) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [roomData, setRoomData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState(null);
    const [roomIdd, setRoomIdd] = useState<string | null>(null);
    const [queue, setQueue] = useState<any[]>([])

    console.log("response from roomId", roomId);

    const fetchDets = async () => {
        const res = await fetchRoomDetails(roomId, setRoomData, setIsAdmin, setUserId);
        console.log("res from /api/room:-", res);
        setRoomData(res);
    }
    useEffect(() => {
        if (roomId) {
          console.log("roomId.roomId", roomId);
          setRoomIdd(Array.isArray(roomId) ? roomId[0] : roomId);
        }
        fetchDets();
      }, [roomId]);

    useEffect(() => {
        if (!roomId) return;

        const ws = new WebSocket("ws://localhost:4000");

        ws.onopen = () => {
          console.log("Connected to WebSocket");
          ws.send(JSON.stringify({ type: "join", roomId: roomId }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("data rec for sending in ws: ", data);
            switch (data.type){
              case "message":
                setMessages((prev) => [...prev, data.text]);
                break;
              case "songQueue":
                setQueue(data.queue);
                break;
              case "updateQueue":
                console.log("update queue", data);
                setQueue((prevQueue) => prevQueue.filter(song => song.streamId !== data.song.currentVideo.id));
                break;
              case "addSong":
                setQueue((prevQueue) => [...prevQueue, data.song]);
                break;
                case "voteUpdate":
                setQueue((prevQueue) => {
                  const newQueue = JSON.parse(JSON.stringify(prevQueue));
                  return newQueue.map((item) =>
                    item.streamId === data.song.streamId 
                      ? { ...item, upvoteCount: data.song.upvoteCount } 
                      : item
                  );
                });
                break;
              default:
                console.log("Unknown Websocket event:", data);
            }
            console.log("data rec for sending in ws: ", data);
            console.log('message received');
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };


        ws.onerror = (event) => {
          console.error("WebSocket Error:", event);
        };

        ws.onclose = () => {
          console.log("WebSocket Disconnected");
          setSocket(null);
        };

        setSocket(ws);
        return () => {
          ws.close();
        };
    }, [roomId]);

    const sendMessage = () => {
        if (socket && input.trim()) {
          socket.send(JSON.stringify({ type: "message", text: input }));
          setInput("");
        }
      };

    

      return (
        <WebSocketContext.Provider value={{ messages, input, setInput, sendMessage, userId, roomIdd, isAdmin, socket, queue }}>
          {children}
        </WebSocketContext.Provider>
      );
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
      throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
  };