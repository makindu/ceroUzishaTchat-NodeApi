const  Conversations  = require("../../db.provider").Conversations;
const Libraries =  require('../../db.provider').Libraries;
const Users =  require('../../db.provider').Users;
const Messages =  require('../../db.provider').messages;
const allconstant = require("../constantes");
const UserController = require('../users/user.controller');
const Participer =  require('../../db.provider').Participer;
const { Op, json, where } = require("sequelize");
const getIo =  require("../../socket").getIo;
const getUserSocketId =  require("../../socket").getUserSocketId;
const connection  = require('../../db.provider').connection;

const ConversationsController = {};

const generatePaginationUrls = (baseUrl, page, pageSize, totalPages) => {
  const nextUrl = page < totalPages ? `${baseUrl}?page=${page + 1}&pageSize=${pageSize}` : null;
  const prevUrl = page > 1 ? `${baseUrl}?page=${page - 1}&pageSize=${pageSize}` : null;
  const firstUrl = `${baseUrl}?page=1&pageSize=${pageSize}`;
  const lastUrl = `${baseUrl}?page=${totalPages}&pageSize=${pageSize}`;

  return { nextUrl, prevUrl, firstUrl, lastUrl };
};

ConversationsController.messages = async (req,res)=>{
  try {
    const conversationId = parseInt(req.params.conversationId);
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'ID de conversation invalide.' });
    }

    // Pagination : Page et taille
    const page = parseInt(req.query.page) || 1; // Page actuelle
    const pageSize = parseInt(req.query.pageSize) || 10; // Messages par page
