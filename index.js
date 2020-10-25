"use strict";

const express = require("express");
const socketIO = require("socket.io");

const PORT = process.env.PORT || 3000;
const INDEX = "/public/index.html";

const server = express()
  .use(express.static("public"))
  .listen(PORT, () => console.log(`Listensing on ${PORT}`));

const io = socketIO(server);

const lobbies = [];

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("get-lobbies", () => {
    socket.emit("give-lobbies", lobbies);
  });

  socket.on("new-game", lname => {
    let lobby = {"lname": lname, "src":[], "players":[]};
    lobbies.push(lobby);
    console.log("emit new-lobby: " + lobby);
    socket.emit("new-lobby", lobby);
  });
});

setInterval(() => io.emit("time", new Date().toTimeString()), 1000);