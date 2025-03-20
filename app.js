const express = require("express");
const DBConnection = require("./db.provider");
const cors = require('cors');

const app = express();

// Autoriser CORS pour toutes les origines
app.use(cors()); // CORS est maintenant activé pour toutes les origines

const http = require("http");
const ConversationsSocket = require('./src/conversations/Conversation.socket');

const server = http.createServer(app);
const IO = require("socket.io")(server, {
  cors: {
    origin: "*", // Autoriser toutes les origines
    methods: ["GET", "POST"], // Méthodes autorisées
  }
});

IO.on("connection", (socket) => {
  socket.emit("welcome", { message: "Welcome to my api" });
  ConversationsSocket(socket);
  console.log("new user connected");
});

app.use(express.json());
app.use("/api", require("./index.route"));

DBConnection.connection.sync().then(() => {
  console.log("database connected");
});

server.listen(process.env.PORT || 5000, () => {
  console.log("server running on port 5000");
});
