/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { fetchRoomDetails } from "../lib/fns/roomDetails";

interface WebSocketContextProps {
  messages: string[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

// @ts-ignore
export const WebSocketProvider:React.FC<{ children: React.ReactNode; roomId: string; userId: string }> = ({children, roomId, userId}: {children: React.ReactNode}) => {
  const [queue, setQueue] = useState<any[]>([])
  const [messages, setMessages] = useState<string[]>([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [userUpvotes, setUserUpvotes] = useState(new Set());
    // const [input, setInput] = useState("");
    const [roomData, setRoomData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [creatorId, setCreatorId] = useState(null);
    // const [userId, setUserId] = useState(null);
    const [userDets, setUserDets] = useState(null);
    const [chatPaused, setChatPaused] = useState(false);
    const [songAddStatus, setSongAddStatus] = useState(false);
    const [roomIdd, setRoomIdd] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
  // alert("here baby0");
    // console.log("response from roomId", roomId);

    const fetchDets = async () => {
      // @ts-ignore
        try{
          const res = await fetchRoomDetails(roomId);
          // console.log("res from /api/room:-", res);
          setRoomData(res?.room.room);
          setIsAdmin(res?.room.isAdmin);
          // setUserId(res?.room.userId);
          setRoomData(res?.room);
          setUserDets(res?.user);
          setCreatorId(res?.room.room.adminId);
        } catch {
          console.log("error while fetching from context")
        }
    }

    
    // setRoomData(res.data.room); 
    // setIsAdmin(res.data.isAdmin);
    // setUserId(res.data.userId);
    // setRoomData(res);
    // setUserDets(userDetails);

    useEffect(() => {
      if (roomId) {
        fetchDets();
      }
    }, [roomId]);

    useEffect(() => {
        if (!roomId || !userId) {
          console.error("Either room id or userId is not there",  userId, roomId);
        }

        // if (!process.env.WS_URL) {
        //   console.error("WebSocket URL is not defined in environment variables.");
        //   return;
        // }
        // console.log("we cam ehre to call", userId);
        // const ws = new WebSocket(process.env.WS_URL);
        // const ws = new WebSocket("ws://localhost:4000");
        const ws = new WebSocket("wss://adcc-110-235-239-186.ngrok-free.app");

        wsRef.current = ws;

        ws.onopen = () => {
          console.log("Connected to WebSocket", ws);
          setSocket(ws);
          ws.send(JSON.stringify({ type: "join", roomId: roomId, userId: userId }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // console.log("data rec for sending in ws: ", data);
            switch (data.type){
              case "message":
                // console.log("message vala data", data);
                setMessages((prev) => [...prev, data.text]);
                break;
              case "songQueue":
                setQueue(data.queue);
                break;
              case "voteUpdate":
                setQueue(data.queue);
                break;
              case "nowPlaying":
                // console.log("data for now playing", data);
                setNowPlaying(data.song);
                break;
              case "chatStatus":
                // console.log("data for chat control", data);
                setChatPaused(data.paused);
                break;
              case "allowSongAdd":
                // console.log("data for allowSongAdd", data);
                setSongAddStatus(data.paused);
                break;
              default:
              console.log("Unknown Websocket event:", data);
            }
            // console.log("data rec for sending in ws: ", data);
            // console.log('message received');
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

        return () => {
          ws.close();
        };

    }, [roomId]);

    const sendMessage = (text: any, sender: any) => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: "message", text, sender }));
      }
    };
  
    const addSong = (song: any) => {
      console.log("added song event happended", song);
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: "addSong", song, roomId }));
      }
    };
  
    const upvoteSong = (songId: unknown, userId: any) => {
      // console.log("here yo wassup", songId, "here i am", userId);
      
      if (!songId || !userId) return;
    
      setQueue((prevQueue) =>
        prevQueue.map((song) => {
          if (song.streamId === songId) {
            if (userUpvotes.has(songId)) {
              // console.log("downvote");
              wsRef.current?.send(
                JSON.stringify({
                  type: "voteUpdate",
                  songId,
                  userId,
                  voteType: "downvote",
                })
              );
    
              setUserUpvotes((prev) => {
                const updated = new Set(prev);
                updated.delete(songId);
                return updated;
              });
    
              return { ...song, upvoteCount: Math.max(song.upvoteCount - 1, 0) };
            }
    
            // console.log("upvote");
            wsRef.current?.send(
              JSON.stringify({
                type: "voteUpdate",
                songId,
                userId,
                voteType: "upvote",
              })
            );
    
            setUserUpvotes((prev) => new Set([...prev, songId]));
            return { ...song, upvoteCount: song.upvoteCount + 1 };
          }
          return song;
        })
      );
    };
    
    const nextSong = () => {
      if(!userId) return;
      wsRef.current?.send(
        JSON.stringify({
          type: "nextSong",
        })
      );
    }

    const prevSong = () => {
      if(!userId) return;
      wsRef.current?.send(
        JSON.stringify({
          type: "prevSong",
        })
      );
    }

    const messageControl = () => {
      // console.log("called meesage control")
      if(!userId) return;
      wsRef.current?.send(
        JSON.stringify({
          type: "chatpause"
        })
      )
    }

    const allowSongAdd = () => {
      console.log("called allowSongAdd")
      if(!userId) return;
      wsRef.current?.send(
        JSON.stringify({
          type: "allowSongAdd"
        })
      )
    }
    
      return (
        // @ts-ignore
        <WebSocketContext.Provider value={{ messages, sendMessage, queue, addSong, upvoteSong, userUpvotes, setUserUpvotes, userId, roomIdd, isAdmin, socket, nowPlaying, nextSong, prevSong, messageControl, chatPaused, allowSongAdd, songAddStatus, userDets, creatorId }}>
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



