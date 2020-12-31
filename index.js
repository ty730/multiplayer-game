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

  // When they ask for the lobbies, give the lobbies
  socket.on("get-lobbies", () => {
    console.log("current lobbies are:" + lobbies);
    socket.emit("give-lobbies", lobbies);
  });

  // Creates a new lobby with the given lobby name and empty data, adds that lobby to lobbies (global)
  socket.on("new-game", lname => {
    let lobby = {"lname": lname, "src": socket.id, "players":[]};
    lobbies.push(lobby);
    console.log("emit new-lobby: " + lobby);
    socket.emit("new-lobby", lobby);
  });

  // Player attempt to join, search through lobbies for matching name.
  // If no name found send back null, otherwise add that player to that lobby,
  // and send back the updated lobby
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

  // Sends a chat message and current users name to other sockets
  socket.on("send-chat-message", message => {
    socket.broadcast.emit("chat-message", {"message": message, "name": users[socket.id]});
  });

  // When current user disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
    // Get rid of lobby of disconnected host
    for (let i = 0; i < lobbies.length; i++) {
      if (lobbies[i].src == socket.id) { // If a host disconnected
        let deletedlobby = lobbies.splice(i, 1);
        // What do we do with the players in the deleted lobby??????????
        socket.emit("give-lobbies", lobbies);
      } else {
        for (let j = 0; j < lobbies[i].players.length; j++) {
          if (lobbies[i].players[j] == users[socket.id]) { // If a player disconnects
            console.log("player disconnected: " + users[socket.id]);
            //socket.emit("player-disconnected", {"player": users[socket.id], "lobby": lobbies[i].lname});
          }
        }
      }
    }



    //socket.broadcast.emit("user-disconnected", users[socket.id]);
  });
});

setInterval(() => io.emit("time", new Date().toTimeString()), 1000);