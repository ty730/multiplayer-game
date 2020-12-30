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
const users = {};

io.on("connection", (socket) => {
  console.log("Client connected: " + socket.id);

  users[socket.id] = "No name";

  socket.on("get-lobbies", () => {
    console.log("current lobbies are:" + lobbies);
    socket.emit("give-lobbies", lobbies);
  });

  socket.on("new-game", lname => {
    let lobby = {"lname": lname, "src":[], "players":[]};
    lobbies.push(lobby);
    console.log("emit new-lobby: " + lobby);
    socket.emit("new-lobby", lobby);
  });

  socket.on("join-game", object => {
    let index = -1;
    for (let i = 0; i < lobbies.length; i++) {
      console.log(i + ": " + lobbies[i].lname);
      if (object.lobby == lobbies[i].lname) {
        console.log("found name!");
        index = i;
      }
    }
    if (index == -1) {
      console.log("no game of name: " + object.lobby);
      socket.emit("joined-game", null);
    } else {
      lobbies[index].players.push(object.player);
      users[socket.id] = object.player;
      console.log("joined game: " + object.player);
      socket.emit("joined-game", lobbies[index]);
      socket.broadcast.emit("joined-game", lobbies[index]);
    }
  });

  socket.on("send-chat-message", message => {
    socket.broadcast.emit("chat-message", {"message": message, "name": users[socket.id]});
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
    //socket.broadcast.emit("user-disconnected", users[socket.id]);
  });
});

setInterval(() => io.emit("time", new Date().toTimeString()), 1000);