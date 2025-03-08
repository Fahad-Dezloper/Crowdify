import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import * as dotenv from "dotenv";
import {createClient} from 'redis';

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
}

const rooms = new Map<string, Room>();

wss.on("connection", (ws) => {
  let roomId: string | null = null;

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "join") {
        roomId = data.roomId ?? null;

        if (!roomId) {
          console.error("Invalid roomId received:", data.roomId);
          return;
        }

        if (!rooms.has(roomId)) {
          rooms.set(roomId, { users: new Set() });
        }

        rooms.get(roomId)?.users.add(ws);
        console.log(`User joined room: ${roomId}`);

        redisClient.lRange(`chat:${roomId}`, 0, -1).then((messages) => {
          messages.reverse().forEach((message) => {
            ws.send(JSON.stringify({ type: "message", ...JSON.parse(message) }));
          });
        });

        redisClient.lRange(`queue:${roomId}`, 0, -1).then((songs) => {
          const parsedSongs = songs.map((song) => JSON.parse(song));
          console.log("here is parsed song", parsedSongs);
          ws.send(JSON.stringify({ type: "songQueue", queue: parsedSongs }));
        });
      }


      else if (data.type === "message" && roomId) {
        const messageData = JSON.stringify({ text: data.text, sender: data.sender });
        redisClient.lPush(`chat:${roomId}`, messageData);
        redisClient.lTrim(`chat:${roomId}`, 0, 49);
       rooms.get(roomId)?.users.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "message", text: data.text, sender: data.sender }));
          }
        });
      }

      else if (data.type === "addSong" && roomId){
        const song = data.song; // Extract song object

        // Store song in Redis List
        redisClient.rPush(`queue:${roomId}`, JSON.stringify(song)).then(() => {
          console.log(`Song added to queue in Redis: ${song.title}`);
        });

        // Broadcast new song to all clients in the room
        rooms.get(roomId)?.users.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "addSong", song }));
          }
        });
      }



      else if(data.type === "voteUpdate"){
        console.log("data ", data);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    type: "voteUpdate",
                    song: { 
                      ...data.song, 
                      upvoteCount: data.upvoteCount 
                  }
                })
            );
          }
        })
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
