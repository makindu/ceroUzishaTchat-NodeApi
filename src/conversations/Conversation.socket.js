const  Conversations  = require("../../db.provider").Conversations;
const  Messages  = require("../../db.provider").messages;
const  Users  = require("../../db.provider").Users;
const messageReference =  require("../../db.provider").messageReference;
const messageMention =  require("../../db.provider").messageMention;
const  Participer  = require("../../db.provider").Participer;
const { Op } = require("sequelize");
const allconstant = require("../constantes");
const UserController = require("../users/user.controller");
const ConversationsSocket = (socket) => {
  socket.on("test_conversations", (data) => {
    console.log(data);
    socket.emit("server_response", {
      message: "Your request was received" + data,
    });
  });
socket.on("get_all_conversations", async (element)=>{
  const userId = element.user_id;
  if (!userId) {
    console.error("❌ user_id manquant dans la requête");
    return;
  }
  const condition = {
    [Op.or]: [
      { first_user: userId },
      { second_user: userId },
    ],
    status: { [Op.ne]: 'deleted' },
  };
  try {
    console.log("my condition =========================>",condition);
    const groups = await getUserGoupConversation(userId);
    const data = await Conversations.findAll({
      where: condition,
      order: [['createdAt', 'ASC']],
      attributes: allconstant.convesationAttribut
    });
    console.log("data group when gttinh all ", groups);
    if (!data || !groups) {
      socket.emit("get_all_conversations",{ message: "No conversations found  1", error: null, data: [] });
      return;
      // return res.status(500).send({ message: "No conversations found  1", error: null, data: [] });
    }

    const enrichedconversations = await Promise.all(data.map(async (conversation) => {
      let firstUser = null;
      let secondUser = null;
      let id = parseInt(conversation.id);

      let conditionMessage = {
        [Op.and]: [
          { conversation_id: id },
          { status: { [Op.ne]: 'deleted' } }
        ]
      };

      // Récupératsocketn des utilisateurs
      if (conversation.first_user === userId) {
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

      // Récupératsocketn du dernier message avec vérificatsocketn
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
          receiverId: userId
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
          receiverId: userId
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
          descriptsocketn: group.descriptsocketn || null,
          user_id: group.user_id,
          first_user: null,
          second_user: null,
        },
        created_by: createdBy,
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


    const allconversations = [...enrichedconversations, ...formattedGroups];

    socket.emit("get_all_conversations",{
      status: 200,
      message: "Success",
      error: null,
      data: allconversations
    });
  } catch (error) {
    socket.emit("get_all_conversations",{ status: 500, message: "Error occurred", error: error.toString(), data: [] });
  }
});
socket.on("creating_conversations", async (data) => {
    if (!userId && !data.enterprise_id ) {
      socket.emit("message_creatsocketn_error", { data: "data user or enterprise is required" });
      return;
    }
    const conversationsData = {
      content: data.content,
      medias: data.medias,
      senderId: data.senderId,
      receiverId: data.receiverId,
    };
    try {
      const result = await conversations.create(conversationsData);
      socket.broadcast.emit("message_sent", { data: result });
    } catch (error) {
      console.log(error.toString());
      socket.emit("message_error_sending", { data: error });
    }
  });
};
let getUserGoupConversation = async (userId) => {
  try {
    // console.log("param in data group ==============>",userId);
    const participantRecords = await Participer.findAll({
      where: { id_user: userId},
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
              as: 'username', // correspond à messageMention.belongsTo(Users, { as: 'mentionedUser', ... })
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
          as: 'responseFrom', 
          include:[
            {
              model: Users,
              as: 'sender', 
              attributes : allconstant.Userattributes,
            },
          ]
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

module.exports = ConversationsSocket;
