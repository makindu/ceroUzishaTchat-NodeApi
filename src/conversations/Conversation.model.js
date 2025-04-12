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
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "activated"
    },
    group_name:{
      type: Sequelize.TEXT,
      allowNull: false
    },
    description:{
      type:Sequelize.TEXT,
      allowNull:true
    },
    type:{
      type:Sequelize.STRING(20),
      allowNull:false,
      defaultValue: "dual"
    }
  },
  {
    timestamps: true,  
  });


  return Conversations;
};
