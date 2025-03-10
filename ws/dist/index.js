"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http = __importStar(require("http"));
const dotenv = __importStar(require("dotenv"));
const redis_1 = require("redis");
dotenv.config();
const PORT = process.env.WS_PORT || 4000;
const server = http.createServer();
const wss = new ws_1.WebSocketServer({ server });
const redisClient = (0, redis_1.createClient)({
    socket: {
        host: "localhost",
        port: 6379,
    },
});
redisClient.connect().catch(console.error);
const rooms = new Map();
wss.on("connection", (ws) => {
    let roomId = null;
    ws.on("message", (message) => {
        var _a, _b, _c, _d;
        try {
            const data = JSON.parse(message.toString());
            if (data.type === "join") {
                roomId = (_a = data.roomId) !== null && _a !== void 0 ? _a : null;
                if (!roomId) {
                    console.error("Invalid roomId received:", data.roomId);
                    return;
                }
                if (!rooms.has(roomId)) {
                    rooms.set(roomId, { users: new Set() });
                }
                (_b = rooms.get(roomId)) === null || _b === void 0 ? void 0 : _b.users.add(ws);
                console.log(`User joined room: ${roomId}`);
                redisClient.lRange(`chat:${roomId}`, 0, -1).then((messages) => {
                    messages.reverse().forEach((message) => {
                        ws.send(JSON.stringify(Object.assign({ type: "message" }, JSON.parse(message))));
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
                (_c = rooms.get(roomId)) === null || _c === void 0 ? void 0 : _c.users.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "message", text: data.text, sender: data.sender }));
                    }
                });
            }
            else if (data.type === "addSong" && roomId) {
                const song = data.song; // Extract song object
                // Store song in Redis List
                redisClient.rPush(`queue:${roomId}`, JSON.stringify(song)).then(() => {
                    console.log(`Song added to queue in Redis: ${song.title}`);
                });
                // Broadcast new song to all clients in the room
                (_d = rooms.get(roomId)) === null || _d === void 0 ? void 0 : _d.users.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "addSong", song }));
                    }
                });
            }
            else if (data.type === "voteUpdate") {
                console.log("data ", data);
                wss.clients.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: "voteUpdate",
                            song: Object.assign(Object.assign({}, data.song), { upvoteCount: data.upvoteCount })
                        }));
                    }
                });
            }
            else if (data.type === "updateQueue") {
                console.log("updated queue data", data);
                const songToRemove = data.song.currentVideo;
                // Fetch current queue from Redis
                redisClient.lRange(`queue:${roomId}`, 0, -1).then((songs) => {
                    var _a;
                    let parsedQueue = songs.map((song) => JSON.parse(song));
                    // Remove the song
                    parsedQueue = parsedQueue.filter(song => song.streamId !== songToRemove.id);
                    // Clear and update Redis queue
                    redisClient.del(`queue:${roomId}`).then(() => {
                        const updatedQueue = parsedQueue.map(song => JSON.stringify(song));
                        redisClient.rPush(`queue:${roomId}`, updatedQueue);
                    });
                    // Broadcast updated queue to all clients
                    // @ts-ignore
                    (_a = rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.users.forEach((client) => {
                        if (client.readyState === ws_1.WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: "songQueue", queue: parsedQueue }));
                        }
                    });
                    console.log("Updated Queue:", parsedQueue);
                }).catch(console.error);
            }
        }
        catch (error) {
            console.error("Failed to parse incoming message:", error);
        }
    });
    ws.on("close", () => {
        var _a, _b;
        if (roomId && rooms.has(roomId)) {
            (_a = rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.users.delete(ws);
            if (((_b = rooms.get(roomId)) === null || _b === void 0 ? void 0 : _b.users.size) === 0) {
                rooms.delete(roomId);
            }
            console.log(`User left room: ${roomId}`);
        }
    });
});
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
