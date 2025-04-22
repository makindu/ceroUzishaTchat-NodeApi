const Sequelize = require("sequelize");
const Users = require('../users/user.model');
const Enterprises = require('../Enterprises/Enterprises.model');
const Conversations = require('../conversations/Conversation.model');

module.exports = (sequelize) => {
  const Messages = sequelize.define("messages", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: Sequelize.TEXT,
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
    read_at: {
      type: Sequelize.DATE,
      allowNull: true,
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
    members_read_it: {
      type: Sequelize.JSON(),
      allowNull: true,
    },
    ResponseId: {
      type: Sequelize.BIGINT(20),
      allowNull: true,
      references: {
        model: 'messages', 
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    forwarded: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  }, {
    timestamps: true,
  });

  return Messages;
};
