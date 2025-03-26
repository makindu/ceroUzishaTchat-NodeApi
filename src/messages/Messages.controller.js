const  Messages  = require("../../db.provider").messages;
const Conversations =  require('../../db.provider').Conversations;
const ConversationsControler =  require('../conversations/Conversation.controller');
const UserControl = require('../users/user.controller');
const getUserSocketId =  require("../../socket").getUserSocketId;
const getIo =  require("../../socket").getIo;
const { Op, where, json, DATE } = require("sequelize");

const MessagesController = {};

MessagesController.create = async (req, res) => {
 
 if (!req.body.user_id && !req.body.enterprise_id) {
   res.status(400).send("some data is required");
   return;
 }
 if (!req.body.receiverId) {
   res.status(400).send("receiver data is required");
     return;
   }

   const condition = {
     [Op.or]: [
       { first_user: req.body.user_id ,
        second_user: req.body.receiverId },
       
       { first_user: req.body.receiverId ,
        second_user: req.body.user_id },
     ]
   };

   let conversationExist = {};
   let messageData = {};

   try {
     conversationExist = await Conversations.findOne({ where: condition });

     if (!conversationExist) {
       console.log("this convesation is newer i.e it's not exist at last");
       const conversationData = {
         first_user: req.body.user_id,
         second_user: req.body.receiverId,
         enterprise_id: req.body.enterprise_id
       };

       let newConversation = await Conversations.create(conversationData);
      
       if (newConversation) {
         messageData = {
           content: req.body.content,
           medias: req.body.medias,
           senderId: req.body.user_id,
           receiverId: req.body.receiverId,
           enterprise_id: req.body.enterprise_id,
           conversation_id: newConversation.dataValues.id
         };
        
          // Enregistrer le message
         const newmessage =  await Messages.create(messageData);
         const receiverSocketId = getUserSocketId(req.body.receiverId);
         const senderSocketId = getUserSocketId(req.body.user_id);
         // console.log("before emiting",receiverSocketId);
         if (senderSocketId) {
            try {
              console.log("before emiting new conversation to sender",senderSocketId);
              const socketConvesation =  getIo().to(senderSocketId).emit("new_conversation", {
                conversation:await ConversationsControler.showOne(newConversation.dataValues.id,req.body.user_id)
              });
              console.log("after emiting new conversation to sender",socketConvesation);
            } catch (error) {
              console.log("error emiting new conversation to sender",error.toString());
            }
         }
          if (receiverSocketId) {
          try {
            console.log("before emiting new conversation to receiver",receiverSocketId);
            const socketConvesation =  getIo().to(receiverSocketId).emit("new_conversation", {
                conversation:await ConversationsControler.showOne(newConversation.dataValues.id,req.body.receiverId)
              });
            console.log("after emiting new conversation to receiver",socketConvesation);
          } catch (error) {
            console.log("error emiting new conversation to receiver",error.toString());
          }
          
          }
         
         return res.status(200).send({ message: "Success", error: null, data: newmessage });

       } else {
         return res.status(200).send({ message: "error occurred", error: "error while creating conversation", data: null });
       }
     } else {
     
       if (!req.body.conversation_id || req.body.conversation_id === '' ) {
          req.body.conversation_id = conversationExist[0].id;
          res.status(200).send({ message: "error", error: "conversation identification failed", data: null });
          return;
       }

       const getConversation = await Conversations.findByPk(parseInt(conversationExist.dataValues.id));

       if (getConversation) {
       console.log("this convesation is exist i.e it's  exist at past");

         messageData = {
           content: req.body.content,
           medias: req.body.medias,
           senderId: req.body.user_id,
           receiverId: req.body.receiverId,
           enterprise_id: req.body.enterprise_id,
           conversation_id: getConversation.id
         };
         const newmessage = await Messages.create(messageData);
         if (newmessage) {
          const receiverSocketId = getUserSocketId(req.body.receiverId);
          const senderSocketId = getUserSocketId(req.body.user_id);
          // console.log("before emiting",receiverSocketId);
              if (receiverSocketId) {
                try {
                  console.log("before emiting",receiverSocketId);
                  
                const socketMessage =  getIo().to(receiverSocketId).emit("new_message", {
                    message: newmessage,
                  });
                  console.log("after emiting",socketMessage);
                } catch (error) {
                  console.log("error emiting new message",error.toString());
                }
              }

              if (senderSocketId) {
                try {
                  console.log("before emiting",senderSocketId);
                  
                const socketMessage =  getIo().to(senderSocketId).emit("new_message", {
                    message: newmessage,
                  });
                  console.log("after emiting",socketMessage);
                } catch (error) {
                  console.log("error emiting new message",error.toString());
                }
              }

           res.status(200).send({ status: 200, message: "Success", error: null, data: newmessage });
           return;
         }
         else{
           res.status(500).send({ status: 500, message: "error", error: 'message non envoyer ', data: null });

           return 
         }

       } else {
         return res.status(500).send({ message: "error", error: "error while getting conversation", data: null });
       }
     }

   } catch (error) {
     res.status(500).send({
       message: "Error occurred",
       error: error.toString(),
       data: null,
     });
   }
 };
