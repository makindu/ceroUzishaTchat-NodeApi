const  Conversations  = require("../../db.provider").Conversations;

const ConversationsSocket = (io) => {
  io.on("test_Conversations", (data) => {
    console.log(data);
    io.emit("server_response", {
      message: "Your request was received",
    });
  });

  // io.on("creating_Conversations", async (data) => {
  //   if (!data.user_id && !data.enterprise_id ) {
  //     io.emit("message_creation_error", { data: "data user or enterprise is required" });
  //     return;
  //   }
  //   const ConversationsData = {
  //     content: data.content,
  //     medias: data.medias,
  //     senderId: data.senderId,
  //     receiverId: data.receiverId,
  //   };
  //   try {
  //     const result = await Conversations.create(ConversationsData);
  //     io.broadcast.emit("message_sent", { data: result });
  //   } catch (error) {
  //     console.log(error.toString());
  //     io.emit("message_error_sending", { data: error });
  //   }
  // });
};

module.exports = ConversationsSocket;
