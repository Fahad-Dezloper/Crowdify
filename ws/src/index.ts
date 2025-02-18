/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express'
import http from 'http'
import {Server} from 'socket.io'
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket) => {
    socket.emit("user-connected", { message: "Welcome to the server!" }) 
    console.log("Socket Connected")
})

  
  server.listen(8080, () => {
    console.log('listening on *:8080');
  });