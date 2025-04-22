
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
// TRUNCATE `participer`

// module.exports = IO;
