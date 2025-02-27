import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = process.env.WS_PORT || 4000;
const server = http.createServer();
const wss = new WebSocketServer({ server });

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
      } 
      else if (data.type === "message" && roomId) {
        rooms.get(roomId)?.users.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "message", text: data.text, sender: data.sender }));
          }
        });
      }
      else if (data.type === "addSong"){
        // console.log("data rec for ws: ", data);
        wss.clients.forEach((client) => {
          if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify({type: "addSong", song: data.song}))
          }
        })
      }
      else if(data.type === "voteUpdate"){
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    type: "voteUpdate",
                    song: data.song,
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
