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
dotenv.config();
const PORT = process.env.WS_PORT || 4000;
const server = http.createServer();
const wss = new ws_1.WebSocketServer({ server });
const rooms = new Map();
wss.on("connection", (ws) => {
    let roomId = null;
    ws.on("message", (message) => {
        var _a, _b, _c;
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
            }
            else if (data.type === "message" && roomId) {
                (_c = rooms.get(roomId)) === null || _c === void 0 ? void 0 : _c.users.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "message", text: data.text, sender: data.sender }));
                    }
                });
            }
            else if (data.type === "addSong") {
                // console.log("data rec for ws: ", data);
                wss.clients.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "addSong", song: data.song }));
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
