const Sequelize = require("sequelize");
const Users = require('../users/user.model');
const Enterprises = require('../Enterprises/Enterprises.model');
const Conversations =  require('../conversations/Conversation.model');
// const userModel = require("../users/user.model");


module.exports = (sequelize) => {
  const Messages = sequelize.define("messages", {

    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: Sequelize.TEXT,  // Si c'est un texte
      allowNull: true,
    },
    medias: {
      type: Sequelize.JSON(),
      allowNull: true,
    },
    senderId: {
      type: Sequelize.BIGINT(20),
      references: {
        model: Users,
        key: 'id',
      }
    },
    receiverId: {
      type: Sequelize.BIGINT(20),
      references: {
        model: Users,
        key: 'id',
      }
    },
    read_at:{
      type: Sequelize.DATE,
      allowNull:true,
    },
    enterprise_id: {
      type: Sequelize.BIGINT(20).UNSIGNED,
      references: {
        model: Enterprises,
        key: 'id',
      }
    },
    conversation_id: {
      type: Sequelize.BIGINT(20).UNSIGNED,
      references: {
        model: Conversations,
        key: 'id',
      }
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ResponseId:
      {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        references: {
          model: 'messages', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
     }
  }, {
    timestamps: true,  
  });

  // Messages.belongsTo(Messages, { as: 'responseFrom', foreignKey: 'ResponseId' });
  // Users.hasMany (Messages, { foreignKey: 'senderId', as: 'sender' });
  // Users.hasMany(Messages, { foreignKey: 'receiverId', as: 'receiver' });
  // Messages.belongsTo(Users, { foreignKey: 'senderId', as: 'sender' });

  return Messages;
};
