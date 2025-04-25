
require("dotenv").config();
const express = require("express");
const DBConnection = require("./db.provider");
const cors = require("cors");
const http = require("http");
const socket = require("./socket"); // Importer le gestionnaire de socket
const ConversationsSocket = require("./src/conversations/Conversation.socket");
// const UserSocket = require("./src/users/user.socket");
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const IO = socket.initializeSocket(server);

app.use("/api", require("./index.route"));

IO.on("reconnect", () => {
  socket.emit("reconnect", { message: "❌ Utilisateur reconnecter" });
});

DBConnection.connection.sync({ alter: false, }).then(() => {
  console.log("Database connected");
});

server.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});

// TRUNCATE `message_references`;
// TRUNCATE `message_mentions`;
// TRUNCATE `conversations`;
// TRUNCATE `messages`

// module.exports = IO;
