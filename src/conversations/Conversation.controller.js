const  Conversations  = require("../../db.provider").Conversations;
const Users =  require('../../db.provider').Users;
const Messages =  require('../../db.provider').messages;
const UserControl = require('../users/user.controller');
const { Op } = require("sequelize");

const ConversationsController = {};

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
        where: { conversation_id: conversation.id },
        order: [['createdAt', 'DESC']],
        limit: 1,
      });
      const MessagesUser = await Messages.findAll({
        where: { conversation_id: conversation.id },
        order: [['createdAt', 'ASC']],
      
      });
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
        messages : MessagesUser,
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
