// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");
// const Token = require("./db.provider").Token ;
// // const ConversationsSocket = require("./src/conversations/Conversation.socket");

// let io;

// const users = {}; // user_id => socket.id

// const initializeSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST","PUT"]
//     }
//   });

//  const connectedUsers = {};
// io.use(async (socket, next) => {
//   try {
//     let k = Object.assign(socket.handshake.headers.authorization);
//     console.log("soket infos ===========>",  k);
//     const authHeader = socket.handshake.headers.authorization;
//     if (!authHeader || !authHeader?.startsWith("Bearer ")) {
//       console.log("Missing or incorrectly formatted token");
//       socket.emit("token_error",{message: "Error", error:"Missing or incorrectly formatted token", data:[]});
//       return next(new Error("Missing or incorrectly formatted token"));
//     }

//     const token = authHeader.split(" ")[1];
//     const tokenEntry = await Token.findOne({ where: { token } });
//     if (!tokenEntry) {
//       socket.emit("token_error",{message: "Error", error:"Invalid or expired token", data:[]});
      
//       console.log("Invalid or expired token");

//       return next(new Error("Invalid or expired token"));
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     socket.user = {
//       id: decoded.id,
//       role: decoded.role, // Ex: 'admin', 'user'
//     };

//     // MAJ du token
//     await tokenEntry.update({ last_used_at: new Date() });

//     next();
//   } catch (err) {
//     console.log("Token verification failed : " + err.message);
//     socket.emit("token_error",{message: "Error", error:"Token verification failed :"+err.message, data:[]});
//     return next(new Error("Token verification failed : " + err.message));
//   }
// });

//   io.on("connection", (socket) => {
//     // console.log(` Utilisateur ${user_id} rejoint avec socket ${socket.id}`);
//     console.log(`✅ Nouveau user connecté : ${socket.id}`);
//     socket.emit("connection", { message: "Welcome to my API" });
//     const { id, role } = socket.user;
//   // connectedUsers[id] = { socketId: socket.id, role };
  
//   // console.log(`✅ Utilisateur connecté : ${id} (${role})`);
//   // socket.emit("users:list", Object.keys(connectedUsers)); // Broadcast des utilisateurs connectés
  
//   // Exemple de permission
//   // socket.on("admin:task", (data) => {
//   //   if (socket.user.role !== "admin") {
//   //     return socket.emit("error", { message: "Permission refusée" });
//   //   }
//   //   // Logique admin
//   //   console.log("Action admin exécutée");
//   // });
  
//     // socket.reconnectAttempts = 0;
//     // ConversationsSocket(socket);
//     // socket.on("reconnect", () => {
//     //   socket.reconnectAttempts += 1;
  
//     //   // socket.emit("reconnect", {
//     //   //   message: "❌ Utilisateur reconnecté",
//     //   //   attempts: socket.reconnectAttempts
//     //   // });
  
//     //   console.log(`🔁 Socket ${socket.id} reconnecté - Tentatives : ${socket.reconnectAttempts}`);
//     // });
//     // socket.on("disconnect", (reason) => {
//     //   console.log(`❌ Socket ${socket.id} déconnecté (${reason})`);
//     //   socket.emit("users:list", Object.keys(connectedUsers));
//     //   const disconnectedUserId = Object.keys(users).find((id) => users[id] === socket.id);
//     //   if (disconnectedUserId) {
//     //     delete users[disconnectedUserId];
//     //     console.log(`❌ Utilisateur ${disconnectedUserId} déconnecté et retiré`);
//     //   }
//     //   socket.emit("user_disconnected", { message: `❌ Utilisateur ${socket.id} déconnecté` });
//     // });
//     socket.on("joinRoom", (user_id) => {
//       users[user_id] = socket.id;
//       console.log("Tous les sockets enregistrés :", users);
//     });

//     // socket.on("disconnect", () => {
//     //   const disconnectedUserId = Object.keys(users).find((id) => users[id] === socket.id);
//     //   if (disconnectedUserId) {
//     //     delete users[disconnectedUserId];
//     //     console.log(`❌ Utilisateur ${disconnectedUserId} déconnecté et retiré`);
//     //   }
//     // });
//   });

//   return io;
// };

// const  getUserSocketId  =async (userId)=> users[userId];


// const getIo = () => {
//   if (!io) throw new Error("Socket.io n'a pas été initialisé !");
//   return io;
// };

// module.exports = { initializeSocket, getIo, getUserSocketId };

const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");

let io;
const users = {}; // Stocke user_id → socket.id

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // À sécuriser en production
            methods: ["GET", "POST"]
        }
    });

    // io.use((socket, next) => {
    //     try {
            
    //         const token = socket.handshake.headers.authorization;
    //     console.log("mon sockt ======", socket);
    //         if (!token) {
    //             next(new Error("Token manquant"));

    //           return 
    //         }
        
    //         jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //           if (err) return next(new Error("Token invalide "+ err.toString()));
    //           socket.user = user;
    //           next();
    //         });
    //     } catch (error) {
    //         return next(new Error(error.toString()));
    //     }
    //   });
    io.on("connection", (socket) => {
        socket.on("joinRoom", (user_id) => {
            // if (user_id in users ) {
                
            //     console.log(`✅ Utilisateur ${user_id } deja rejoint avec socket ${socket.id}`);
            // }else{

                users[user_id] = socket.id;
                console.log(`✅ Utilisateur ${user_id } rejoint avec socket lq nouvelle session ${socket.id}`);
            // }
            // users.forEach((u)=>{

                console.log(`✅ Utilisateur`,users);
            // });
        });
        
        
        // Gérer la déconnexion
        socket.on("disconnect", () => {
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io n'a pas été initialisé !");
    }
    return io;
};

// Permet d'obtenir le socket.id d'un utilisateur donné
const getUserSocketId = (userId) => users[userId];

module.exports = { initializeSocket, getIo, getUserSocketId };
