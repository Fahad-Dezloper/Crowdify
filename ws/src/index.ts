import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import * as dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const PORT = process.env.WS_PORT || 4000;
const server = http.createServer();
const wss = new WebSocketServer({ server });

const redisClient = createClient({
  socket: {
    host: "localhost",
    port: 6379,
  },
});

redisClient.connect().catch(console.error);

interface Room {
  users: Set<WebSocket>;
  chatPaused: boolean;
  allowSongAdd: boolean; 
}

const rooms = new Map<string, Room>();

wss.on("connection", (ws) => {
  let roomId: string | null = null;

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "join") {
        roomId = data.roomId ?? null;

        if (!roomId) {
          console.error("Invalid roomId received:", data.roomId);
          return;
        }

        if (!rooms.has(roomId)) {
          rooms.set(roomId, { users: new Set(), chatPaused: false, allowSongAdd: false });
        }

        rooms.get(roomId)?.users.add(ws);
        console.log(`User joined room: ${roomId}`);

        const chatPaused = rooms.get(roomId)?.chatPaused || false;
        console.log("status of chatPaused", chatPaused)
        ws.send(JSON.stringify({ type: "chatStatus", paused: chatPaused }));

        const allowSongAdd = rooms.get(roomId)?.allowSongAdd || false;
        console.log("status of chatPaused", allowSongAdd)
        ws.send(JSON.stringify({ type: "allowSongAdd", paused: allowSongAdd }));

        try {
          const messages = await redisClient.lRange(`chat:${roomId}`, 0, -1);
          messages.reverse().forEach((msg) => {
            ws.send(JSON.stringify({ type: "message", ...JSON.parse(msg) }));
          });
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }

        try {
          const songs = await redisClient.lRange(`queue:${roomId}`, 0, -1);
          const parsedSongs = songs.map((song) => JSON.parse(song));
          ws.send(JSON.stringify({ type: "songQueue", queue: parsedSongs }));
        } catch (error) {
          console.error("Error fetching song queue:", error);
        }

        try {
          const nowPlayingSong = await redisClient.get(`nowPlaying:${roomId}`);
          if (nowPlayingSong) {
            ws.send(JSON.stringify({ type: "nowPlaying", song: JSON.parse(nowPlayingSong) }));
          }
        } catch (error) {
          console.error("Error fetching now playing song:", error);
        }
      }

      else if (data.type === "message" && roomId) {
        const messageData = JSON.stringify({ text: data.text, sender: data.sender });
        await redisClient.lPush(`chat:${roomId}`, messageData);
        await redisClient.lTrim(`chat:${roomId}`, 0, 49);
        const room = rooms.get(roomId);

        if (room?.chatPaused) {
          ws.send(JSON.stringify({ 
            type: "chatError", 
            message: "Chat is currently paused by the room admin"
          }));
          return;
        }

        rooms.get(roomId)?.users.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "message", text: data.text, sender: data.sender }));
          }
        });
      }

      else if (data.type === "addSong" && roomId) {
        const song = data.song;
        // console.log("Song added:", song);

        try {
          await redisClient.rPush(`queue:${roomId}`, JSON.stringify(song));
          // console.log(`Song added to Redis queue: ${song.title}`);
          
        } catch (error) {
          console.error("Error adding song to Redis:", error);
        }

        const songs = await redisClient.lRange(`queue:${roomId}`, 0, -1);
        const parsedSongs = songs.map((song) => JSON.parse(song));

        rooms.get(roomId)?.users.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "addSong", song }));
            client.send(JSON.stringify({ type: "songQueue", queue: parsedSongs }));
          }
        });
      }

      else if (data.type === "voteUpdate" && roomId) {
        console.log("Vote update event happeing received:", data);
        try {
          if (!data.songId || !data.voteType || !data.userId) {
            console.error("Error: songId, userId, or voteType is missing in the received data:", data);
            return;
          }
      
          const userVoteKey = `vote:${roomId}:${data.songId}:${data.userId}`;
          const songQueueKey = `queue:${roomId}`;
      
          // Fetch user's existing vote status
          const existingVote = await redisClient.get(userVoteKey);
      
          // Fetch and parse song queue
          let songs = await redisClient.lRange(songQueueKey, 0, -1);
          
          // Create a map to track unique songs by streamId to prevent duplicates
          const uniqueSongsMap = new Map();
          
          // First pass - parse all songs and keep only the last occurrence of each songId
          songs.forEach(songString => {
            const song = JSON.parse(songString);
            uniqueSongsMap.set(song.streamId, song);
          });
          
          // Convert map back to array
          let parsedQueue = Array.from(uniqueSongsMap.values());
      
          let updatedQueue = parsedQueue.map(song => {
            if (song.streamId === data.songId) {
              let newUpvoteCount = song.upvoteCount || 0;
      
              // If user has already voted this way, they're canceling their vote
              if (existingVote === data.voteType) {
                // Cancel existing vote
                newUpvoteCount += (data.voteType === "upvote") ? -1 : 0;
                redisClient.del(userVoteKey);
              } 
              // If user is changing their vote (upvote to downvote or vice versa)
              else if (existingVote && existingVote !== data.voteType) {
                // If changing from downvote to upvote, add 1
                if (data.voteType === "upvote") {
                  newUpvoteCount += 1;
                }
                // If changing from upvote to downvote, subtract 1
                else {
                  newUpvoteCount = Math.max(newUpvoteCount - 1, 0);
                }
                redisClient.set(userVoteKey, data.voteType);
              } 
              // User hasn't voted before
              else {
                newUpvoteCount += (data.voteType === "upvote") ? 1 : 0;
                redisClient.set(userVoteKey, data.voteType);
              }
      
              return { ...song, upvoteCount: newUpvoteCount };
            }
            return song;
          });
      
          // Use a multi/exec transaction to ensure atomic updates
          const multi = redisClient.multi();
          multi.del(songQueueKey);
          
          for (const song of updatedQueue) {
            multi.rPush(songQueueKey, JSON.stringify(song));
          }
          
          // Execute all commands atomically
          await multi.exec();
      
          // Find highest voted song
          // let highestVotedSong = updatedQueue.length
          //   ? updatedQueue.reduce((prev, curr) =>
          //       (prev?.upvoteCount || 0) > (curr?.upvoteCount || 0) ? prev : curr
          //     )
          //   : null;
      
          // if (highestVotedSong) {
          //   await redisClient.set(`nowPlaying:${roomId}`, JSON.stringify(highestVotedSong));
          // }
      
          // Broadcast updated queue and now playing song
          rooms.get(roomId)?.users.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "voteUpdate", queue: updatedQueue }));
              // if (highestVotedSong) {
              //   client.send(JSON.stringify({ type: "nowPlaying", song: highestVotedSong }));
              // }
            }
          });
      
          // console.log("Updated Queue:", updatedQueue);
          // console.log("New Now Playing:", highestVotedSong);
        } catch (error) {
          console.error("Error updating votes:", error);
        }
      }
 
      else if(data.type === "nextSong" && roomId) {
        console.log("next song event happen");
        // console.l/

        try {
            const songQueueKey = `queue:${roomId}`;
            const historyKey = `history:${roomId}`;
            const nowPlayingKey = `nowPlaying:${roomId}`;
            
            // Get current song to add to history
            const currentSongStr = await redisClient.get(nowPlayingKey);
            if (currentSongStr) {
                // Add current song to history (push to front)
                await redisClient.lPush(historyKey, currentSongStr);
                // Keep only the last 5 songs in history
                await redisClient.lTrim(historyKey, 0, 4);
            }
            
            // Get all songs from queue
            const songs = await redisClient.lRange(songQueueKey, 0, -1);
            const parsedSongs = songs.map(song => JSON.parse(song));
            
            if (parsedSongs.length > 0) {
                // Find song with highest upvotes
                const mostUpvotedSong = parsedSongs.reduce((prev, curr) => 
                    (prev?.upvoteCount || 0) > (curr?.upvoteCount || 0) ? prev : curr, parsedSongs[0]);
                
                if (mostUpvotedSong) {
                    // Set as now playing
                    await redisClient.set(nowPlayingKey, JSON.stringify(mostUpvotedSong));
                    
                    // Remove the song from queue
                    const updatedQueue = parsedSongs.filter(song => 
                        song.streamId !== mostUpvotedSong.streamId);
                    
                    // Update queue in Redis
                    const multi = redisClient.multi();
                    multi.del(songQueueKey);
                    
                    for (const song of updatedQueue) {
                        multi.rPush(songQueueKey, JSON.stringify(song));
                    }
                    
                    await multi.exec();
                    
                    // Broadcast updates to all clients
                    rooms.get(roomId)?.users.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ 
                                type: "nowPlaying", 
                                song: mostUpvotedSong 
                            }));
                            client.send(JSON.stringify({ 
                                type: "songQueue", 
                                queue: updatedQueue 
                            }));
                        }
                    });
                    
                    console.log(`Next song now playing: ${mostUpvotedSong.title}`);
                }
            } else {
                console.log("No songs in queue");
            }
        } catch (error) {
            console.error("Error handling next song:", error);
        }
      }

      else if(data.type === "prevSong" && roomId){
        console.log("event trigger for previous song")
      }

      else if (data.type === "chatpause" && roomId) {
        const room = rooms.get(roomId);
        if (!room) return;
        
        console.log("chat pause", data)
        console.log("chat pause status", room?.chatPaused)
        room.chatPaused = !room.chatPaused;
        
        await redisClient.set(`chatStatus:${roomId}`, room.chatPaused ? "paused" : "active");
        
        room.users.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
              type: "chatStatus",
              paused: room.chatPaused,
            }));
          }
        });
        
        console.log(`Chat ${room.chatPaused ? "paused" : "resumed"} in room ${roomId}`);
      }

      else if (data.type === "allowSongAdd" && roomId) {
        const room = rooms.get(roomId);
        if (!room) return;
        
        console.log("allowSongAdd event", data)
        console.log("allowSongAdd add status before", room?.allowSongAdd)
        room.allowSongAdd = !room.allowSongAdd;
        console.log("allowSongAdd add status after", room?.allowSongAdd)
        
        await redisClient.set(`allowSongAdd:${roomId}`, room.allowSongAdd ? "paused" : "active");
        
        room.users.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
              type: "allowSongAdd",
              paused: room.allowSongAdd,
            }));
          }
        });
        
        console.log(`Chat ${room.allowSongAdd ? "paused" : "resumed"} in room ${roomId}`);
      }

    } catch (error) {
      console.error("Failed to parse incoming message:", error);
    }

  });

  ws.on("close", () => {
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId)?.users.delete(ws);
      if (rooms.get(roomId)?.users.size === 0) {
        rooms.delete(roomId);
      }
      console.log(`User left room: ${roomId}`);
    }
  });
});

server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));