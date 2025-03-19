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
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            const data = JSON.parse(message.toString());
            if (data.type === "join") {
                roomId = (_a = data.roomId) !== null && _a !== void 0 ? _a : null;
                if (!roomId) {
                    console.error("Invalid roomId received:", data.roomId);
                    return;
                }
                if (!rooms.has(roomId)) {
                    rooms.set(roomId, { users: new Set(), chatPaused: false, allowSongAdd: false });
                }
                (_b = rooms.get(roomId)) === null || _b === void 0 ? void 0 : _b.users.add(ws);
                console.log(`User joined room: ${roomId}`);
                const chatPaused = ((_c = rooms.get(roomId)) === null || _c === void 0 ? void 0 : _c.chatPaused) || false;
                console.log("status of chatPaused", chatPaused);
                ws.send(JSON.stringify({ type: "chatStatus", paused: chatPaused }));
                const allowSongAdd = ((_d = rooms.get(roomId)) === null || _d === void 0 ? void 0 : _d.allowSongAdd) || false;
                console.log("status of chatPaused", allowSongAdd);
                ws.send(JSON.stringify({ type: "allowSongAdd", paused: allowSongAdd }));
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
                const room = rooms.get(roomId);
                if (room === null || room === void 0 ? void 0 : room.chatPaused) {
                    ws.send(JSON.stringify({
                        type: "chatError",
                        message: "Chat is currently paused by the room admin"
                    }));
                    return;
                }
                (_e = rooms.get(roomId)) === null || _e === void 0 ? void 0 : _e.users.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "message", text: data.text, sender: data.sender }));
                    }
                });
            }
            else if (data.type === "addSong" && roomId) {
                const song = data.song;
                // console.log("Song added:", song);
                try {
                    yield redisClient.rPush(`queue:${roomId}`, JSON.stringify(song));
                    // console.log(`Song added to Redis queue: ${song.title}`);
                }
                catch (error) {
                    console.error("Error adding song to Redis:", error);
                }
                const songs = yield redisClient.lRange(`queue:${roomId}`, 0, -1);
                const parsedSongs = songs.map((song) => JSON.parse(song));
                (_f = rooms.get(roomId)) === null || _f === void 0 ? void 0 : _f.users.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
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
                    const existingVote = yield redisClient.get(userVoteKey);
                    // Fetch and parse song queue
                    let songs = yield redisClient.lRange(songQueueKey, 0, -1);
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
                            return Object.assign(Object.assign({}, song), { upvoteCount: newUpvoteCount });
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
                    yield multi.exec();
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
                    (_g = rooms.get(roomId)) === null || _g === void 0 ? void 0 : _g.users.forEach((client) => {
                        if (client.readyState === ws_1.WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: "voteUpdate", queue: updatedQueue }));
                            // if (highestVotedSong) {
                            //   client.send(JSON.stringify({ type: "nowPlaying", song: highestVotedSong }));
                            // }
                        }
                    });
                    // console.log("Updated Queue:", updatedQueue);
                    // console.log("New Now Playing:", highestVotedSong);
                }
                catch (error) {
                    console.error("Error updating votes:", error);
                }
            }
            else if (data.type === "nextSong" && roomId) {
                console.log("next song event happen");
                // console.l/
                try {
                    const songQueueKey = `queue:${roomId}`;
                    const historyKey = `history:${roomId}`;
                    const nowPlayingKey = `nowPlaying:${roomId}`;
                    // Get current song to add to history
                    const currentSongStr = yield redisClient.get(nowPlayingKey);
                    if (currentSongStr) {
                        // Add current song to history (push to front)
                        yield redisClient.lPush(historyKey, currentSongStr);
                        // Keep only the last 5 songs in history
                        yield redisClient.lTrim(historyKey, 0, 4);
                    }
                    // Get all songs from queue
                    const songs = yield redisClient.lRange(songQueueKey, 0, -1);
                    const parsedSongs = songs.map(song => JSON.parse(song));
                    if (parsedSongs.length > 0) {
                        // Find song with highest upvotes
                        const mostUpvotedSong = parsedSongs.reduce((prev, curr) => ((prev === null || prev === void 0 ? void 0 : prev.upvoteCount) || 0) > ((curr === null || curr === void 0 ? void 0 : curr.upvoteCount) || 0) ? prev : curr, parsedSongs[0]);
                        if (mostUpvotedSong) {
                            // Set as now playing
                            yield redisClient.set(nowPlayingKey, JSON.stringify(mostUpvotedSong));
                            // Remove the song from queue
                            const updatedQueue = parsedSongs.filter(song => song.streamId !== mostUpvotedSong.streamId);
                            // Update queue in Redis
                            const multi = redisClient.multi();
                            multi.del(songQueueKey);
                            for (const song of updatedQueue) {
                                multi.rPush(songQueueKey, JSON.stringify(song));
                            }
                            yield multi.exec();
                            // Broadcast updates to all clients
                            (_h = rooms.get(roomId)) === null || _h === void 0 ? void 0 : _h.users.forEach((client) => {
                                if (client.readyState === ws_1.WebSocket.OPEN) {
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
                    }
                    else {
                        console.log("No songs in queue");
                    }
                }
                catch (error) {
                    console.error("Error handling next song:", error);
                }
            }
            else if (data.type === "prevSong" && roomId) {
                console.log("event trigger for previous song");
            }
            else if (data.type === "chatpause" && roomId) {
                const room = rooms.get(roomId);
                if (!room)
                    return;
                console.log("chat pause", data);
                console.log("chat pause status", room === null || room === void 0 ? void 0 : room.chatPaused);
                room.chatPaused = !room.chatPaused;
                yield redisClient.set(`chatStatus:${roomId}`, room.chatPaused ? "paused" : "active");
                room.users.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
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
                if (!room)
                    return;
                console.log("allowSongAdd event", data);
                console.log("allowSongAdd add status before", room === null || room === void 0 ? void 0 : room.allowSongAdd);
                room.allowSongAdd = !room.allowSongAdd;
                console.log("allowSongAdd add status after", room === null || room === void 0 ? void 0 : room.allowSongAdd);
                yield redisClient.set(`allowSongAdd:${roomId}`, room.allowSongAdd ? "paused" : "active");
                room.users.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: "allowSongAdd",
                            paused: room.allowSongAdd,
                        }));
                    }
                });
                console.log(`Chat ${room.allowSongAdd ? "paused" : "resumed"} in room ${roomId}`);
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
