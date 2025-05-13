// const Users = require("../../db.provider").Users;
// const Messages = require("../../db.provider").messages;
// const Conversations = require("../../db.provider").Conversations;
// const messageReference = require("../../db.provider").messageReference;
// const messageMention = require("../../db.provider").messageMention;
// const Participer = require("../../db.provider").Participer;
// const UserControl = require('../users/user.controller');
// const getUserSocketId = require("../../socket").getUserSocketId;
// const getIo = require("../../socket").getIo;
// const messageMentionController = require('../messageMention/message.mention.controller');
// const messageReferenceController = require('../MessageReference/message.reference.controller');
// const { Op, json } = require("sequelize");
// const allconstant = require("../../src/constantes");
// const ConversationsController = require("../conversations/Conversation.controller").ConversationsController;

// const MessagesSocket = (socket) => {
//   socket.on("new_message", async (data) => {
//     if (!data.user_id && !data.enterprise_id) {
//       socket.emit("new_message", { message: "some data is required" });
//       return;
//     }

//     try {
//       let result = await MessageSendOne(data);
      
//       socket.emit("new_message", {
//         message: "success",
//         error: null,
//         data: result ?? null,
//       });
//     } catch (error) {
//       socket.emit("new_message", {
//         message: "Error occurred",
//         error: error.toString(),
//         data: null,
//       });
//     }
//   });

//   socket.on("create_media_message", async (data) => {
//     if (!data || !data.length) {
//       socket.emit("new_message", { message: "data is empty, ensure that data contains something" });
//       return;
//     }

//     try {
//       let messageResults = [];

//       for (let index = 0; index < data.length; index++) {
//         const element = data[index];
//         const existing = await ConversationsController.conversationExist(element);

//         if (existing.status === true) {
//           const newMessage = await MessageSendOnce(element, existing.data);

//           if (newMessage) {
//             messageResults.push(newMessage);
//           }
//         } else {
//           console.log("Conversation not found or failed to create.");
//         }
//       }

//       socket.emit("new_message", {
//         status: 200,
//         message: "Success",
//         error: null,
//         data: messageResults,
//       });
//     } catch (error) {
//       socket.emit("new_message", {
//         message: "error",
//         error: error.toString(),
//         data: null,
//       });
//     }
//   });

//   socket.on("new_message", async (data) => {
//     if (!data.conversation_id) {
//       socket.emit("new_message", { message: "no conversation found", error: "conversation_id is required" });
//       return;
//     }

//     let conditionMessage = {
//       [Op.and]: { conversation_id: data.conversation_id },
//       status: { [Op.ne]: 'deleted' },
//     };

//     try {
//       const messages = await Messages.findAll({
//         where: conditionMessage,
//         order: [['createdAt', 'ASC']],
//       });

//       let enrichedMessages = await Promise.all(
//         messages.map(async (message) => {
//           return await findByPkMesssagesIncludeMentionsAndRefs(message.id);
//         })
//       );

//       enrichedMessages = enrichedMessages.map((message) => {
//         message.medias = JSON.parse(message.medias);
//         return message;
//       });

//       socket.emit("new_message", {
//         message: "Success",
//         error: null,
//         data: enrichedMessages,
//       });
//     } catch (error) {
//       socket.emit("new_message", {
//         message: "Error occurred",
//         error: error.toString(),
//         data: [],
//       });
//     }
//   });

//   socket.on("update_message", async (data) => {
//     if (!data.id) {
//       socket.emit("message_update_error", { message: "Aucun ID spécifié", error: "id is required" });
//       return;
//     }

//     let condition = {
//       [Op.and]: { id: data.id },
//       status: { [Op.ne]: 'deleted' },
//     };

//     try {
//       data.read_at = new Date();
//       let result = await Messages.update(data, { where: condition });

//       if (result) {
//         let updatedMessage = await getSingleMessages(data.id);

//         if (updatedMessage) {
//           const receiverSocketId = getUserSocketId(updatedMessage.receiverId);
//           const senderSocketId = getUserSocketId(updatedMessage.senderId);

//           let enrichedMessage = await findByPkMesssagesIncludeMentionsAndRefs(updatedMessage.id);

//           if (receiverSocketId) {
//             getIo().to(receiverSocketId).emit("message_updated", { message: enrichedMessage });
//           }

//           if (senderSocketId) {
//             getIo().to(senderSocketId).emit("message_updated", { message: enrichedMessage });
//           }

