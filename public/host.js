(function() {
  let socket = io();
  let el;

  let player;
  let user1 = "";
  let user2 = "";

  window.addEventListener("load", init);

  function init() {
    let name = prompt("What is your name?");
    let text = appendMessage("You joined");
    text.classList.add("you");
    socket.emit("new-user", name);
    let messageForm = document.getElementById("send-container");
    messageForm.addEventListener("submit", writeMessage);
    document.querySelector(".user1").addEventListener("click", click);
    document.querySelector(".user2").addEventListener("click", click);
  }

  function click(event) {
    if (event.target.classList.contains("user1") && user1 !== "") {
      event.target.classList.add("clicked");
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

  socket.on("time", (timeString) => {
    el = document.getElementById("server-time");
    el.innerHTML = "Server time: " + timeString;
  });

  socket.on("chat-message", data => {
    console.log(data.name, data.message);
    let text = appendMessage(data.name + ": " + data.message);
    text.classList.add("other");
  });

  socket.on("user-connected", name => {
    let text = appendMessage(name + " connected");
    text.classList.add("other");
  });

  socket.on("user-disconnected", name => {
    let text = appendMessage(name + " disconnected");
    text.classList.add("other");
  });

  socket.on("new-player", data => {
    console.log(data.num);
    if (data.num == 1) {
      user1 = data.name;
    } else if (data.num == 2) {
      user2 = data.name;
    }
    console.log("1: " + user1, "2: " + user2);
  });
})();
