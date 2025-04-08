const  Users = require("../../db.provider").Users;
const Messages = require("../../db.provider").messages;
const Conversations= require("../../db.provider").Conversations;
const messageReference = require("../../db.provider").messageReference;
const messageMention  = require("../../db.provider").messageMention;
const ConversationsControler =  require('../conversations/Conversation.controller');
const UserControl = require('../users/user.controller');
const getUserSocketId =  require("../../socket").getUserSocketId;
const getIo =  require("../../socket").getIo;
const messageMentionController = require('../messageMention/message.mention.controller');
const messageReferenceController =  require('../MessageReference/message.reference.controller');
const { Op } = require("sequelize");
const allconstant = require("../../src/constantes");
const { Compressor } = require("mongodb");
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

  
try{
   
 let result = await MessageSendOne(req.body);
return res.status(200).send({
  message: "success",
  error: null,
  data: result,
});
// return;
} catch (error) {
  res.status(500).send({
         message: "Error occurred",
         error: error.toString(),
         data: null,
       });
      return;
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
      return await MessageSendOne(element);
    });

    // Attendre la résolution de toutes les promesses
    const messageData = await Promise.all(messagePromises);
console.log("Element retuning whwen multiple medias sent", messageData);
    res.status(200).send({
      status: 200,
      message: "Success",
      error: null,
      data: messageData.filter((msg) => msg != null), 
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
   MessageSendOne =  async (element)=>{

    console.log("in");
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
    let messagewhithNentionAndReferences;
    // const   = await sequelize. ();
    
    try {
    //  let  usersList = await UserControl.getEnabledUsersByEnterprise(element.enterprise_id);
     console.log("pass");
    //  let { mentions, references } = await extractMentionsAndReferences(element.content, usersList.data);
    //  console.log("list mentions" ,mentions);
    //  console.log("list references" ,references);
     conversationExist = await Conversations.findOne({ where: condition });
 
      if (!conversationExist) {
        console.log("this convesation is newer i.e it's not exist at last");
        const conversationData = {
          first_user: element.user_id,
          second_user: element.receiverId,
          enterprise_id: element.enterprise_id
        };
 
        let newConversation = await Conversations.create(conversationData,{ });
       
        if (newConversation) {
          messageData = {
            content: element.content,
            medias: element.medias,
            senderId: element.user_id,
            receiverId: element.receiverId,
            enterprise_id: element.enterprise_id,
            conversation_id: newConversation.dataValues.id,
            forwarded:element.forwarded
          };
         
          
           // Enregistrer le message
           console.log("before ");
           const newmessage =  await Messages.create(messageData,{
             returning :  allconstant.messageattributes,  
            } );
            console.log("after ");
          const receiverSocketId = getUserSocketId(element.receiverId);
          const senderSocketId = getUserSocketId(element.user_id);
         if(newmessage){
          // let message_id =  newmessage.data.id;
          if (element.mentions) {
            await Promise.all(
              element.mentions.map(async (mention) => {
                try {
                  let mentionsData = {
                    message_id	: newmessage.id,
                    mentioned_user_id : mention
                  };
                  return await messageMention.create(mentionsData,{ });
                } catch (error) {
                  console.error("Erreur lors de la création d'une mention :", error);
                }
              })
            );
            // for (let userId of mentions) {
            // }
          }
          if (element.references) {
            console.log("biginig  refeentement");
            await messageReferenceController.createMany(element.references,newmessage.id);
            console.log("befor  refeentement");

            // await Promise.all(
            //   element.references.map(async (reference) => {
            //     try {
            //       let referencesData = {
            //         message_id: newmessage.id,
            //         reference_type: reference.reference_type, 
            //         reference_code: reference.reference_code	
            //       };
            //       return await messageReference.create(referencesData,{ });
            //     } catch (error) {
            //       console.error("Erreur lors de la création d'une référence :", error);
            //     }
            //   })
            // );
            
          }
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
           JSON.parse(newmessage.medias);
           messagewhithNentionAndReferences =  await findByPkMesssagesIncludeMentionsAndRefs(newmessage.id);
           console.log("in building ", messagewhithNentionAndReferences);
       JSON.parse(messagewhithNentionAndReferences.medias);
           return messagewhithNentionAndReferences;
          // return res.status(200).send({ message: "Success", error: null, data: newmessage });
          }
        } else {

          return;
          // return res.status(200).send({ message: "error occurred", error: "error while creating conversation", data: null });
        }
      } else {
      
        if (!element.conversation_id || element.conversation_id === '' ) {
          console.log("conversation found ", conversationExist);
          element.conversation_id = conversationExist.id;
          //  res.status(200).send({ message: "error", error: "conversation identification failed", data: null });
          //  return;
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
            conversation_id: getConversation.id,
            forwarded:element.forwarded
          };
          if( element.message_id ){
            console.log("herer i respond to any message");
            // console.log("before emiting",receiverSocketId);
            const messageResponded = await Messages.findByPk( parseInt(element.message_id));
            if (messageResponded) {
               messageData.ResponseId = element.message_id;
               const newmessage =  await Messages.create(messageData,{
                returning :  allconstant.messageattributes, 
              } );
            if (newmessage) {
                
              const message = await Messages.findByPk(newmessage.id, {
                include: [
                  {
                    model: Messages,
                    as: 'responseFrom', // L'alias défini dans belongsTo
                  },
                  {
                    model: Users,
                    as: 'receiver', 
                    attributes : allconstant.Userattributes,
                  },
                  {
                    model: Users,
                    as: 'sender', 
                    attributes : allconstant.Userattributes,
                  },
                ],
              });
           JSON.parse(message.responseFrom.medias);
             const receiverSocketId = getUserSocketId(element.receiverId);
             const senderSocketId = getUserSocketId(element.user_id);
             if (element.mentions) {
              await Promise.all(
                element.mentions.map(async (mention) => {
                  try {
                    let mentionsData = {
                      message_id	: newmessage.id,
                      mentioned_user_id : mention
                    };
                    return await messageMention.create(mentionsData);
                  } catch (error) {
                    console.error("Erreur lors de la création d'une mention :", error);
                  }
                })
              );
              // for (let userId of mentions) {
              // }
            }
            if (element.references) {
              console.log("biginig  refeentement");
            await messageReferenceController.createMany(element.references,newmessage.id);
            console.log("befor  refeentement");
              // await Promise.all(
              //   element.references.map(async (reference) => {
              //     try {
              //       let referencesData = {
              //         message_id: newmessage.id,
              //         reference_type: reference.reference_type, 
              //       reference_code: reference.reference_code
              //       };
              //       return await messageReference.create(referencesData,{ });
              //     } catch (error) {
              //       console.error("Erreur lors de la création d'une référence :", error);
              //     }
              //   })
              // );
            };
            messagewhithNentionAndReferences =  await findByPkMesssagesIncludeMentionsAndRefs(message.id);
            JSON.parse(messagewhithNentionAndReferences.medias);
            if (receiverSocketId) {
              
              try {
                console.log("before emiting",receiverSocketId);
                
              const socketMessage =  getIo().to(receiverSocketId).emit("new_message", {
                  message: messagewhithNentionAndReferences,
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
                  message: messagewhithNentionAndReferences,
                });
                console.log("after emiting",socketMessage);
              } catch (error) {
                console.log("error emiting new message",error.toString());
              }
            }
            console.log("in building ", messagewhithNentionAndReferences);
            return messagewhithNentionAndReferences;
            }
            else{
              // res.status(500).send({ status: 500, message: "error", error: 'message non envoyer ', data: null });
   
              return 
            }
             }
  
           }else{
            const newmessage =  await Messages.create(messageData,{
              returning :  allconstant.messageattributes, 
            } );
          if (newmessage) {
            if (element.mentions) {
              await Promise.all(
                element.mentions.map(async (mention) => {
                  try {
                    let mentionsData = {
                      message_id	: newmessage.id,
                      mentioned_user_id : mention
                    };
                    return await messageMention.create(mentionsData,{ });
                  } catch (error) {
                    console.error("Erreur lors de la création d'une mention :", error);
                  }
                })
              );
              // for (let userId of mentions) {
              // }
            }
            if (element.references) {
              console.log("biginig  refeentement");
              await messageReferenceController.createMany(element.references,newmessage.id);
              console.log("befor  refeentement");
              // await Promise.all(
              //   element.references.map(async (reference) => {
              //     try {
              //       let referencesData = {
              //         message_id: newmessage.id,
              //         reference_type: reference.reference_type, 
              //       reference_code: reference.reference_code	
              //       };
              //       return await messageReference.create(referencesData,{ });
              //     } catch (error) {
              //       console.error("Erreur lors de la création d'une référence :", error);
              //     }
              //   })
              // );
              
            }
           
           const receiverSocketId = getUserSocketId(element.receiverId);
           const senderSocketId = getUserSocketId(element.user_id);
           // console.log("before emiting",receiverSocketId);
              

          //  res.status(200).send({ status: 200, message: "Success", error: null, data: newmessage });
          // return;
          // if (mentions || references)
          //   {
              messagewhithNentionAndReferences =  await findByPkMesssagesIncludeMentionsAndRefs(newmessage.id);
        JSON.parse(messagewhithNentionAndReferences.medias);
              
              if (receiverSocketId) {
                try {
                  console.log("before emiting",receiverSocketId);
                  
                const socketMessage =  getIo().to(receiverSocketId).emit("new_message", {
                    message: messagewhithNentionAndReferences,
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
                    message: messagewhithNentionAndReferences,
                  });
                  console.log("after emiting",socketMessage);
                } catch (error) {
                  console.log("error emiting new message",error.toString());
                }
              }
              console.log("in building ", messagewhithNentionAndReferences);
          // JSON.stringify(messagewhithNentionAndReferences.medias);
              return messagewhithNentionAndReferences;
            //   }
            //   else{
            //     if (receiverSocketId) {
            //       try {
            //         console.log("before emiting",receiverSocketId);
                    
            //       const socketMessage =  getIo().to(receiverSocketId).emit("new_message", {
            //           message: newmessage,
            //         });
            //         console.log("after emiting",socketMessage);
            //       } catch (error) {
            //         console.log("error emiting new message",error.toString());
            //       }
            //     }
  
            //     if (senderSocketId) {
            //       try {
            //         console.log("before emiting",senderSocketId);
                    
            //       const socketMessage =  getIo().to(senderSocketId).emit("new_message", {
            //           message: newmessage,
            //         });
            //         console.log("after emiting",socketMessage);
            //       } catch (error) {
            //         console.log("error emiting new message",error.toString());
            //       }
            //     }
            //     console.log("in building ", newmessage);
            // JSON.stringify(newmessage.medias);
            //     return newmessage;
            //   }
          }
          else{
            return;
          }
        }
 
        } else {
          //  res.status(200).send({ message: "error", error: "error while getting conversation", data: null });
      return;
        }
      }
 
    } catch (error) {
      //  await  .rollback();
      return error;
      // res.status(500).send({
      //   message: "Error occurred",
      //   error: error.toString(),
      //   data: null,
      // });
    }
 };
 findByPkMesssagesIncludeMentionsAndRefs = async (id)=>{

  try {
    const message = await Messages.findByPk(id, {
      include : [
        {
          model : messageMention,
          as: 'mentions', // L'alias défini dans belongsTo
          include: [
            {
              model: Users,
              as: 'usename', // correspond à messageMention.belongsTo(Users, { as: 'mentionedUser', ... })
              attributes: ['user_name'] // optionnel : pour cacher les infos sensibles
            }
          ]

        },
        {
          model : messageReference,
          as: 'references', // L'alias défini dans belongsTo

        },
        {
          model: Messages,
          as: 'responseFrom', // L'alias défini dans belongsTo
        },
        {
          model: Users,
          as: 'receiver', 
          attributes : allconstant.Userattributes,
        },
        {
          model: Users,
          as: 'sender', 
          attributes : allconstant.Userattributes,
        },
      ]
    });
// const mentionUseName  = await Promise.all(
//   message.mentions.map(async (mention)=>{
//     const userData  = await UserControl.show(mention.mentioned_user_id);
//     mention.usename.toString() = userData.user_name;
//     return mention;
//   }
//   )
// );

// console.log("mentions  whith username =",mentionUseName);
  // message.mentions = mentionUseName;
    // const user =  UserControl.show(message.)
    // let messageReferenceData = await  messageReferenceController.showByMessageId(message.dataValues.id);
    // let messageMentionData = await  messageMentionController.showByMessageId(message.dataValues.id);
    // console.log("message mentions effeences", messageReferenceData);
    return message;
    // {
    //   message,
    //   references: await messageReference.findAll({
    //     where:{
    //         message_id : message.dataValues.id
    //     },
    //     // attribute: allconstant.mentionsattribute,
    //     logging: console.log, 
    // }),
    //   mentions: await messageMention.findAll({
    //     where:{
    //         message_id : message.dataValues.id
    //     },
    //     // attribute: allconstant.mentionsattribute,
    //     logging: console.log, 
    // }),
    // };
    
  } catch (error) {
    return error;
  }

 };
createMesage = async (messageData)=>{
  try {
    let newmessage =  await Messages.create(messageData,{
      returning :  allconstant.messageattributes
    } );
    return {data: newmessage, error: null, message: 'success'}
  } catch (error) {
    
    return {data: null, error: error.toString() , message:null };
  }
};
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
    const messageData = findByPkMesssagesIncludeMentionsAndRefs(data.id);
    res.status(200).send({ message: "Success", error: null, data: messageData });
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
      groupBy: [['createdAt', 'ASC']],
      
    });
    let messageData = await  Promise.all(
        data.map(async (message)=> {
          
          const result = findByPkMesssagesIncludeMentionsAndRefs(message.id);
       
        // console.log(result);
          return  result;
        })
    );

    let mediaToObject =  
      messageData.map((message)=>{
        let media =   JSON.parse(message.medias);
        message.medias = media;
        return message;
      });
 
    
    console.log("messages gouped", mediaToObject);
    res.status(200).send({ message: "Success", error: null, data: mediaToObject });
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
      parseInt(id),{
        attributes : allconstant.messageattributes
      } );
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
      parseInt(req.params.id),
     { 
      include  : [
        {
          model: Users,
          as: 'receiver', 
          attributes : allconstant.Userattributes,
        },
        {
          model: Users,
          as: 'sender', 
          attributes : allconstant.Userattributes,
        },
      ]
     }
    );
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
        messagewhithNentionAndReferences =  await findByPkMesssagesIncludeMentionsAndRefs(data.dataValues.id);
        if (messagewhithNentionAndReferences) {
          if (receiverSocketId) {
            getIo().to(receiverSocketId).emit("renew_message", {
              message: messagewhithNentionAndReferences,
            });
          }
          if (senderSocketId) {
            getIo().to(senderSocketId).emit("renew_message", {
              message: messagewhithNentionAndReferences,
            });
            
          }
          res.status(200).send({ message: "Success", error: null, data: messagewhithNentionAndReferences });
        }else{
          
          res.status(200).send({ message: "error", error: 'error while getting message updated', data: null });
        }
       
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

 extractMentionsAndReferences =  async (message, usersList) => {
  console.log("in mentions and references");
  let mentions = [];
  let references = [];
try {
   // Extraction des mentions (@nom)
   message.match(/@(\w+)/g)?.forEach((mention) => {
    let username = mention.substring(1); // Supprime le "@"
    let user = usersList.find(u => u.user_name === username );
    if (user) {
        mentions.push(user.id);
    }
});

// Extraction des références (#code)
message.match(/#([A-Z]\d+)/g)?.forEach((ref) => {
  let refCode = ref.substring(1); // Supprime le "#"
  
  let typeMap = {
      'F': 'invoice',
      'E': 'expenditure',
      'D': 'debt',
      'P': 'payment',
      'S': 'stock',
      'C': 'customer',
      'T': 'tub'
  };

  let type = typeMap[refCode.charAt(0)] || 'unknown'; // Défaut à 'unknown' si non défini
  references.push({ type, code: refCode });
});

return { mentions, references };
} catch (error) {
  console.log("Error whilw extrating", error);
}
 
};

module.exports = {MessagesController,findByPkMesssagesIncludeMentionsAndRefs};