MessagesController.createMedia = async (req, res) => {
 if (!req.body.data) {
   res.status(400).send("data is empty ensure that data contain anything");
   return;
  
 }else{
  // let messageData = [];
  try {
    // Utiliser map pour créer un tableau de promesses
    const messagePromises = req.body.data.map(async (element) => {
      return await multipleMediaBuilt(element);
    });

    // Attendre la résolution de toutes les promesses
    const messageData = await Promise.all(messagePromises);

    res.status(200).send({
      status: 200,
      message: "Success",
      error: null,
      data: messageData.filter((msg) => msg != null), // Éliminer les messages null
    });
  } catch (error) {
    res.status(500).send({
      message: "error",
      error: error.toString(),
      data: null,
    });
  }
 
 }

 };
   multipleMediaBuilt =  async (element)=>{

    const condition = {
      [Op.or]: [
        { first_user: element.user_id ,
         second_user: element.receiverId },
        
        { first_user: element.receiverId ,
         second_user: element.user_id },
      ]
    };
 
    let conversationExist = {};
    let messageData = {};
 
    try {
      conversationExist = await Conversations.findOne({ where: condition });
 
      if (!conversationExist) {
        console.log("this convesation is newer i.e it's not exist at last");
        const conversationData = {
          first_user: element.user_id,
          second_user: element.receiverId,
          enterprise_id: element.enterprise_id
        };
 
        let newConversation = await Conversations.create(conversationData);
       
        if (newConversation) {
          messageData = {
            content: element.content,
            medias: element.medias,
            senderId: element.user_id,
            receiverId: element.receiverId,
            enterprise_id: element.enterprise_id,
            conversation_id: newConversation.dataValues.id
          };
         
          
           // Enregistrer le message
          const newmessage =  await Messages.create(messageData);
          const receiverSocketId = getUserSocketId(element.receiverId);
          const senderSocketId = getUserSocketId(element.user_id);
          // console.log("before emiting",receiverSocketId);
          if (senderSocketId) {
             try {
               console.log("before emiting new conversation to sender",senderSocketId);
               const socketConvesation =  getIo().to(senderSocketId).emit("new_conversation", {
                 conversation:await ConversationsControler.showOne(newConversation.dataValues.id,element.user_id)
               });
               console.log("after emiting new conversation to sender",socketConvesation);
             } catch (error) {
               console.log("error emiting new conversation to sender",error.toString());
             }
          }
           if (receiverSocketId) {
           try {
             console.log("before emiting new conversation to receiver",receiverSocketId);
             const socketConvesation =  getIo().to(receiverSocketId).emit("new_conversation", {
                 conversation:await ConversationsControler.showOne(newConversation.dataValues.id,element.receiverId)
               });
             console.log("after emiting new conversation to receiver",socketConvesation);
           } catch (error) {
             console.log("error emiting new conversation to receiver",error.toString());
           }
           
           }
           JSON.stringify(newmessage.medias);
          return  newmessage ;
          // return res.status(200).send({ message: "Success", error: null, data: newmessage });
 
        } else {

          return;
          // return res.status(200).send({ message: "error occurred", error: "error while creating conversation", data: null });
        }
      } else {
      
        if (!element.conversation_id || element.conversation_id === '' ) {
          element.conversation_id = conversationExist[0].id;
          //  res.status(200).send({ message: "error", error: "conversation identification failed", data: null });
           return;
        }
 
        const getConversation = await Conversations.findByPk(parseInt(conversationExist.dataValues.id));
 
        if (getConversation) {
        console.log("this convesation is exist i.e it's  exist at past");
 
          messageData = {
            content: element.content,
            medias: element.medias,
            senderId: element.user_id,
            receiverId: element.receiverId,
            enterprise_id: element.enterprise_id,
            conversation_id: getConversation.id
          };
          const newmessage = await Messages.create(messageData);
          if (newmessage) {
           const receiverSocketId = getUserSocketId(element.receiverId);
           const senderSocketId = getUserSocketId(element.user_id);
           // console.log("before emiting",receiverSocketId);
               if (receiverSocketId) {
                 try {
                   console.log("before emiting",receiverSocketId);
                   
                 const socketMessage =  getIo().to(receiverSocketId).emit("new_message", {
                     message: newmessage,
                   });
                   console.log("after emiting",socketMessage);
                 } catch (error) {
                   console.log("error emiting new message",error.toString());
                 }
               }
 
               if (senderSocketId) {
                 try {
                   console.log("before emiting",senderSocketId);
                   
                 const socketMessage =  getIo().to(senderSocketId).emit("new_message", {
                     message: newmessage,
                   });
                   console.log("after emiting",socketMessage);
                 } catch (error) {
                   console.log("error emiting new message",error.toString());
                 }
               }
               console.log("in building ", newmessage);
           JSON.stringify(newmessage.medias);

               return newmessage;
            // res.status(200).send({ status: 200, message: "Success", error: null, data: newmessage });
            // return;
          }
          else{
            return;
            // res.status(500).send({ status: 500, message: "error", error: 'message non envoyer ', data: null });
 
            return 
          }
 
        } else {
      return;
          // return res.status(200).send({ message: "error", error: "error while getting conversation", data: null });
        }
      }
 
    } catch (error) {
      return error;
      // res.status(500).send({
      //   message: "Error occurred",
      //   error: error.toString(),
      //   data: null,
      // });
    }
 }

