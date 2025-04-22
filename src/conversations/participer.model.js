const Sequelize = require("sequelize");
const Users = require('../users/user.model');
const Conversations = require('./Conversation.model');

module.exports = (sequelize) => {
  let Participer = sequelize.define("participer", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: Sequelize.BIGINT(20).UNSIGNED,
      allowNull: true,
      references: {
        model: Users,  // Nom de la table 'users'
        key: 'id',
      },   
      onUpdate: 'CASCADE',   
    },
    id_conversation : {
      type: Sequelize.BIGINT(20).UNSIGNED,
      allowNull: true,
      references: {
        model: Conversations,  // Nom de la table 'users'
        key: 'id',
      },  
      onUpdate: 'CASCADE',   
    },
    role : {
      type: Sequelize.STRING(20),
      allowNull: false, 
      defaultValue : 'writter',  
    },
    status : {
      type: Sequelize.STRING(20),
      defaultValue: "activatd",
      allowNull: false, 
    },
  created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
    
    
  }, {
    tableName: 'participer',
    timestamps: false,
  });
  // Participer.associate = (models) => {
    // Participer.belongsTo(models.Users, {
    //   foreignKey: 'id_user',
    //   as: 'participants'
    // });
    // Participer.belongsTo(models.Conversations, {
    //   foreignKey: 'id_conversation'
    // });
  // };

  return Participer;
};
