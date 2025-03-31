const  Conversations  = require("../../db.provider").Conversations;
const Users =  require('../../db.provider').Users;
const Messages =  require('../../db.provider').messages;
const { Op, json } = require("sequelize");

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
      order: [['createdAt', 'ASC']],
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
      return message;
    }));
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
      data:medias,
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
    return result
  } catch (error) {
    
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
      ], // spécifier les champs à retourner
    });

    if (!data || data.length === 0) {
      return res.status(200).send({ message: "No conversations found", error: null, data: [] });
    }

    const enrichedConversations = await Promise.all(data.map(async (conversation) => {
      let firstUser = null;
      let secondUser = null;
      let conditionMessage = {
        [Op.and]:
          {conversation_id: conversation.id },
          status: { [Op.ne]: 'deleted' }
      }
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
        // Si `user_id` est le `second_user`, inversez les utilisateurs
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

      // Récupérer le dernier message de la conversation
      const lastMessage = await Messages.findOne({
        where: conditionMessage,
        order: [['createdAt', 'DESC']],
        limit: 1,
      });
      // const MessagesUser = await Messages.findAll({
      //   where: { conversation_id: conversation.id },
      //   order: [['createdAt', 'ASC']],
      // });
      const unreadMessagesCount = await Messages.count({
        where: {
          conversation_id: conversation.id,
          status: 'unread', 
          // senderId: req.body.user_id ,
           receiverId: req.body.user_id
        }
      });
      return {
        conversation: conversation,
        lastMessage: lastMessage ? lastMessage : null,
        messages : [],
        firstUser: firstUser ? firstUser : null,
        secondUser: secondUser ? secondUser : null,
        unreadMessages: unreadMessagesCount
      };
    }));

    res.status(200).send({ staus: 200, message: "Success", error: null, data: enrichedConversations });

  } catch (error) {
    res.status(400).send({ status: 500, message: "Error occurred", error: error.toString(), data: [] });
    return;
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

module.exports = ConversationsController;
