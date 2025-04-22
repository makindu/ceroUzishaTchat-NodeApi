const Conversations = require("../../db.provider").Conversations;
const Libraries = require('../../db.provider').Libraries;
const Users = require('../../db.provider').Users;
const Messages = require('../../db.provider').messages;
const allconstant = require("../constantes");
const UserController = require('../users/user.controller');
const Participer = require('../../db.provider').Participer;
const { Op, json, where } = require("sequelize");
const getIo = require("../../socket").getIo;
const getUserSocketId = require("../../socket").getUserSocketId;
const connection = require('../../db.provider').connection;

// const ConversationsController = {};

const generatePaginationUrls = (baseUrl, page, pageSize, totalPages) => {
  const nextUrl = page < totalPages ? `${baseUrl}?page=${page + 1}&pageSize=${pageSize}` : null;
  const prevUrl = page > 1 ? `${baseUrl}?page=${page - 1}&pageSize=${pageSize}` : null;
  const firstUrl = `${baseUrl}?page=1&pageSize=${pageSize}`;
  const lastUrl = `${baseUrl}?page=${totalPages}&pageSize=${pageSize}`;

  return { nextUrl, prevUrl, firstUrl, lastUrl };
};

const  messages = async (req, res) => {
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
        { conversation_id: conversationId },
      status: { [Op.ne]: 'deleted' }
    }
    // Récupération des messages avec Sequelize
    const { count, rows: messages } = await Messages.findAndCountAll({
      include: [
        {
          model: Messages,
          as: 'responseFrom', // L'alias défini dans belongsTo
        },
      ],
      where: condition,
      order: [['createdAt', 'ASC'], ['updatedAt', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    // Calcul du nombre total de pages
    const totalPages = Math.ceil(count / pageSize);

    // Génération des URLs de pagination
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/messages/${conversationId}`;
    const { nextUrl, prevUrl, firstUrl, lastUrl } = generatePaginationUrls(baseUrl, page, pageSize, totalPages);

    // Réponse avec les messages et les informations de navigation
    let medias = await Promise.all(messages.map((message) => {
      const media = JSON.parse(message.medias);
      message.medias = media;
      if (message.responseFrom) {
        message.responseFrom.medias = JSON.parse(message.responseFrom.medias);
      }
      const result = findByPkMesssagesIncludeMentionsAndRefs(message.id);

      return result;
    }));
    let mediaToObject =
      medias.map((message) => {
        let media = JSON.parse(message.medias);
        message.medias = media;
        return message;
      });
    res.json({
      status: 200,
      error: null,
      message: "success",
      currentPage: page,
      totalPages: totalPages,
      totalMessages: count,
      nextUrl: nextUrl,
      prevUrl: prevUrl,
      firstUrl: firstUrl,
      lastUrl: lastUrl,
      data: mediaToObject,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages :', error);
    res.json({
      status: 400,
      error: error,
      message: "error",
      data: null,
    });
  }
}

const  create = async (FirstUser, SecondUser, EnterpriseId) => {
  if (!FirstUser && !SecondUser) {
    // res.status(400).send(" les utilisateur concérnés sont requis");
    return;
  }
  if (!EnterpriseId) {
    // res.status(400).send("une erreur s'est produite ");
    return;
  }

  const ConversationsData = {
    first_user: FirstUser,
    second_user: SecondUser,
    enterprise_id: EnterpriseId,

  };
  try {
    const result = await Conversations.create(ConversationsData);
    // return result
    if (result) {
      return {
        data: result,
        status: true,
        error: null
      }
    }
    else {
      return {
        data: null,
        status: false,
        error: "convrsation not create"
      }
    }

  } catch (error) {
    return {
      data: null,
      status: false,
      error: error.toString()
    }
    // return {error}
  }
};
const  getData = async (req, res) => {
  console.log("getting all data");

  let condition = {};
  // if (req.body.user_id) {
  condition = {
    [Op.or]: [
      { first_user: req.body.user_id },
      { second_user: req.body.user_id },
    ],
    status: { [Op.ne]: 'deleted' }
  };
  // }

  try {
    const groups = await getUserGoupConversation(req.body.user_id);
    const data = await Conversations.findAll({
      where: condition,
      order: [['createdAt', 'ASC']],
      attributes: allconstant.convesationAttribut
    });
    console.log("data group when gttinh all ", groups);
    if (!data || !groups) {
      return res.status(500).send({ message: "No conversations found  1", error: null, data: [] });
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
        if (conversation.type === "dual") {
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
        }
      } else {
        if (conversation.type === "dual") {
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


    const formattedGroups = await Promise.all(groups.map(async group => {
      const conversationId = group.id;
      const lastMessage = await Messages.findOne({
        where: {
          conversation_id: conversationId,
          status: { [Op.ne]: 'deleted' }
        },
        order: [['createdAt', 'DESC']],
        limit: 1
      });
      let createdBy = null;
      let resultLastMessage = null;
      if (lastMessage) {
        resultLastMessage = await findByPkMesssagesIncludeMentionsAndRefs(lastMessage.id);
        if (resultLastMessage && resultLastMessage.medias) {
          resultLastMessage.medias = JSON.parse(resultLastMessage.medias);
        }
      }

      // 🔹 Messages non lus pour l'utilisateur connecté
      const unreadMessagesCount = await Messages.count({
        where: {
          conversation_id: conversationId,
          status: 'unread',
          receiverId: req.body.user_id
        }
      });
      console.log("user ==============>", group.user_id);
      const userInitiate = await UserController.show(parseInt(group.user_id));
      if (userInitiate) {
        createdBy = userInitiate;
      }

      return {
        conversation: {
          id: group.id,
          status: group.status,
          type: group.type,
          group_avatar: JSON.parse(group.group_avatar),
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          enterprise_id: group.enterprise_id,
          group_name: group.group_name || null,
          description: group.description || null,
          created_by: createdBy,
          user_id: group.user_id,
          first_user: null,
          second_user: null,
        },
        mediasData: [],
        docsData: [],
        lastMessage: resultLastMessage,
        messages: [],
        firstUser: null,
        secondUser: null,
        unreadMessages: unreadMessagesCount,
        members: group.members
      };
    }));


    const allConversations = [...enrichedConversations, ...formattedGroups];

    res.status(200).send({
      status: 200,
      message: "Success",
      error: null,
      data: allConversations
    });

  } catch (error) {
    res.status(500).send({ status: 500, message: "Error occurred", error: error.toString(), data: [] });
  }
};

const  showOne = async (conversation_id, user_id) => {
  console.log("getting all data");



  try {
    const data = await Conversations.findByPk(
      conversation_id, {
      attributes: allconstant.convesationAttribut // spécifier les champs à retourner
    });

    if (!data) {
      return res.status(200).send({ message: "No conversations found 2", error: null, data: [] });
    }
    let firstUser = null;
    let secondUser = null;
    let condition = {
      [Op.and]:
        { conversation_id: data.id },
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
      where: condition,
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
    JSON.parse(data.group_avatar);
    const enrichedConversations = {
      conversation: data,
      lastMessage: lastMessage ? lastMessage : null,
      messages: [],
      firstUser: firstUser ? firstUser : null,
      secondUser: secondUser ? secondUser : null,
      unreadMessages: unreadMessagesCount
    };

    return enrichedConversations;
  } catch (error) {
    // res.status(400).send({ status: 500, message: "Error occurred", error: error.toString(), data: [] });
    return json({ message: "error", data: null });
  }
};
const getUsersInConversation = async (id, criterial, user_id) => {
  try {
    const whereClause = criterial === "conversation"
      ? { id_conversation: id }
      : { id_user: user_id, id_conversation: id };

    const participants = await Participer.findAll({
      attributes: ['role', 'status'],
      where: whereClause,
      include: [
        {
          model: Users,
          as: 'participants',
          attributes: allconstant.Userattributes,
          required: true
        }
      ]
    });

    // Nettoyage des doublons avec Map
    const uniqueMembersMap = new Map();
    participants.forEach(p => {
      const userId = p.participants?.id;
      if (!uniqueMembersMap.has(userId)) {
        uniqueMembersMap.set(userId, {
          role: p.role,
          memberStatus: p.status,
          ...p.participants?.dataValues
        });
      }
    });

    return Array.from(uniqueMembersMap.values());

  } catch (error) {
    console.error('Erreur lors de la récupération des participants :', error);
    return [];
  }
};

const getUserGoupConversation = async (userId) => {
  try {
    const participantRecords = await Participer.findAll({
      where: { id_user: userId },
      attributes: ['id_conversation']
    });

    const conversationIds = participantRecords.map(p => p.id_conversation);
    const conversationsGroup = await Conversations.findAll({
      attributes: allconstant.convesationAttribut,
      where: { id: conversationIds, type: "group" },
      include: [
        {
          model: Participer,
          as: 'members',
          attributes: ['role'],
          include: [
            {
              model: Users,
              as: 'participants',
              attributes: allconstant.Userattributes
            }
          ]
        }
      ]
    });

    // Formatage pour afficher proprement les membres
    const formatted = conversationsGroup.map(conversation => {
      const { members, ...otherData } = conversation.toJSON();
      const usersOnly = members.map(m => {
        return {
          ...m.participants,
          role: m.role
        };
      });
      JSON.parse(otherData.group_avatar);
      return {
        ...otherData,
        members: usersOnly
      };
    });

    console.log("groupe data", formatted);
    return formatted;

  } catch (error) {
    console.error('Erreur lors de la récupération des groupes d\'utilisateur :', error);
    return [];
  }
};
showOneConversation = async (conversation_id, user_id,transaction ) => {
  // console.warn("convesation user and convesation id ===>",conversation_id,user_id);
  try {
    let data = await Conversations.findByPk(
     parseInt(conversation_id), {
      attributes: allconstant.convesationAttribut,
      transaction: transaction 
    });
// console.warn("data con vsation show one ============>", data)
    if (!data) {
      console.log("message =No conversations found 3 ");
      return 
      // res.status(200).send({ message: "No conversations found 3", error: null, data: [] });
    }else{
      // console.log("message conversations found 3 ==================> ", data);

    }
    let firstUser = null;
    let secondUser = null;
    let condition = {
      [Op.and]:
        { conversation_id: data.id },
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
    } else if (data.second_user === user_id) {
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
      where: condition,
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
    const usersMember = await getUsersInConversation(data.id,"conversation",user_id);
    const groupeInitiate = await UserController.show(parseInt(data.user_id));
    // console.log("user member", usersMember);
    // console.log("data convesation goup avatar", data);
    // JSON.parse(data.dataValues.group_avatar);
    const enrichedConversations = {
      conversation: data,
      created_by: groupeInitiate,
      lastMessage: lastMessage ? lastMessage : null,
      messages: [],
      firstUser: firstUser ? firstUser : null,
      secondUser: secondUser ? secondUser : null,
      members: data.type === 'group' ? usersMember : [],
      unreadMessages: unreadMessagesCount
    };

    return enrichedConversations;
  } catch (error) {
    // res.status(400).send({ status: 500, message: "Error occurred", error: error.toString(), data: [] });
    return json({ message: "error", error: error.toString(), data: null });
  }
};
const  deletePermanently = async (req, res) => {
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
const  getSingleConversations = async (req, res) => {
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
const  updateConversations = async (req, res) => {
  if (!req.params.id) {
    res
      .status(400)
      .send({ message: "Error", error: "Aucun ID specifie", data: null });
    return;
  }

  try {


    let conversationdata =  await showOneConversation(req.params.id, req.body.user_id);
    if (conversationdata) {
      console.log("avatar data ========================> before",conversationdata.conversation.type );

      if (conversationdata.conversation.type === "group") {
        const usersInside = await Participer.findAll({ where: { id_conversation: conversationdata.conversation.id } });
        const isAdmn = await Participer.findOne({ where: { id_user: req.body.user_id } });
        // console.log("groupe is admin for updating ------------------>",isAdmn);
        if (isAdmn.role === "admin") {
          let result = await Conversations.update(req.body, { where: { id: req.params.id } });
          if (result) {
            let conversation =  await showOneConversation(req.params.id, req.body.user_id);
            // console.log("avatar data ========================> after",conversation.conversation.group_avatar);
            conversation.conversation.group_avatar = JSON.parse(conversation.conversation.group_avatar );
            if (usersInside) {
              usersInside.map((user) => {
                const usersSocket = getUserSocketId(user.id_user);
                if (usersSocket) {
                  getIo().to(usersSocket).emit("updating_conversation", {
                    data: conversation,
                    error: null,
                    message: "Success",
                    dataUpdated: Object.keys(req.body)
                  });
                }
              });
            }
            res.status(200).send({ message: "Success", error: null, data: conversation });
            return;
          } else {
            const userSocket = getUserSocketId(req.body.user_id);
            if (userSocket) {
              getIo().to(userSocket).emit("updating_conversation", {
                data: null,
                error: "Error",
                message: "update failled"
              });
            };

            res.status(400).send({ message: "update failled", error: "Error", data: null });
            return;
          }
        }
        else {
          const userSocket = getUserSocketId(isAdmn.id);
          if (userSocket) {
            getIo().to(userSocket).emit("updating_conversation", {
              data: null,
              error: "Error",
              message: "seul l'administrateur a le droit de modifier les information du goupe"
            });
          };

          res.status(400).send({ message: "seul l'administrateur a le droit de modifier les information du goupe", error: "Error", data: null });
          return;
        }
      } else {
          const userSocket = getUserSocketId(req.body.user_id);
          if (userSocket) {
            getIo().to(userSocket).emit("updating_conversation", {
              data: null,
              error: "Error",
              message: "this type of conversation should  not be updated"
            });
          };

          res.status(400).send({ message: "this type of conversation should  not be updated", error: "Error", data: null });
          return;
        
      }
    }
    else {
      const userSocket = getUserSocketId(req.body.user_id);
      if (userSocket) {
        getIo().to(userSocket).emit("updating_conversation", {
          data: null,
          error: "Error",
          message: "no group found"
        });
      };

      res.status(400).send({ message: "no group found", error: "Error", data: null });
      return;
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error", error: error.toString(), data: null });
  }
};
const  getConversationMedias = async (req, res) => {
  if (!req.body.conversation) {
    res
      .status(400)
      .send({ message: "Error", error: "some data required", data: null });
    return;
  }
  try {

    const conversation = await Conversations.findByPk(parseInt(req.body.conversation));

    if (conversation) {
      const messagesCondition = {
        [Op.or]: [
          {
            senderId: conversation.first_user,
            receiverId: conversation.second_user
          },
          {
            senderId: conversation.second_user,
            receiverId: conversation.first_user,
          }
        ],
        status: { [Op.ne]: 'deleted' },
        medias: { [Op.ne]: {} }
      };
      const messages = await Messages.findAll({ where: messagesCondition });
      if (messages) {
        let messageMap = await Promise.all(
          messages.map(async (message) => {
            return JSON.parse(message.medias);
          })
        );
        let files = messageMap.filter(
          m => m.category === 'docs');

        let medias = messageMap.filter(m => m.category === 'medias');
        ;
        const result = {
          mediasData: medias,
          docsData: files
        }
        res
          .status(200)
          .send({ message: "Success", error: null, data: result });
        return;
      } else {
        res
          .status(200)
          .send({ message: "Error", error: "no message found", data: null });
        return;
      }
    } else {
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
let GroupExist = async (conversationId) => {
  try {
    const conversation = await Conversations.findByPk(conversationId);
    if (conversation) {
      return {
        data: conversation,
        status: true,
        error: null
      }
    }
    else {
      return {
        data: null,
        status: false,
        error: "error while getting convrsation"
      }
    }
  } catch (error) {
    return {
      data: null,
      status: false,
      error: error.toString()
    }
  }
};
const  ConversationOnExist = async (conversationId) => {
  try {
    const conversation = Conversations.findByPk(conversationId);
    if (conversation) {
      return {
        data: conversation,
        status: true,
        error: null
      }
    }
    else {
      return {
        data: null,
        status: false,
        error: "error while getting convrsation"
      }
    }
  } catch (error) {
    return {
      data: null,
      status: false,
      error: error.toString()
    }
  }
};
const  conversationExist = async (element) => {
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
const createGroup = async (req, res) => {
  const { members, user_id, type, group_avatar, ...conversationData } = req.body;

  if (!members || !Array.isArray(members) || members.length === 0 || !user_id || !type) {
    return res.status(400).send({
      message: "Error",
      error: "Missing required fields",
      data: null,
    });
  }

  const transaction = await connection.transaction();
  const UsersIs = [];
  let dataInResponse = [];

  try {
    const conversation = await Conversations.create(req.body, { transaction });

    if (!conversation) {
      await transaction.rollback();
      return res.status(500).send({
        message: "Error",
        error: "Failed to create conversation",
        data: null,
      });
    }

    for (let index = 0; index < members.length; index++) {
      const user = members[index];
      const userfound = await UserController.userExists({ id: user.id });

      if (!userfound) {
        await transaction.rollback();
        return res.status(404).send({
          message: "Error",
          error: `User with ID ${user.id} not found`,
          data: null,
        });
      }

      UsersIs.push(user.id);

      const groupData = {
        id_user: user.id,
        id_conversation: conversation.id,
        role: user.id === user_id ? "admin" : "writter",
        status: user.status
      };

      await Participer.findOrCreate({
        where: {
          id_user: user.id,
          id_conversation: conversation.id
        },
        defaults: groupData,
        transaction
      });
    }
    const conversationFormat1 = await showOneConversation(conversation.id, user_id, transaction);

    if (conversationFormat1) {
      try {
        conversationFormat1.conversation.group_avatar = JSON.parse(conversationFormat1.conversation.group_avatar);
      } catch (e) {
        console.warn("Erreur lors du parse du group_avatar :", e.message);
      }
      dataInResponse.push(conversationFormat1);
    }

    // OU ✅ OPTION 2 : Commit d'abord, puis appeler sans transaction
    // await transaction.commit();
    // const conversationFormat2 = await showOneConversation(conversation.id, user_id);
    // if (conversationFormat2) {
    //   dataInResponse.push(conversationFormat2);
    // }

    // OU ✅ OPTION 3 : Construction manuelle simplifiée (exemple de fallback minimal)
    // dataInResponse.push({
    //   conversation,
    //   created_by: await UserController.show(user_id),
    //   members: members.map(m => ({ ...m, id_conversation: conversation.id })),
    //   lastMessage: null,
    //   unreadMessages: 0,
    // });

  await Promise.all(UsersIs.map( async (id) => {
      const socketId = getUserSocketId(id);
      if (socketId) {
        console.log("user to alert whith socket ===============> i"+id, socketId);
        getIo().to(socketId).emit("new_conversation", {
          conversation: dataInResponse[0],
        });
      }else{

        console.log("user to alert whith socket ===============> i"+id, socketId);
      }
    }));

    
    res.status(200).send({
      message: "Success",
      error: null,
      data: dataInResponse[0],
    });
    
    await transaction.commit(); 
  } catch (error) {
    await transaction.rollback();
    console.error("Erreur lors de la création du groupe :", error);
    return res.status(500).send({
      message: "Error",
      error: error.message || "Internal Server Error",
      data: null,
    });
  }
};
const  updatedParticipantGroup = async (req, res) => {
  if (!req.body) 
  {
    res.status(500).send({ message: "Error", error: "some data are required", data: null });
    return ;
  }
  if (!req.body.members || req.body.members.length === 0) {
    res.status(500).send({ message: "Error", error: "members to update required", data: null });
    return ;
  }
  if (!req.body.conversation_id) {
    res.status(500).send({ message: "Error", error: "conversation must be provided", data: null });
    return ;
  }
  try 
  {
    const conversationExist = await GroupExist(req.body.conversation_id);

    if (!conversationExist.status) {
      res.status(400).send({ message: "Error", error: conversationExist.error.toString(), data: null });
      return ;
    };
    let membresData = [];
    const updates =  await Promise.all( req.body.members.map(async (member) => {
      let condition = {
        [Op.and]: [
          { id_conversation: req.body.conversation_id },
          { id_user: member }
        ],
        status: { [Op.ne]: 'desable' }
      };

      let participant = await Participer.update(req.body,{ where: condition });
      if (participant) {
       let userUpdated  = await getUsersInConversation(req.body.conversation_id,"user",member);
       if (userUpdated) {
        membresData.push(userUpdated);
       }
        return participant
      }else{
        return participant
      }
    }));

    if(updates){
      const userConcerned = await UserController.show(req.body.user_id);
    const result = await showOneConversation(req.body.conversation_id, req.body.user_id, "group");
    let requestObjetct = Object.keys(req.body);
    let motif = "";
    // console.log("user found in conversations",result);
    if (result) {
      if ( requestObjetct.includes("role") ) {
        motif = " changé des rôles";
      }else if (requestObjetct.includes("status")){
        motif = "Supprimer  du groupe";
      }else{
        motif = "modifier";
      }
      result.members.map((member) => {
        const socketId = getUserSocketId(member.id);
        if (socketId) {
          getIo().to(socketId).emit("change_paticipant_infos", {
            data: membresData,
            message: `L'utilisateur ${userConcerned.user_name} a été${motif}`
          });
        }
      });
      
      res.status(200).send({ message: "Success", error: null, data: membresData });
      return;
    } else {
      res.status(400).send({ message: "Error", error: "Problem when loading data 1", data: null });
      return 
    }
    }else{
      res.status(400).send({ message: "Error", error: "Problem when updating data 2", data: null });
      return 
    }
  } 
  catch (error) {
    res.status(400).send({ message: "Error", error: error.toString(), data: null });
    return 
  }
};
const  setNewMember = async (req,res)=>{

  if (!req.body.members) {
    res.status(400).send({message:"Error", error: "data is required", data:null});
    return;
  };
  if (!req.body.conversation_id) {
    res.status(400).send({message:"Error", error: "no conversation in target", data:null});
    return;
  }

  try {

    let usersId = [];
    let members = req.body.members;
    let isUsSeted = false;
    for (const member of members) 
    {
      let userExist  = await  UserController.userExists({id:member.id});
      if (userExist) {
        let user = await UserController.show(member.id);
        if (user) {
          usersId.push(user.id);
          let data = {
            id_user : member.id,
            id_conversation : req.body.conversation_id,
            role : member.role
          }
          const addParticipant = await Participer.create(data);
          if (addParticipant) {
            isUsSeted = true;
          }else{
            isUsSeted =false
          }
        }
        
      } else {
        isUsSeted =false
        
      }
    }
    if (isUsSeted) {
      const  conversation = await showOneConversation(req.body.conversation_id,req.body.user_id);
      if (conversation) {
        conversation.conversation.group_avatar = JSON.parse( conversation.conversation.group_avatar );
        usersId.map(async (u)=>{
          const userInfos = await UserController.show(u);
          if (userInfos) {
            if (userInfos.id === req.body.user_id) {
              
              const userSocket = getUserSocketId(req.body.user_id);
              if (userSocket) {
                getIo().to(userSocket).emit("new_user_added",{
                  conversation: conversation,
                  message:"Success",
                  error: "null",
                  tips:"vous avez ajouté "+userInfos.user_name
                })
              }
            }
            else
            {
              const userSocket = getUserSocketId(userInfos.id);
              if (userSocket) 
              {
                getIo().to(userSocket).emit("new_user_added",{
                  conversation: conversation,
                  message:"Success",
                  error: "null",
                  tips:"l\'utilisateur"+userInfos.user_name+"a été ajouter dans le groupe"
                })
              }
            }
            
          }
        });
        res.status(200).send({message:"Success",error:null, data:conversation });
        return;
      } 
    }
    else{
      res.status(200).send({message:"Error",error:"there is an error", data:null });
      return;
    }
  } catch (error) {
    res.status(200).send({message:"Error",error:error.toString(), data:null });
    return;
  }
};
const  whithdrawMember = async (req,res)=>{
  if (!req.body.members) {
    res
    .status(500)
    .send({ message: "Error", error: "some data required", data: null });
  return;
  }
  if (!req.body.conversation_id) 
  {
    res
    .status(500)
    .send({ message: "Error", error: "convrsation data is required", data: null });
    return;
  };

  try {
    
  } catch (error) {
    res
    .status(500)
    .send({ message: "Error", error: error.toString(), data: null });
    res.status(500).send({message:"Error", error:error.toString(),data:null});
  return;
  }
}


module.exports = {
  messages,
create,
getData,
showOne,
getUsersInConversation,
getUserGoupConversation,
showOneConversation,
deletePermanently,
getSingleConversations,
updateConversations,
getConversationMedias,
GroupExist,
ConversationOnExist,
conversationExist,
createGroup,
updatedParticipantGroup,
setNewMember,
whithdrawMember
};
