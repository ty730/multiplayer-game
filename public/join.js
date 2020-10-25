(function() {
  let socket = io();
  let el;

  let player;
  let user1 = "";
  let user2 = "";

  window.addEventListener("load", init);

  function init() {
    socket.emit("get-lobbies");
    socket.on("give-lobbies", updateLobbyList);
    socket.on("new-lobby", onNewLobby);
  }

  function updateLobbyList(lobbies) {
    console.log("updateLobbyList: " + lobbies)
    id("lobby-list").innerHTML = "";
    for (let i = 1; i <= lobbies.length; i++) {
      appendLobby(lobbies[i], i);
    }
  }

  function onNewLobby(lobby) {
    console.log("WE ARE HERE: " + lobby)
    appendLobby(lobby, id("lobby-list").childNodes().length);
  }

  function appendLobby(lobby, i) {
    let lobbyListItem = gen("li");
    lobbyListItem.textContent = lobby.lname;
    lobbyListItem.id = "lobby" + i;
    id("lobby-list").appendChild(lobbyListItem);
  }

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