MessagesController.getData = async (req, res) => {
  console.log("getting all data")
  let conditionMessage = {
      [Op.and]:
        {conversation_id: req.body.conversation_id },
        status: { [Op.ne]: 'deleted' }
    };
  if (req.params.value) {
    condition = {
      [Op.or]: { id: req.params.value, senderId: req.params.value , receiverId : req.params.value },
    };
  }
  try {
    const data = await Messages.findAll({
      where : conditionMessage
    });
    res.status(200).send({ message: "Success", error: null, data: data });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error occured", error: error.toString(), data: [] });
  }
};
MessagesController.getMessagesByConversation = async (req, res) => {
  console.log("getting all data"+req.body.conversation_id)
  let conditionMessage = {
    [Op.and]:
      {conversation_id: req.body.conversation_id },
      status: { [Op.ne]: 'deleted' }
  };
  if (!req.body.conversation_id) {
    res.status(500).send({ status: 500, message: "errror", error: "no conversation found", data: null });
    
  }
  // if (!req.body.receiverId) {
  //   res.status(200).send({ status: 500, message: "errror", error: "no receiver found", data: null });
    
  // }
  // if (req.body.conversation_id) {
  //   condition = {
  //     [Op.contains]: { conversation_id: req.body.conversation_id, },
  //     status: { [Op.ne]: 'deleted' }

  //   };
  // }
  try {
    const data = await Messages.findAll({
      where: conditionMessage,
      groupBy: [['createdAt', 'DESC']],
      
    });
    res.status(200).send({ message: "Success", error: null, data: data });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error occured", error: error.toString(), data: [] });
  }
};

