const  Messages  = require("../../db.provider").messages;
const Conversations =  require('../../db.provider').Conversations;
const ConversationsController = require("../conversations/Conversation.controller");
const ConversationsControler =  require('../conversations/Conversation.controller');
const Users =  require('../../db.provider').Users;
const UserControl = require('../users/user.controller');
const { Op, where } = require("sequelize");
// const IO = require('../../app') ; 

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
    [Op.and]: [
      { first_user: req.body.user_id },
      { second_user: req.body.receiverId }
    ]
  };

  let conversationExist = {};
  let messageData = {};

  try {
    conversationExist = await Conversations.findAll({ where: condition });

    if (conversationExist.length === 0 || conversationExist === '' && !req.body.conversation_id) {
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
          conversation_id: newConversation.id
        };

        // Enregistrer le message
        await Messages.create(messageData);

        // IO.emit('newConversation', newConversation);

        return res.status(200).send({ message: "Success", error: null, data: newConversation });
      } else {
        return res.status(200).send({ message: "error occurred", error: "error while creating conversation", data: null });
      }
    } else {
      messageData = {
        content: req.body.content,
        medias: req.body.medias,
        senderId: req.body.user_id,
        receiverId: req.body.receiverId,
        enterprise_id: req.body.enterprise_id,
        conversation_id: req.body.conversation_id
      };

      if (!req.body.conversation_id) {
        res.status(200).send({ message: "error", error: "conversation identification failed", data: null });
        return;
      }

      const getConversation = await Conversations.findByPk(parseInt(req.body.conversation_id));

      if (getConversation) {
        const newmessage = await Messages.create(messageData);

        // Émettre un événement pour informer l'UI du récepteur
        // IO.emit('newMessage', messageData);
        if (newmessage) {
          res.status(200).send({ status: 200, message: "Success", error: null, data: newmessage });
          return;
        }
        else{
          res.status(500).send({ status: 500, message: "error", error: 'message non envoyer ', data: null });

          return 
        }

      } else {
        return res.status(200).send({ message: "error", error: "error while getting conversation", data: null });
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


MessagesController.getData = async (req, res) => {
  console.log("getting all data")
  let condition = {};
  if (req.params.value) {
    condition = {
      [Op.or]: { id: req.params.value, senderId: req.params.value , receiverId : req.params.value },
    };
  }
  try {
    const data = await Messages.findAll();
    res.status(200).send({ message: "Success", error: null, data: data });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error occured", error: error.toString(), data: [] });
  }
};
MessagesController.getMessagesByConversation = async (req, res) => {
  console.log("getting all data"+req.body.conversation_id)
  let condition = {};
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
      where: {
        conversation_id: req.body.conversation_id
      },
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
        }
      
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


MessagesController.getSingleMessages = async (req, res) => {
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
    const data = await Messages.findByPk(parseInt(req.params.id));
    res.status(200).send({ message: "Success", error: null, data: data });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error occured", error: error.toString(), data: [] });
  }
};

MessagesController.updateMessages = async (req, res) => {
  if (!req.params.id) {
    res
      .status(400)
      .send({ message: "Error", error: "Aucun ID specifie", data: null });
    return;
  }

  try {
    let result = await Messages.update(req.body, { where: { id: req.params.id } });
    res.status(200).send({ message: "Success", error: null, data: result });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error", error: error.toString(), data: null });
  }
};

module.exports = MessagesController;