//           socket.emit("message_updated", { message: "Success", error: null, data: enrichedMessage });
//         } else {
//           socket.emit("message_update_error", { message: "Error while getting updated message", error: null });
//         }
//       } else {
//         socket.emit("message_update_error", { message: "Error while updating message", error: null });
//       }
//     } catch (error) {
//       socket.emit("message_update_error", { message: "Error", error: error.toString(), data: null });
//     }
//   });
// };

// MessageSendOne =  async (element)=>{

//   let condition = {};
//   console.log("in");
//   if (element.conversation_id) {
//     condition = {
//       id: element.conversation_id
//     }
//   }else{
//     condition = {
//       [Op.or]: [
//         { first_user: element.user_id ,
//          second_user: element.receiverId },
        
//         { first_user: element.receiverId ,
//          second_user: element.user_id },
//       ]
//     };
    
//   }

//   let messageData = {};
//   let messagewhithNentionAndReferences;
//   // const   = await sequelize. ();
  
//   try { 
//     console.log("pass");
//    let conversationExist =  await Conversations.findOne({ where: condition,attributes: allconstant.convesationAttribut });

//     if (!conversationExist) 
//       {
//       console.log("this convesation is newer i.e it's not exist at last");
//       const conversationData = {
//         first_user: element.user_id,
//         second_user: element.receiverId,
//         enterprise_id: element.enterprise_id,
//         user_id: element.user_id,
//       };

//       let newConversation = await Conversations.create(conversationData,{
//         returning :  allconstant.convesationAttribut,  

//        });
     
//       if (newConversation) {
//         messageData = {
//           content: element.content,
//           medias: element.medias,
//           senderId: element.user_id,
//           receiverId: element.receiverId,
//           enterprise_id: element.enterprise_id,
//           conversation_id: newConversation.dataValues.id,
//           forwarded:element.forwarded,
//           members_read_it: JSON.stringify(element.members_read_it)

//         };
       
        
//          // Enregistrer le message
//          console.log("before ");
//          const newmessage =  await Messages.create(messageData,{
//            returning :  allconstant.messageattributes,  
//           } );
//           console.log("after ");
//         const receiverSocketId = getUserSocketId(element.receiverId);
//         const senderSocketId = getUserSocketId(element.user_id);
//        if(newmessage){
//         // let message_id =  newmessage.data.id;
//         if (element.mentions) {
//           await Promise.all(
//             element.mentions.map(async (mention) => {
//               try {
//                 let mentionsData = {
//                   message_id	: newmessage.id,
//                   mentioned_user_id : mention
//                 };
//                 return await messageMention.create(mentionsData,{ });
//               } catch (error) {
//                 console.error("Erreur lors de la création d'une mention :", error);
//               }
//             })
//           );
//           // for (let userId of mentions) {
//           // }
//         }
//         if (element.references) {
//           console.log("biginig  refeentement");
//           await messageReferenceController.createMany(element.references,newmessage.id);
//           console.log("befor  refeentement");
//         }
//          if (senderSocketId) {
//            try {
//              console.log("before emiting new conversation to sender",senderSocketId);
//              const socketConvesation =  getIo().to(senderSocketId).emit("new_conversation", {
//                conversation: await ConversationsControler.showOne(newConversation.dataValues.id,element.user_id)
//              });
//              console.log("after emiting new conversation to sender",socketConvesation);
//            } catch (error) {
//              console.log("error emiting new conversation to sender",error.toString());
//            }
//         }
//          if (receiverSocketId) {
//          try {
//            console.log("before emiting new conversation to receiver",receiverSocketId);
//            const socketConvesation =  getIo().to(receiverSocketId).emit("new_conversation", {
//                conversation:await ConversationsControler.showOne(newConversation.dataValues.id,element.receiverId)
//              });
//            console.log("after emiting new conversation to receiver",socketConvesation);
//          } catch (error) {
//            console.log("error emiting new conversation to receiver",error.toString());
//          }
         
//          }
//          JSON.parse(newmessage.medias);
//          messagewhithNentionAndReferences =  await findByPkMesssagesIncludeMentionsAndRefs(newmessage.id);
//          console.log("in building ", messagewhithNentionAndReferences);
//      JSON.parse(messagewhithNentionAndReferences.medias);}
//       } else {}
//     } 
//     else {
    
