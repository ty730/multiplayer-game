(function() {
  let socket = io();
  let el;

  let lid = "";
  let playername = "";
  let players = [];

  window.addEventListener("load", init);

  function init() {
    // When you open the website get the currently available lobbies
    socket.emit("get-lobbies");
    socket.on("give-lobbies", updateLobbyList);

    id("hostbtn").addEventListener("click", host);
    id("joinbtn").addEventListener("click", join);
    id("new-game").addEventListener("submit", startNewGame);
    id("join-game").addEventListener("submit", joinGame);
    id("begin").addEventListener("click", begin);
    socket.on("new-lobby", onNewLobby);
    socket.on("joined-game", playerJoined);
    socket.on("begin-game", beginGame);
    socket.on("get-caption", getCaption);
    id("caption-form").addEventListener("submit", collectAnswer);

    // For messaging other players once you've joined a lobby
    id("send-container").addEventListener("submit", writeMessage);
  }

   /**
   * Takes you to the host screen
   */
  function host() {
    console.log("hosting");
    id("main").classList.add("hidden");
    id("host").classList.remove("hidden");
  }

  /**
   * Takes you to the join screen
   */
  function join() {
    console.log("joining");
    id("main").classList.add("hidden");
    id("join").classList.remove("hidden");
  }

  /**
   * Hosts a new game on the lobby name inputted by the user
   */
  function startNewGame(e) {
    e.preventDefault();
    let lname = id("lname").value;
    console.log("before new-game: " + lname);
    socket.emit("new-game", lname);

    lid = lname;

    id("host").classList.add("hidden");
    id("hostedname").textContent = lname;
    id("hosted").classList.remove("hidden");
  }

  /**
   * Attempts to get the user to join the lobby that they inputed
   * with the name they inputted. The join might not work if lobby name isnt correct.
   */
  function joinGame(e) {
    e.preventDefault();
    let name = id("name").value;
    playername = name;
    let lobbyId = id("lobbyid").value;
    let object = {"lobby": lobbyId, "player": name};
    console.log("before join-game: " + lobbyId);
    console.log("person name: " + name);
    socket.emit("join-game", object);
  }

  /**
   * Helper function to put all of the names of the lobbies onto the page
   */
  function updateLobbyList(lobbies) {
    console.log("updateLobbyList: " + lobbies)
    id("lobby-list").innerHTML = "";
    for (let i = 0; i < lobbies.length; i++) {
      appendLobby(lobbies[i], i);
    }
  }

  /**
   * When a new lobby is created, adds it to the list of lobbies
   */
  function onNewLobby(lobby) {
    console.log("WE ARE HERE: " + lobby)
    appendLobby(lobby, id("lobby-list").childNodes.length);
  }

  /**
   * Helper function to append a new lobby to the lobby list
   */
  function appendLobby(lobby, i) {
    let lobbyListItem = gen("li");
    lobbyListItem.textContent = lobby.lname;
    lobbyListItem.id = "lobby" + i;
    id("lobby-list").appendChild(lobbyListItem);
  }

  /**
   * Player is attempting to join a lobby. If the newest player in the lobby
   * is the current players name (global variable) then admit them into the lobby.
   * If the current player is not the player, then check the lobby id (lid, global variable),
   * if that is the lobby then we might be the host, so append the new players name
   * to list of players in the lobby.
   */
  function playerJoined(lobby) {
    console.log("playername: " + playername);
    if (lobby == null) {
      //console.log("invalid lobby name");
      //id("joinmessage").textContent = "Invalid lobby name, try again.";

    } else if (lobby.players[lobby.players.length - 1] == playername) {
      console.log("player joined game: " + lobby.players[0]);
      id("join").classList.add("hidden");
      id("ingame").classList.remove("hidden");
      id("joinmessage").textContent = "You joined: " + lobby.lname + ", waiting for other players...";
    } else if (lobby.lname == lid) {
      console.log("last on list: " + lobby.players[lobby.players.length - 1]);
      let playerListItem = gen("li");
      playerListItem.textContent = lobby.players[lobby.players.length - 1];

      players.push(lobby.players[lobby.players.length - 1]);
      //playerListItem.id = "player";
      id("player-list").appendChild(playerListItem);

      if (players.length >= 2) {
        id("begin").classList.remove("hidden");
      }
    }
  }

  /**
   * When a player sends a message this writes the message and sends the message
   * to other players
   */
  function begin() {
    id("hosted").classList.add("hidden");
    id("gamescreen").classList.remove("hidden");
    socket.emit("begin", players);
    setTimeout(displayImage, 3000);
  }

  /**
   *
   */
  function beginGame(playerArr) {
    console.log("THE GAME STARTED");
    if (playerArr.includes(playername)) {
      id("joinmessage").textContent = "Game has started";
    }
  }

  /**
   *
   */
  function displayImage() {
    let image = gen("img");
    image.src = "images/colby.JPG";
    id("image-container").appendChild(image);
    let index = 1;
    socket.emit("image-displayed", index);
  }

  /**
   *
   */
  function getCaption() {
    id("answer").classList.remove("hidden");
  }

  /**
   *
   */
  function collectAnswer(e) {
    e.preventDefault();
    console.log("target: " + e.target);
    let caption = id("caption").value;
    console.log("caption: " + caption);
  }

  /**
   * When a player sends a message this writes the message and sends the message
   * to other players
   */
  function writeMessage(event) {
    event.preventDefault();
    let messageInput = document.getElementById("input");
    let message = messageInput.value;
    let text = appendMessage("You: " + message);
    text.classList.add("you");
    socket.emit("send-chat-message", message);
    messageInput.value = "";
  }

  /**
   * Helper function to append new messages to the chat
   */
  function appendMessage(message) {
    let messageElement = document.createElement("div");
    messageElement.innerText = message;
    let messageContainter = document.getElementById("messages");
    messageContainter.append(messageElement);
    return messageElement;
  }
  /**
   * When a different player sends a message then append it to the chat.
   */
  socket.on("chat-message", data => {
    console.log(data.name, data.message);
    let text = appendMessage(data.name + ": " + data.message);
    text.classList.add("other");
  });

  /* socket.on("user-connected", name => {
    let text = appendMessage(name + " connected");
    text.classList.add("other");
  });

  socket.on("user-disconnected", name => {
    let text = appendMessage(name + " disconnected");
    text.classList.add("other");
  }); */

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id (null if none).
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} selector - CSS query selector
   * @returns {object[]} array of DOM objects matching the query (empty if none).
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns the new element of given type
   * @param {string} elType - an elements type
   * @returns {element} new element of the given type.
   */
  function gen(elType) {
    return document.createElement(elType);
  }
})();
