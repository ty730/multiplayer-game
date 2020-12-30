(function() {
  let socket = io();
  let el;

  let lid = "";
  let playername = "";
  let players = [];

  window.addEventListener("load", init);

  function init() {
    socket.emit("get-lobbies");
    socket.on("give-lobbies", updateLobbyList);
    console.log("started");
    id("hostbtn").addEventListener("click", host);
    id("joinbtn").addEventListener("click", join);
    id("new-game").addEventListener("submit", startNewGame);
    id("join-game").addEventListener("submit", joinGame);
    socket.on("new-lobby", onNewLobby);
    socket.on("joined-game", playerJoined);

    id("send-container").addEventListener("submit", writeMessage);
  }

  function host() {
    console.log("hosting");
    id("main").classList.add("hidden");
    id("host").classList.remove("hidden");
  }

  function join() {
    console.log("joining");
    id("main").classList.add("hidden");
    id("join").classList.remove("hidden");
  }

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

  function updateLobbyList(lobbies) {
    console.log("updateLobbyList: " + lobbies)
    id("lobby-list").innerHTML = "";
    for (let i = 0; i < lobbies.length; i++) {
      appendLobby(lobbies[i], i);
    }
  }

  function onNewLobby(lobby) {
    console.log("WE ARE HERE: " + lobby)
    appendLobby(lobby, id("lobby-list").childNodes.length);
  }

  function appendLobby(lobby, i) {
    let lobbyListItem = gen("li");
    lobbyListItem.textContent = lobby.lname;
    lobbyListItem.id = "lobby" + i;
    id("lobby-list").appendChild(lobbyListItem);
  }

  function playerJoined(lobby) {
    console.log("playername: " + playername);
    if (lobby == null) {
      //console.log("invalid lobby name");
      //id("joinmessage").textContent = "Invalid lobby name, try again.";

    } else if (lobby.players[lobby.players.length - 1] == playername) {
      console.log("player joined game: " + lobby.players[0]);
      id("join").classList.add("hidden");
      id("ingame").classList.remove("hidden");
      id("joinmessage").textContent = "You joined the lobby: " + lobby.lname + ", waiting for other players...";
      //id("join-lobby").disabled = true;
      //id("name").textContent = "";
      //id("lobbyid").textContent = "";

    } else if (lobby.lname == lid) {
      console.log("last on list: " + lobby.players[lobby.players.length - 1]);
      let playerListItem = gen("li");
      playerListItem.textContent = lobby.players[lobby.players.length - 1];

      players.push(lobby.players[lobby.players.length - 1]);
      //playerListItem.id = "player";
      id("player-list").appendChild(playerListItem);
    }
  }

  function writeMessage(event) {
    event.preventDefault();
    let messageInput = document.getElementById("input");
    let message = messageInput.value;
    let text = appendMessage("You: " + message);
    text.classList.add("you");
    socket.emit("send-chat-message", message);
    messageInput.value = "";
  }

  function appendMessage(message) {
    let messageElement = document.createElement("div");
    messageElement.innerText = message;
    let messageContainter = document.getElementById("messages");
    messageContainter.append(messageElement);
    return messageElement;
  }

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
