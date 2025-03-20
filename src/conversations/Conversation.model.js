const Sequelize = require("sequelize");
const Users = require('../users/user.model');
const Enterprises = require('../Enterprises/Enterprises.model');
const { Timestamp } = require("mongodb");

module.exports = (sequelize) => {
  let Conversations = sequelize.define("conversations", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_user: {
      type: Sequelize.BIGINT(20).UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',  // Nom de la table 'users'
        key: 'id',
      },
      onDelete: 'CASCADE',   
      onUpdate: 'CASCADE',   
    },
    second_user: {
      type: Sequelize.BIGINT(20).UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',  // Nom de la table 'users'
        key: 'id',
      },
      onDelete: 'CASCADE',   
      onUpdate: 'CASCADE',   
    },
    enterprise_id: {
      type: Sequelize.BIGINT(20).UNSIGNED,
      allowNull: false,
      references: {
        model: Enterprises,  
        key: 'id',
      },
      onDelete: 'CASCADE',   
      onUpdate: 'CASCADE',   
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "activated"
    },
  },
  {
    timestamps: true,  
  });

  // Définir les associations après la création du modèle
  Conversations.associate = (models) => {
    Conversations.belongsTo(models.Users, {
      foreignKey: 'first_user',
      as: 'firstUser'
    });

    Conversations.belongsTo(models.Users, {
      foreignKey: 'second_user',
      as: 'secondUser'
    });

    Conversations.belongsTo(models.Enterprises, {
      foreignKey: 'enterprise_id',
      as: 'enterprise'
    });
  };

  return Conversations;
};
