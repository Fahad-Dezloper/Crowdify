"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    socket.emit("user-connected", { message: "Welcome to the server!" });
    console.log("Socket Connected");
});
server.listen(8080, () => {
    console.log('listening on *:8080');
});
