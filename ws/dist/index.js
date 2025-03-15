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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    ws.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
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
                try {
                    const messages = yield redisClient.lRange(`chat:${roomId}`, 0, -1);
                    messages.reverse().forEach((msg) => {
                        ws.send(JSON.stringify(Object.assign({ type: "message" }, JSON.parse(msg))));
                    });
                }
                catch (error) {
                    console.error("Error fetching chat history:", error);
                }
                try {
                    const songs = yield redisClient.lRange(`queue:${roomId}`, 0, -1);
                    const parsedSongs = songs.map((song) => JSON.parse(song));
                    ws.send(JSON.stringify({ type: "songQueue", queue: parsedSongs }));
                }
                catch (error) {
                    console.error("Error fetching song queue:", error);
                }
                try {
                    const nowPlayingSong = yield redisClient.get(`nowPlaying:${roomId}`);
                    if (nowPlayingSong) {
                        ws.send(JSON.stringify({ type: "nowPlaying", song: JSON.parse(nowPlayingSong) }));
                    }
                }
                catch (error) {
                    console.error("Error fetching now playing song:", error);
                }
            }
            else if (data.type === "message" && roomId) {
                const messageData = JSON.stringify({ text: data.text, sender: data.sender });
                yield redisClient.lPush(`chat:${roomId}`, messageData);
                yield redisClient.lTrim(`chat:${roomId}`, 0, 49);
                (_c = rooms.get(roomId)) === null || _c === void 0 ? void 0 : _c.users.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "message", text: data.text, sender: data.sender }));
                    }
                });
            }
            else if (data.type === "addSong" && roomId) {
                const song = data.song;
                console.log("Song added:", song);
                try {
                    yield redisClient.rPush(`queue:${roomId}`, JSON.stringify(song));
                    console.log(`Song added to Redis queue: ${song.title}`);
                }
                catch (error) {
                    console.error("Error adding song to Redis:", error);
                }
                (_d = rooms.get(roomId)) === null || _d === void 0 ? void 0 : _d.users.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "addSong", song }));
                    }
                });
            }
            else if (data.type === "voteUpdate" && roomId) {
                console.log("Vote update received:", data);
                try {
                    const songs = yield redisClient.lRange(`queue:${roomId}`, 0, -1);
                    let parsedQueue = songs.map((song) => JSON.parse(song));
                    parsedQueue = parsedQueue.map((song) => song.streamId === data.song.streamId ? Object.assign(Object.assign({}, song), { upvoteCount: data.upvoteCount }) : song);
                    const highestVotedSong = parsedQueue.reduce((prev, curr) => prev.upvoteCount > curr.upvoteCount ? prev : curr, parsedQueue[0]);
                    yield redisClient.set(`nowPlaying:${roomId}`, JSON.stringify(highestVotedSong));
                    (_e = rooms.get(roomId)) === null || _e === void 0 ? void 0 : _e.users.forEach((client) => {
                        if (client.readyState === ws_1.WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: "voteUpdate", queue: parsedQueue }));
                            client.send(JSON.stringify({ type: "nowPlaying", song: highestVotedSong }));
                        }
                    });
                    console.log("New Now Playing:", highestVotedSong);
                }
                catch (error) {
                    console.error("Error updating votes:", error);
                }
            }
            else if (data.type === "updateQueue" && roomId) {
                console.log("Updating queue data:", data);
                try {
                    const songs = yield redisClient.lRange(`queue:${roomId}`, 0, -1);
                    let parsedQueue = songs.map((song) => JSON.parse(song));
                    parsedQueue = parsedQueue.filter(song => song.streamId !== data.song.currentVideo.id);
                    const nextSong = parsedQueue.length > 0
                        ? parsedQueue.reduce((prev, curr) => (prev.upvoteCount > curr.upvoteCount ? prev : curr), parsedQueue[0])
                        : null;
                    if (nextSong) {
                        yield redisClient.set(`nowPlaying:${roomId}`, JSON.stringify(nextSong));
                    }
                    (_f = rooms.get(roomId)) === null || _f === void 0 ? void 0 : _f.users.forEach((client) => {
                        if (client.readyState === ws_1.WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: "songQueue", queue: parsedQueue }));
                            if (nextSong) {
                                client.send(JSON.stringify({ type: "nowPlaying", song: nextSong }));
                            }
                        }
                    });
                    console.log("Updated Queue:", parsedQueue);
                    console.log("Next Song Playing:", nextSong);
                }
                catch (error) {
                    console.error("Error updating queue:", error);
                }
            }
        }
        catch (error) {
            console.error("Failed to parse incoming message:", error);
        }
    }));
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
