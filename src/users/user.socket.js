const { user } = require("../../db.provider");

const UserSocket = (io) => {
  io.on("test_user", (data) => {
    console.log(data);
    io.emit("server_response", {
      message: "Your request was received",
    });
  });

  io.on("create_user", async (data) => {
    // console.log(data);
    if (!data.fullname) {
      io.emit("user_creation_error", { data: "Fullname is required" });
      return;
    }
    const UserData = {
      fullname: data.fullname,
      username: data.username,
      password: data.password,
    };
    try {
      const result = await user.create(UserData);
      io.broadcast.emit("user_created", { data: result });
      //   res.status(200).send({ message: "Success", error: null, data: result });
    } catch (error) {
      console.log(error.toString());
      io.emit("user_creation_error", { data: error });
      //   res.status(500).send({
      //     message: "Error occured",
      //     error: error.toString(),
      //     data: null,
      //   });
    }
  });
};

module.exports = UserSocket;
