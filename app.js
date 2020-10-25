"use strict";

const express = require("express");
const socketIO = require("socket.io");

const PORT = process.env.PORT || 3000;
const INDEX = "/public/index.html";

const server = express()
  .use(express.static("public"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

const lobbies = {};

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("new-game", lname => {
    lobbies.push({lname : {"src":[], "players":[]}});
  });

  socket.on("send-chat-message", message => {
    socket.broadcast.emit("chat-message", {"message": message, "name": users[socket.id]});
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id]
  })
});

setInterval(() => io.emit("time", new Date().toTimeString()), 1000);