//       if (!element.conversation_id || element.conversation_id === '' ) {
//         console.log("conversation found ", conversationExist);
//         element.conversation_id = conversationExist.id;
//         //  res.status(200).send({ message: "error", error: "conversation identification failed", data: null });
//         //  return;
//       }

//       const getConversation = await Conversations.findByPk(parseInt(conversationExist.dataValues.id));

//       if (getConversation) {
//       console.log("this convesation is exist i.e it's  exist at past");

//         messageData = {
//           content: element.content,
//           medias: element.medias,
//           senderId: element.user_id,
//           receiverId: element.receiverId,
//           enterprise_id: element.enterprise_id,
//           conversation_id: conversationExist.id,
//           forwarded:element.forwarded,
//           members_read_it: JSON.stringify(element.members_read_it)

//         };
//         if( element.message_id ){
//           console.log("herer i respond to any message");
//           // console.log("before emiting",receiverSocketId);
//           const messageResponded = await Messages.findByPk( parseInt(element.message_id));
//           if (messageResponded) {
//              messageData.ResponseId = element.message_id;
//              const newmessage =  await Messages.create(messageData,{
//               returning :  allconstant.messageattributes, 
//             } );
//           if (newmessage) {
              
//             const message = await Messages.findByPk(newmessage.id, {
//               include: [
//                 {
//                   model: Messages,
//                   as: 'responseFrom', 
//                   include: [
//                     {
//                       model: Users,
//                       as: 'sender', 
//                       attributes: allconstant.Userattributes,
//                     }
//                   ]
//                 },
//                 {
//                   model: Users,
//                   as: 'receiver', 
//                   attributes : allconstant.Userattributes,
//                 },
//                 {
//                   model: Users,
//                   as: 'sender', 
//                   attributes : allconstant.Userattributes,
//                 },
//               ],
//               nest: true
//             });
//          JSON.parse(message.responseFrom.medias);
//            const receiverSocketId = getUserSocketId(element.receiverId);
//            const senderSocketId = getUserSocketId(element.user_id);
//            if (element.mentions) {
//             await Promise.all(
//               element.mentions.map(async (mention) => {
//                 try {
//                   let mentionsData = {
//                     message_id	: newmessage.id,
//                     mentioned_user_id : mention
//                   };
//                   return await messageMention.create(mentionsData);
//                 } catch (error) {
//                   console.error("Erreur lors de la création d'une mention :", error);
//                 }
//               })
//             );
//             // for (let userId of mentions) {
//             // }
//           }
//           if (element.references) {
//             console.log("biginig  refeentement");
//           await messageReferenceController.createMany(element.references,newmessage.id);
//           console.log("befor  refeentement");
//           };
//           messagewhithNentionAndReferences =  await findByPkMesssagesIncludeMentionsAndRefs(message.id);
//           JSON.parse(messagewhithNentionAndReferences.medias);
//           // if (receiverSocketId) {
            
//           //   try {
//           //     console.log("before emiting",receiverSocketId);
              
//           //   const socketMessage =  getIo().to(receiverSocketId).emit("new_message", {
//           //       message: messagewhithNentionAndReferences,
//           //     });
//           //     console.log("after emiting",socketMessage);
//           //   } catch (error) {
//           //     console.log("error emiting new message",error.toString());
//           //   }
//           // }

//           // if (senderSocketId) {
//           //   try {
//           //     console.log("before emiting",senderSocketId);
              
//           //   const socketMessage =  getIo().to(senderSocketId).emit("new_message", {
//           //       message: messagewhithNentionAndReferences,
//           //     });
//           //     console.log("after emiting",socketMessage);
//           //   } catch (error) {
//           //     console.log("error emiting new message",error.toString());
//           //   }
//           // }
//           if (conversationExist.type === "group") {
//             try {
//               const membres = await Participer.findAll({
//                 where: { id_conversation: conversationExist.id },
//                 include: [
//                   {
//                     model: Users,
//                     as: 'participants',
//                     attributes: ['id']
//                   }
//                 ]
//               });
//           console.log("les membres dans l message est ======>---------", membres);
//               for (const membre of membres) {
//                 const userId = membre.participants.id;
//                 if (userId !== element.user_id) {
//                   const socketId = getUserSocketId(userId);
//                   console.log("socket id group users",socketId);
//                   if (socketId) {
//                     getIo().to(socketId).emit("new_message", {
//                       message: messagewhithNentionAndReferences,
//                     });
//                   }
//                 }
//               }
//               const sendersocketId = getUserSocketId(element.user_id);
//               console.log("socket id group users sender",sendersocketId);

