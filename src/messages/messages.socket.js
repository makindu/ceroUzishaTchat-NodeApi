const { messages } = require("../../db.provider");

const MessagesSocket = (io) => {
  io.on("test_messages", (data) => {
    console.log(data);
    io.emit("server_response", {
      message: "Your request was received",
    });
  });

  io.on("sending_messages", async (data) => {
    if (!data.user_id && !data.enterprise_id ) {
      io.emit("message_creation_error", { data: "data user or enterprise is required" });
      return;
    }
    const MessagesData = {
      content: data.content,
      medias: data.medias,
      senderId: data.senderId,
      receiverId: data.receiverId,
    };
    try {
      const result = await messages.create(MessagesData);
      io.broadcast.emit("message_sent", { data: result });
    } catch (error) {
      console.log(error.toString());
      io.emit("message_error_sending", { data: error });
    }
  });
};

module.exports = MessagesSocket;
