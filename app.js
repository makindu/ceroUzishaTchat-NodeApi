// const express = require("express");
// const DBConnection = require("./db.provider");
// const cors = require('cors');

// const app = express();

// // Autoriser CORS pour toutes les origines
// app.use(cors()); // CORS est maintenant activé pour toutes les origines

// const http = require("http");
// // const ConversationsSocket = require('./src/conversations/Conversation.socket');
// // const MessagesSocket =  require('./src/messages/messages.socket');
// // const MessagesController = require("./src/messages/Messages.controller");

// const server = http.createServer(app);
// const IO = require("socket.io")(server, {
//   cors: {
//     origin: "*", // Autoriser toutes les origines
//     methods: ["GET", "POST"], // Méthodes autorisées
//   }
// });

// IO.on("connection", (socket) => {
//   // ConversationsSocket(socket);
//   // console.log(`Utilisateur connecté : `);
//   // socket.emit("welcome", { message: "Welcome to my api" });
//   socket.on("user_connection", (user_id) => {
//     socket.join(user_id.toString());
//     console.log(`User registered: ${user_id}`);
//   });
//   // try {
//   //   // MessagesController();
//   // } catch (error) {
    
//   // }
//   console.log("new user connected");
// });

// app.use(express.json());
// app.use("/api", require("./index.route"));

// DBConnection.connection.sync().then(() => {
//   console.log("database connected");
// });

// server.listen(process.env.PORT || 5000, '0.0.0.0', () => {
//   console.log("server running on port 5000");
// });

// module.exports = IO;

// app.js
const express = require("express");
const DBConnection = require("./db.provider");
const cors = require("cors");
const http = require("http");
const socket = require("./socket"); // Importer le gestionnaire de socket

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const IO = socket.initializeSocket(server); // Initialiser Socket.IO

app.use("/api", require("./index.route"));

DBConnection.connection.sync({ alter: false, }).then(() => {
  console.log("Database connected");
});

server.listen(process.env.PORT || 5000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
// process.on('warning', (warning) => {
//   console.warn(warning.stack);
// });
// TRUNCATE `message_references`;
// TRUNCATE `message_mentions`;
// TRUNCATE `conversations`;
// TRUNCATE `messages`

// module.exports = IO;
