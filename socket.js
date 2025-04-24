const { json } = require("sequelize");
const { Server } = require("socket.io");

let io;
const users = {}; // Stocke user_id → socket.id

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // À sécuriser en production
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("🔗 Un utilisateur connecté:", socket.id);

        // Associer un socket à un user_id
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
            // for (let [userId, socketId] of users.entries()) {
            //     if (socketId === socket.id) {
            //         users.delete(userId);
            //         console.log(`❌ Utilisateur ${userId} déconnecté`);
            //         break;
            //     }
            // }
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