MessagesController.groupMessagesByReceivernConversation = async (req, res) => {
  console.log("here in conversation" );
  let condition = {};
  
  if (req.body.senderId) {
    condition = {
      [Op.or]: 
        {
          senderId: req.body.senderId,
          receiverId: req.body.senderId
        },
      status: { [Op.ne]: 'deleted' }

      
    };
  }

  if ( !req.body.senderId) {
    res
      .status(400)
      .send({ message: "Error", error: "No data found", data: {} });
    return;
  }

  try {
    const messages = await Messages.findAll({
      where: condition,
      order: [['createdAt', 'ASC']],
    });
    let ownerUser  = {};
    let receiverUser = {};
 
    const groupedMessages = messages.reduce(   (acc, message) => {
      const key = `${message.senderId}->${message.receiverId}`;
    // const receiverUser = await Users.findByPk( parseInt(req.body.receiverId) ); 
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(message);
      return acc;
    }, {});

  const conversations = await Promise.all( Object.keys(groupedMessages).map( async (key )=>{
    const messages = groupedMessages[key];
    const ids =  key.split('->');
    console.log( "idis"+ ids[0]);
    ownerUser = await UserControl.show(ids[0] );
    receiverUser = await UserControl.show(ids[1]);
    console.log( "idis"+ ownerUser);
    return {
      messages :messages.map((message)=> ({

      }) ) ,
      owner : ownerUser,
    }
  }) )


    res.status(200).send({ message: "Success", error: null, data: conversations });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error occurred !", error: error.toString(), data: null });
  }
};
getSingleMessages = async (id) => {
  let condition = {
    [Op.and]:
      {id: id },
      status: { [Op.ne]: 'deleted' }
  };
  if (!id) {
    // res
    //   .status(400)
    //   .send({ message: "Error", error: "No data found", data: {} });
    return;
  }
  try {
    const data = await Messages.findByPk(
      parseInt(id));
      let  dataParsed = JSON.parse(data.medias); 
        data.medias = dataParsed;
         
    // res.status(200).send({ message: "Success", error: null, data: data });
    return data;
  } catch (error) {
    // res
    //   .status(400)
    //   .send({ message: "Error occured", error: error.toString(), data: [] });
    return null;
  }
};
MessagesController.findByPk = async (req, res) => {
  let condition = {
    [Op.and]:
      {conversation_id: req.body.conversation_id },
      status: { [Op.ne]: 'deleted' }
  };
  if (!req.params.id) {
    res
      .status(400)
      .send({ message: "Error", error: "No data found", data: {} });
    return;
  }
  try {
    const data = await Messages.findByPk(
      parseInt(req.params.id));
    res.status(200).send({ message: "Success", error: null, data: data });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error occured", error: error.toString(), data: [] });
  }
};
MessagesController.updateMessages = async (req, res) => {
  let condition = {
    [Op.and]:
      {id: req.params.id},
      status: { [Op.ne]: 'deleted' }
  };
  if (!req.params.id) {
    res
      .status(400)
      .send({ message: "Error", error: "Aucun ID specifie", data: null });
    return;
  }

  try {
    console.log("before updating message");
    req.body.read_at = Date();
    let result = await Messages.update(req.body, { where: condition });
    if(result ){
      let data = await getSingleMessages(req.params.id);
      console.warn("after updating message ", result );
      if (data) {
        const receiverSocketId = getUserSocketId(data.dataValues.receiverId);
        const senderSocketId = getUserSocketId(data.dataValues.senderId);
        console.warn("socket recerverusers ", receiverSocketId );
        console.warn("socket senderusers ", senderSocketId );
        if (receiverSocketId) {
          getIo().to(receiverSocketId).emit("renew_message", {
            message: data,
          });
        }
        if (senderSocketId) {
          getIo().to(senderSocketId).emit("renew_message", {
            message: data,
          });
          
        }
        res.status(200).send({ message: "Success", error: null, data: data });
      }
      else{
        res
        .status(500)
        .send({ message: "Error", error: "error while geting updated message ", data: null });
      }
    }
    else{
      res
        .status(500)
        .send({ message: "Error", error: "error while  updating message ", data: null });
     
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error", error: error.toString(), data: null });
  }
};

module.exports = MessagesController;