let condition = {
  [Op.and]:
    {conversation_id: conversationId },
    status: { [Op.ne]: 'deleted' }
}
    // Récupération des messages avec Sequelize
    const { count, rows: messages } = await Messages.findAndCountAll({
      include : [
        {
          model: Messages,
          as: 'responseFrom', // L'alias défini dans belongsTo
        },
      ],
      where: condition,
      order: [['createdAt', 'ASC'],['updatedAt','ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    // Calcul du nombre total de pages
    const totalPages = Math.ceil(count / pageSize);

    // Génération des URLs de pagination
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/messages/${conversationId}`;
    const { nextUrl, prevUrl, firstUrl, lastUrl } = generatePaginationUrls(baseUrl, page, pageSize, totalPages);

    // Réponse avec les messages et les informations de navigation
let  medias = await Promise.all( messages.map((message)=>{
    const media =   JSON.parse(message.medias); 
    message.medias = media;
    if (message.responseFrom) {
      message.responseFrom.medias=JSON.parse(message.responseFrom.medias);
    }
    const result =  findByPkMesssagesIncludeMentionsAndRefs(message.id);

      return result;
    }));
    let mediaToObject =  
      medias.map((message)=>{
        let media =   JSON.parse(message.medias);
        message.medias = media;
        return message;
      });
    res.json({
      status:200,
      error:null,
      message:"success",
      currentPage: page,
      totalPages:totalPages,
      totalMessages: count,
      nextUrl:nextUrl,
      prevUrl:prevUrl,
      firstUrl:firstUrl,
      lastUrl:lastUrl,
      data:mediaToObject,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages :', error);
    res.json({
      status:400,
      error:error,
      message:"error",
      data:null,
    });
  }
}

ConversationsController.create = async (FirstUser,SecondUser, EnterpriseId ) => {
  if (!FirstUser &&  !SecondUser ) {
    // res.status(400).send(" les utilisateur concérnés sont requis");
    return;
  }
  if(!EnterpriseId){
    // res.status(400).send("une erreur s'est produite ");
    return;
  }
 
  const ConversationsData = {
    first_user: FirstUser ,
    second_user: SecondUser, 
    enterprise_id :EnterpriseId,
    
  };
  try {
    const result = await Conversations.create(ConversationsData);
    // return result
    if (result) {
      return {
        data: result,
        status:true,
        error:null
      }
    }
      else{
        return {
          data: null,
          status:false,
          error:"convrsation not create"
        }
      }
    
  } catch (error) {
    return {
      data: null,
      status:false,
      error:error.toString()
    }
    // return {error}
  }
};
ConversationsController.getData = async (req, res) => {
  console.log("getting all data");

  let condition = {};
  if (req.body.user_id) {
    condition = {
      [Op.or]: [
        { first_user: req.body.user_id },
        { second_user: req.body.user_id }
      ],
      status: { [Op.ne]: 'deleted' }
    };
  }

  try {
    const data = await Conversations.findAll({
      where: condition,
      order: [['createdAt', 'ASC']],
      attributes: [
        'id',
        'first_user',
        'second_user',
        'status',
        'createdAt',
        'updatedAt',
        'enterprise_id',
      ],
    });

    if (!data || data.length === 0) {
      return res.status(500).send({ message: "No conversations found", error: null, data: [] });
    }

    const enrichedConversations = await Promise.all(data.map(async (conversation) => {
      let firstUser = null;
      let secondUser = null;
      let id = parseInt(conversation.id);

      let conditionMessage = {
        [Op.and]: [
          { conversation_id: id },
          { status: { [Op.ne]: 'deleted' } }
        ]
      };

      // Récupération des utilisateurs
      if (conversation.first_user === req.body.user_id) {
        firstUser = await Users.findByPk(conversation.first_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone',
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
        secondUser = await Users.findByPk(conversation.second_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone',
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
      } else {
        firstUser = await Users.findByPk(conversation.second_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone',
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
        secondUser = await Users.findByPk(conversation.first_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone',
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
      }

      // Récupération du dernier message avec vérification
      const lastMessage = await Messages.findOne({
        where: conditionMessage,
        order: [['createdAt', 'DESC']],
        limit: 1,
      });

      let resultLastMessage = null;
      if (lastMessage) {
        resultLastMessage = await findByPkMesssagesIncludeMentionsAndRefs(lastMessage.id);
        if (resultLastMessage && resultLastMessage.medias) {
          resultLastMessage.medias = JSON.parse(resultLastMessage.medias);
        }
      }

      // Compter les messages non lus
      const unreadMessagesCount = await Messages.count({
        where: {
          conversation_id: id,
          status: 'unread',
          receiverId: req.body.user_id
        }
      });

      return {
        conversation: conversation,
        mediasData: [],
        docsData: [],
        lastMessage: resultLastMessage,
        messages: [],
        firstUser: firstUser || null,
        secondUser: secondUser || null,
        unreadMessages: unreadMessagesCount
      };
    }));

    res.status(200).send({ status: 200, message: "Success", error: null, data: enrichedConversations });

  } catch (error) {
    res.status(500).send({ status: 500, message: "Error occurred", error: error.toString(), data: [] });
  }
};

ConversationsController.showOne = async (conversation_id,user_id) => {
  console.log("getting all data");

  

  try {
    const data = await Conversations.findByPk(
         conversation_id,{ 
      attributes: [
        'id',
        'first_user',
        'second_user',
        'status',
        'createdAt',
        'updatedAt',
        'enterprise_id',
      ], // spécifier les champs à retourner
    });

    if (!data) {
      return res.status(200).send({ message: "No conversations found", error: null, data: [] });
    }
      let firstUser = null;
      let secondUser = null;
      let condition = {
        [Op.and]:
          {conversation_id: data.id },
          status: { [Op.ne]: 'deleted' }
      }
      if (data.first_user === user_id) {
        firstUser = await Users.findByPk(data.first_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone', 
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
        secondUser = await Users.findByPk(data.second_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone', 
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
      } else {
        // Si `user_id` est le `second_user`, inversez les utilisateurs
        firstUser = await Users.findByPk(data.second_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone', 
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
        secondUser = await Users.findByPk(data.first_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone', 
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
      }

      // Récupérer le dernier message de la conversation
      const lastMessage = await Messages.findOne({
        where: condition ,
        order: [['createdAt', 'DESC']],
        limit: 1,
      });
      const MessagesUser = await Messages.findAll({
        where: condition,
        order: [['createdAt', 'ASC']],
      
      });
      const unreadMessagesCount = await Messages.count({
        where: {
          conversation_id: data.id,
          status: 'unread', 
          // senderId: req.body.user_id ,
           receiverId: user_id
        }
      });
      const enrichedConversations =  {
        conversation: data,
        lastMessage: lastMessage ? lastMessage : null,
        messages : [],
        firstUser: firstUser ? firstUser : null,
        secondUser: secondUser ? secondUser : null,
        unreadMessages: unreadMessagesCount
      };
   
      return    enrichedConversations;
  } catch (error) {
    // res.status(400).send({ status: 500, message: "Error occurred", error: error.toString(), data: [] });
    return json( { message: "error" , data :  null});
  }
};
const getUsersInConversation = async (conversationId) => {
  try {
    const participants = await Participer.findAll({
      attributes: ['role'],
      where: { id_conversation: conversationId },
      include: [
        {
          model: Users,
          as: 'participants', 
          attributes: allconstant.Userattributes
        }
      ],
    });
    const members = participants.map(p => {
      return {
        role: p.role,
        ...p.participants?.dataValues
      };
    });

    return members;

  } catch (error) {
    console.error('Erreur lors de la récupération des participants :', error);
    return [];
  }
};

showOneConversation = async (conversation_id,user_id,type) => {
  console.log("getting all data ", type);

  

  try {
    const data = await Conversations.findByPk(
         conversation_id,{ 
      attributes: allconstant.convesationAttribut // spécifier les champs à retourner
    });

    if (!data) {
      return res.status(200).send({ message: "No conversations found", error: null, data: [] });
    }
      let firstUser = null;
      let secondUser = null;
      let condition = {
        [Op.and]:
          {conversation_id: data.id },
          status: { [Op.ne]: 'deleted' }
      }
      if (data.first_user === user_id) {
        firstUser = await Users.findByPk(data.first_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone', 
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
        secondUser = await Users.findByPk(data.second_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone', 
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
      } else {
        // Si `user_id` est le `second_user`, inversez les utilisateurs
        firstUser = await Users.findByPk(data.second_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone', 
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
        secondUser = await Users.findByPk(data.first_user, {
          attributes: [
            'id', 'user_name', 'full_name', 'user_mail', 'user_phone', 
            'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
          ]
        });
      }

      // Récupérer le dernier message de la conversation
      const lastMessage = await Messages.findOne({
        where: condition ,
        order: [['createdAt', 'DESC']],
        limit: 1,
      });
      const MessagesUser = await Messages.findAll({
        where: condition,
        order: [['createdAt', 'ASC']],
      
      });
      const unreadMessagesCount = await Messages.count({
        where: {
          conversation_id: data.id,
          status: 'unread', 
          // senderId: req.body.user_id ,
           receiverId: user_id
        }
      });
      const userMember = await getUsersInConversation(data.id);
      console.log("user member", userMember);
      const enrichedConversations =  {
        conversation: data,
        lastMessage: lastMessage ? lastMessage : null,
        messages : [],
        firstUser: firstUser ? firstUser : null,
        secondUser: secondUser ? secondUser : null,
        members : type === 'group' ? userMember : null,
        unreadMessages: unreadMessagesCount
      };
   
      return    enrichedConversations;
  } catch (error) {
    // res.status(400).send({ status: 500, message: "Error occurred", error: error.toString(), data: [] });
    return json( { message: "error" , error: error.toString(), data :  null});
  }
};

ConversationsController.deletePermanently = async (req, res) => {
  const { conversation_id } = req.params;  

  try {
    const conversation = await Conversations.findByPk(conversation_id);

    if (!conversation) {
      return res.status(404).send({ message: "Conversation not found", error: null });
    }
    conversation.status = "deleted";

    await conversation.save();  

    return res.status(200).send({
      message: "Conversation deleted",
      error: null,
      data: conversation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error occurred while deleting the conversation",
      error: error.toString(),
    });
  }
};

ConversationsController.getSingleConversations = async (req, res) => {
  // let condition = {};
  // if (req.params.id) {
  //   condition = {
  //     id:id,
  //   };
  // }
  if (!req.params.id) {
    res
      .status(400)
      .send({ message: "Error", error: "No data found", data: {} });
    return;
  }
  try {
    const data = await Conversations.findByPk(parseInt(req.params.id));
    res.status(200).send({ message: "Success", error: null, data: data });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error occured", error: error.toString(), data: [] });
  }
};

ConversationsController.updateConversations = async (req, res) => {
  if (!req.params.id) {
    res
      .status(400)
      .send({ message: "Error", error: "Aucun ID specifie", data: null });
    return;
  }

  try {
    let result = await Conversations.update(req.body, { where: { id: req.params.id } });
    res.status(200).send({ message: "Success", error: null, data: result });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error", error: error.toString(), data: null });
  }
};
ConversationsController.getConversationMedias = async (req, res)=>{
    if (!req.body.conversation) {
      res
      .status(400)
      .send({ message: "Error", error: "some data required", data: null });
    return;
    }
try {
  
    const conversation = await Conversations.findByPk(parseInt(req.body.conversation));

    if (conversation) 
    {
      const messagesCondition = {
        [Op.or]:[
          {
            senderId : conversation.first_user,
            receiverId: conversation.second_user
          },
          {
            senderId: conversation.second_user,
            receiverId:  conversation.first_user,
          }
        ],
        status: { [Op.ne]: 'deleted' },
        medias: {[Op.ne]:{}}
      };
        const messages = await Messages.findAll({where: messagesCondition });
        if (messages){
          let messageMap = await Promise.all(
            messages.map(async(message)=>{
                return JSON.parse(message.medias);
            })
          );
          let  files =  messageMap.filter( 
            m=>m.category === 'docs' );
        
          let  medias = messageMap.filter( m=>m.category === 'medias' );
          ;
          const result = {
            mediasData : medias,
            docsData :  files
          }
          res
      .status(200)
      .send({ message: "Success", error: null, data: result });
    return;
        }else{
          res
          .status(200)
          .send({ message: "Error", error: "no message found", data: null });
        return;
        }               
    }else{
      res
          .status(200)
          .send({ message: "Error", error: "no Conversation found found", data: null });
        return;
    }
} catch (error) {
  res
  .status(500)
  .send({ message: "Error", error: error.toString(), data: null });
return;
}

}
ConversationsController.conversationExist = async (element) => {
  try {
    const condition = {
      [Op.or]: [
        { first_user: element.user_id, second_user: element.receiverId },
        { first_user: element.receiverId, second_user: element.user_id },
      ]
    };

    let conversation = await Conversations.findOne({ where: condition });

    if (conversation) {
      const enrichedConversation = await showOneConversation(conversation.id, element.user_id);
      const receiverSocketId = getUserSocketId(element.receiverId);
      const senderSocketId = getUserSocketId(element.user_id);

      if (receiverSocketId) {
        getIo().to(receiverSocketId).emit("new_conversation", {
          conversation: enrichedConversation,
        });
      }
      if (senderSocketId) {
        getIo().to(senderSocketId).emit("new_conversation", {
          conversation: enrichedConversation,
        });
      }

      return {
        data: conversation,
        status: true,
        error: null
      };
    } else {
      let convrsationData = {
        first_user: element.user_id,
        second_user: element.receiverId,
        status: 'activated',
        enterprise_id: element.enterprise_id
      };

      const result = await Conversations.create(convrsationData);

      if (result) {
        const enrichedConversation = await showOneConversation(result.id, element.user_id);
        const receiverSocketId = getUserSocketId(element.receiverId);
        const senderSocketId = getUserSocketId(element.user_id);

        if (receiverSocketId) {
          getIo().to(receiverSocketId).emit("new_conversation", {
            conversation: enrichedConversation,
          });
        }
        if (senderSocketId) {
          getIo().to(senderSocketId).emit("new_conversation", {
            conversation: enrichedConversation,
          });
        }

        return {
          data: result,
          status: true,
          error: null
        };
      } else {
        return {
          data: null,
          status: false,
          error: "Conversation not found"
        };
      }
    }
  } catch (error) {
    return {
      data: null,
      status: false,
      error: error.toString()
    };
  }
};
ConversationsController.createGroup = async (req,res)=>{

  if (!req.body || !req.body.members ) {
    res
    .status(500)
    .send({ message: "Error", error: "some data required", data: null });
  return;
  }
  let transaction = await connection.transaction();
  try {
    let  conversation = await Conversations.create(req.body);
    let data = {};
    if (conversation) 
      {
        for (let index = 0; index < req.body.members.length; index++) {
          const User = req.body.members[index];
          const userfound =  await UserController.userExists({id:User.id});
          if (userfound) {
            const socketId = getUserSocketId(User.id);
              let groupdata = {
                id_user : User.id,
                id_conversation : conversation.id,
                role: User.id === req.body.user_id ? "admin" : "writter"
              };
              let userInConversation = await Participer.create(groupdata);
              if (userInConversation) {
                
                const convesationFormat = await showOneConversation(conversation.id,User.id,req.body.type);
                if (convesationFormat) {
                  
                  data = convesationFormat;
                
                  
                        
                          if (socketId) {
                            getIo().to(socketId).emit("new_conversation", {
                              conversation: data,
                            });
                          }
                        
                      // const sendersocketId = getUserSocketId(userId);
                      //     if (socketId) {
                      //       getIo().to(sendersocketId).emit("new_message", {
                      //         message: messagewhithNentionAndReferences,
                      //       });
                      //     }
                   
                  
                  console.log("participant convrsation", convesationFormat);
                }
              

          }
          else{
            await transaction.rollback();
            res
                  .status(400)
                  .send({ message: "Error", error: "User not fount", data: null });
                return;
          // }
        }  
    }
    
  } ;
  
  await  transaction.commit();
                  res
                  .status(200)
                  .send({ message: "Success", error: null, data: data });
                return;
} }catch (error) {
    await transaction.rollback();
    res
                  .status(400)
                  .send({ message: "Error", error: error.toString(), data: null });
                return;
  }
  


}


module.exports = ConversationsController;
