const express = require('express');
const app = express();
const port = 8080;
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

http.listen(port, () => {
  console.log('Listening on port: ' + port);
});