//                   if (sendersocketId) {
//                     getIo().to(sendersocketId).emit("new_message", {
//                       message: messagewhithNentionAndReferences,
//                     });
//                   }
//             } catch (error) {
//               console.error("Erreur lors de l'envoi des messages de groupe :", error.toString());
//             }
//           } 
//           else {
//             if (receiverSocketId) {
//               try {
//                 getIo().to(receiverSocketId).emit("new_message", {
//                   message: messagewhithNentionAndReferences,
//                 });
//               } catch (error) {
//                 console.error("Erreur socket receiver :", error.toString());
//               }
//             }
          
//             if (senderSocketId) {
//               try {
//                 getIo().to(senderSocketId).emit("new_message", {
//                   message: messagewhithNentionAndReferences,
//                 });
//               } catch (error) {
//                 console.error("Erreur socket sender :", error.toString());
//               }
//             }
//           }
          
//           }
//           else{
//             return 
//           }
//            }

//          }else{
//           try {
//                 const newmessage =  await Messages.create(messageData,{
//             returning :  allconstant.messageattributes, 
//           } );
//         if (newmessage) {
//           if (element.mentions) {
//             await Promise.all(
//               element.mentions.map(async (mention) => {
//                 try {
//                   let mentionsData = {
//                     message_id	: newmessage.id,
//                     mentioned_user_id : mention
//                   };
//                   return await messageMention.create(mentionsData,{ });
//                 } catch (error) {
//                   console.error("Erreur lors de la création d'une mention :", error);
//                 }
//               })
//             );
//             // for (let userId of mentions) {
//             // }
//           }
//           if (element.references) {
//             console.log("biginig  refeentement");
//             await messageReferenceController.createMany(element.references,newmessage.id);
//             console.log("befor  refeentement");
//           }
         
//          const receiverSocketId = getUserSocketId(element.receiverId);
//          const senderSocketId = getUserSocketId(element.user_id);
//          // console.log("before emiting",receiverSocketId);
            

//         //  res.status(200).send({ status: 200, message: "Success", error: null, data: newmessage });
//         // return;
//         // if (mentions || references)
//         //   {
//             messagewhithNentionAndReferences =  await findByPkMesssagesIncludeMentionsAndRefs(newmessage.id);
//       JSON.parse(messagewhithNentionAndReferences.medias);
            
//             // if (receiverSocketId) {
//             //   try {
//             //     console.log("before emiting",receiverSocketId);
                
//             //   const socketMessage =  getIo().to(receiverSocketId).emit("new_message", {
//             //       message: messagewhithNentionAndReferences,
//             //     });
//             //     console.log("after emiting",socketMessage);
//             //   } catch (error) {
//             //     console.log("error emiting new message",error.toString());
//             //   }
//             // }

//             // if (senderSocketId) {
//             //   try {
//             //     console.log("before emiting",senderSocketId);
                
//             //   const socketMessage =  getIo().to(senderSocketId).emit("new_message", {
//             //       message: messagewhithNentionAndReferences,
//             //     });
//             //     console.log("after emiting",socketMessage);
//             //   } catch (error) {
//             //     console.log("error emiting new message",error.toString());
//             //   }
//             // }
            
//             if (conversationExist.type === "group") {
//               try {
//                 const membres = await Participer.findAll({
//                   where: { id_conversation: conversationExist.id },
//                   include: [
//                     {
//                       model: Users,
//                       as: 'participants',
//                       attributes: ['id']
//                     }
//                   ]
//                 });
            
//                 for (const membre of membres) {
//                   console.log("users groupe", membre.participants.id );
//                   const userId = membre.participants.id;
//                   if (userId !== element.user_id) {
//                     const socketId = getUserSocketId(membre.participants.id);
//                     if (socketId) {
//                       getIo().to(socketId).emit("new_message", {
//                         message: messagewhithNentionAndReferences,
//                       });
//                     }
//                   }
//                 }
//                 const sendersocketId = getUserSocketId(element.user_id);
//                     if (sendersocketId) {
//                       getIo().to(sendersocketId).emit("new_message", {
//                         message: messagewhithNentionAndReferences,
//                       });
//                     }
//               } catch (error) {
//                 console.error("Erreur lors de l'envoi des messages de groupe :", error.toString());
//               }
//             } 
//             else {
//               if (receiverSocketId) {
//                 try {
//                   getIo().to(receiverSocketId).emit("new_message", {
//                     message: messagewhithNentionAndReferences,
//                   });
//                 } catch (error) {
//                   console.error("Erreur socket receiver :", error.toString());
//                 }
//               }
            
