
const { messages } = require("../../db.provider");

let users = {}; 

const MessagesSocket = (io, socket) => {
  
  socket.on("user_initiatMessage", (data) => {
    users[data.user_id] = socket.id;
    console.log(`Utilisateur ${users} connecté avec Socket ID: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(users).find((key) => users[key] === socket.id);
    if (userId) {
      delete users[userId];
    }
  });

  socket.on("test_messages", (data) => {
    console.log(data);
    socket.emit("server_response", { message: "Your request was received" });
  });

  // 🔹 Envoi d'un message
  socket.on("sending_messages", async (data) => {
    if (!data.user_id && !data.enterprise_id) {
      socket.emit("message_creation_error", { data: "data user or enterprise is required" });
      return;
    }
    if (!data.receiverId) {
      socket.emit("message_creation_error", { data: "recipient is required" });
      return;
    }

    const MessagesData = {
      content: data.content,
      medias: data.medias,
      senderId: data.user_id,
      receiverId: data.receiverId,
      conversation_id: data.conversation_id,
      enterprise_id: data.enterprise_id
    };

    try {
      const result = await messages.create(MessagesData);

      socket.emit("message_sent", { data: result });

      const receiverSocket = users[data.receiverId];
      console.log("recever self  is"+users[data.receiverId]);
      if (receiverSocket) {
        io.to(receiverSocket).emit("new_message", { data: result });
      }
    } catch (error) {
      console.log(error.toString());
      socket.emit("message_creation_error", { data: error.toString() });
    }
  });
};

module.exports = MessagesSocket;
// const { messages } = require("../../db.provider");

// const MessagesSocket = (io) => {
//   io.on("test_messages", (data) => {
//     console.log(data);
//     io.emit("server_response", {
//       message: "Your request was received",
//     });
//   });

//   io.on("sending_messages", async (data) => {
//     if (!data.user_id && !data.enterprise_id ) {
//       io.emit("message_creation_error", { data: "data user or enterprise is required" });
//       return;
//     }
//     if (!data.receiverId) {
//       io.emit("message_creation_error", { data: "recipient is required" });
//       return;
//     }
//     const MessagesData = {
//       content: data.content,
//       medias: data.medias,
//       senderId: data.user_id,
//       receiverId: data.receiverId,
//       conversation_id:data.conversation_id
//       enterprise_id: data.enterprise_id
//     };
//     try {
//       const result = await messages.create(MessagesData);
//       io.emit("message_sent", { data: result });
//     } catch (error) {
//       console.log(error.toString());
//       io.emit("message_creation_error", { data: error.toString() });
//     }
//   });
// };

// module.exports = MessagesSocket;
