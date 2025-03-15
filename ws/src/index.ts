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
          rooms.set(roomId, { users: new Set() });
        }

        rooms.get(roomId)?.users.add(ws);
        console.log(`User joined room: ${roomId}`);

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

        rooms.get(roomId)?.users.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "message", text: data.text, sender: data.sender }));
          }
        });
      }

      else if (data.type === "addSong" && roomId) {
        const song = data.song;
        console.log("Song added:", song);

        try {
          await redisClient.rPush(`queue:${roomId}`, JSON.stringify(song));
          console.log(`Song added to Redis queue: ${song.title}`);
        } catch (error) {
          console.error("Error adding song to Redis:", error);
        }

        rooms.get(roomId)?.users.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "addSong", song }));
          }
        });
      }

      else if (data.type === "voteUpdate" && roomId) {
        console.log("Vote update received:", data);

        try {
          const songs = await redisClient.lRange(`queue:${roomId}`, 0, -1);
          let parsedQueue = songs.map((song) => JSON.parse(song));

          parsedQueue = parsedQueue.map((song) =>
            song.streamId === data.song.streamId ? { ...song, upvoteCount: data.upvoteCount } : song
          );

          const highestVotedSong = parsedQueue.reduce((prev, curr) =>
            prev.upvoteCount > curr.upvoteCount ? prev : curr, parsedQueue[0]
          );

          await redisClient.set(`nowPlaying:${roomId}`, JSON.stringify(highestVotedSong));

          rooms.get(roomId)?.users.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "voteUpdate", queue: parsedQueue }));
              client.send(JSON.stringify({ type: "nowPlaying", song: highestVotedSong }));
            }
          });

          console.log("New Now Playing:", highestVotedSong);
        } catch (error) {
          console.error("Error updating votes:", error);
        }
      }

      else if (data.type === "updateQueue" && roomId) {
        console.log("Updating queue data:", data);

        try {
          const songs = await redisClient.lRange(`queue:${roomId}`, 0, -1);
          let parsedQueue = songs.map((song) => JSON.parse(song));

          parsedQueue = parsedQueue.filter(song => song.streamId !== data.song.currentVideo.id);

          const nextSong = parsedQueue.length > 0
            ? parsedQueue.reduce((prev, curr) => (prev.upvoteCount > curr.upvoteCount ? prev : curr), parsedQueue[0])
            : null;

          if (nextSong) {
            await redisClient.set(`nowPlaying:${roomId}`, JSON.stringify(nextSong));
          }

          rooms.get(roomId)?.users.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "songQueue", queue: parsedQueue }));
              if (nextSong) {
                client.send(JSON.stringify({ type: "nowPlaying", song: nextSong }));
              }
            }
          });

          console.log("Updated Queue:", parsedQueue);
          console.log("Next Song Playing:", nextSong);
        } catch (error) {
          console.error("Error updating queue:", error);
        }
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