//               if (senderSocketId) {
//                 try {
//                   getIo().to(senderSocketId).emit("new_message", {
//                     message: messagewhithNentionAndReferences,
//                   });
//                 } catch (error) {
//                   console.error("Erreur socket sender :", error.toString());
//                 }
//               }
//             }
//         }
//         else{
//           return;
//         }
//           } catch (error) {
//             console.error("Erreur lors de la création du message :", error);
//             return error;
//           }
      
//       }

//       } else {
//         //  res.status(200).send({ message: "error", error: "error while getting conversation", data: null });
//     return;
//       }
//     }
//   } catch (error) {
//     return error;
//   }
// };
//  findByPkMesssagesIncludeMentionsAndRefs = async (id)=>{

//   try {
//     const message = await Messages.findByPk(id, {
//       include : [
//         {
//           model : messageMention,
//           as: 'mentions', // L'alias défini dans belongsTo
//           include: [
//             {
//               model: Users,
//               as: 'username', // correspond à messageMention.belongsTo(Users, { as: 'mentionedUser', ... })
//               attributes: ['user_name'] // optionnel : pour cacher les infos sensibles
//             }
//           ]

//         },
//         {
//           model : messageReference,
//           as: 'references', // L'alias défini dans belongsTo

//         },
//         {
//           model: Messages,
//           as: 'responseFrom', 
//           include:[
//             {
//               model: Users,
//               as: 'sender', 
//               attributes : allconstant.Userattributes,
//             },
//           ]
//         },
//         {
//           model: Users,
//           as: 'receiver', 
//           attributes : allconstant.Userattributes,
//         },
//         {
//           model: Users,
//           as: 'sender', 
//           attributes : allconstant.Userattributes,
//         },
//       ]
//     });
// // const mentionUseName  = await Promise.all(
// //   message.mentions.map(async (mention)=>{
// //     const userData  = await UserControl.show(mention.mentioned_user_id);
// //     mention.usename.toString() = userData.user_name;
// //     return mention;
// //   }
// //   )
// // );

// // console.log("mentions  whith username =",mentionUseName);
//   // message.mentions = mentionUseName;
//     // const user =  UserControl.show(message.)
//     // let messageReferenceData = await  messageReferenceController.showByMessageId(message.dataValues.id);
//     // let messageMentionData = await  messageMentionController.showByMessageId(message.dataValues.id);
//     // console.log("message mentions effeences", messageReferenceData);
//     return message;
//     // {
//     //   message,
//     //   references: await messageReference.findAll({
//     //     where:{
//     //         message_id : message.dataValues.id
//     //     },
//     //     // attribute: allconstant.mentionsattribute,
//     //     logging: console.log, 
//     // }),
//     //   mentions: await messageMention.findAll({
//     //     where:{
//     //         message_id : message.dataValues.id
//     //     },
//     //     // attribute: allconstant.mentionsattribute,
//     //     logging: console.log, 
//     // }),
//     // };
    
//   } catch (error) {
//     return error;
//   }

//  };
// createMesage = async (messageData)=>{
//   try {
//     let newmessage =  await Messages.create(messageData,{
//       returning :  allconstant.messageattributes
//     } );
//     return {data: newmessage, error: null, message: 'success'}
//   } catch (error) {
    
//     return {data: null, error: error.toString() , message:null };
//   }
// };
// getSingleMessages = async (id) => {
//   let condition = {
//     [Op.and]:
//       {id: id },
//       status: { [Op.ne]: 'deleted' }
//   };
//   if (!id) {
//     // res
//     //   .status(400)
//     //   .send({ message: "Error", error: "No data found", data: {} });
//     return;
//   }
//   try {
//     const data = await Messages.findByPk(
//       parseInt(id),{
//         attributes : allconstant.messageattributes
//       } );
//       let  dataParsed = JSON.parse(data.medias); 
//         data.medias = dataParsed;
         
//     // res.status(200).send({ message: "Success", error: null, data: data });
//     return data;
//   } catch (error) {
//     // res
//     //   .status(400)
//     //   .send({ message: "Error occured", error: error.toString(), data: [] });
//     return null;
//   }
// };

// module.exports = MessagesSocket;