const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Token = require("./db.provider").Token ;
let io;

const users = {}; // user_id => socket.id

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new Error("Token manquant ou mal formaté"));
      }

      const token = authHeader.split(" ")[1];
      const tokenEntry = await Token.findOne({ where: { token } });
      if (!tokenEntry) {
        return next(new Error("Token invalide ou expiré"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // On attache l'utilisateur au socket

      await tokenEntry.update({ last_used_at: new Date() });

      next();
    } catch (error) {
      return next(new Error("Échec de la vérification du token : " + error.message));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (user_id) => {
      users[user_id] = socket.id;
      console.log(` Utilisateur ${user_id} rejoint avec socket ${socket.id}`);
      console.log("Tous les sockets enregistrés :", users);
    });

    socket.on("disconnect", () => {
      const disconnectedUserId = Object.keys(users).find((id) => users[id] === socket.id);
      if (disconnectedUserId) {
        delete users[disconnectedUserId];
        console.log(`❌ Utilisateur ${disconnectedUserId} déconnecté et retiré`);
      }
    });
  });

  return io;
};

const getUserSocketId = (userId) => users[userId];

const getIo = () => {
  if (!io) throw new Error("Socket.io n'a pas été initialisé !");
  return io;
};

module.exports = { initializeSocket, getIo, getUserSocketId };

// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");

// let io;
// const users = {}; // Stocke user_id → socket.id

// const initializeSocket = (server) => {
//     io = new Server(server, {
//         cors: {
//             origin: "*", // À sécuriser en production
//             methods: ["GET", "POST"]
//         }
//     });

//     io.use((socket, next) => {
//         try {
            
//             const token = socket.handshake.headers.authorization;
//         console.log("mon sockt ======", socket);
//             if (!token) {
//                 next(new Error("Token manquant"));

//               return 
//             }
        
//             jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//               if (err) return next(new Error("Token invalide "+ err.toString()));
//               socket.user = user;
//               next();
//             });
//         } catch (error) {
//             return next(new Error(error.toString()));
//         }
//       });
//     io.on("connection", (socket) => {
//         socket.on("joinRoom", (user_id) => {
//             // if (user_id in users ) {
                
//             //     console.log(`✅ Utilisateur ${user_id } deja rejoint avec socket ${socket.id}`);
//             // }else{

//                 users[user_id] = socket.id;
//                 console.log(`✅ Utilisateur ${user_id } rejoint avec socket lq nouvelle session ${socket.id}`);
//             // }
//             // users.forEach((u)=>{

//                 console.log(`✅ Utilisateur`,users);
//             // });
//         });
        
        
//         // Gérer la déconnexion
//         socket.on("disconnect", () => {
//         });
//     });

//     return io;
// };

// const getIo = () => {
//     if (!io) {
//         throw new Error("Socket.io n'a pas été initialisé !");
//     }
//     return io;
// };

// // Permet d'obtenir le socket.id d'un utilisateur donné
// const getUserSocketId = (userId) => users[userId];

// module.exports = { initializeSocket, getIo, getUserSocketId };
