const SocketHelper = {};

SocketHelper.clientCreation = (io) => {
  io.broadcast.emit("clientCreation", { message: "New client was created" });
};

SocketHelper.userCreation = (io) => {
  io.broadcast.emit("userCreation", { message: "New user was created" });
};

/*
    .emit
        require an event name
        require data that will be sent

    .on
        require an event name on which it will listen
        create custom event in the server
        receive data sent on the event into a function callback
    
    .broadcast.emit
        sent an event to all connected user
        require data that will be sent

    .predefined client events
            //those events will be used with .on function
        connect
        connect_error
        reconnect
        reconnect_error
        reconnecting

    .predefined server event
        connection : this event handle all user connected to the websocket server

  */

module.exports = SocketHelper;
