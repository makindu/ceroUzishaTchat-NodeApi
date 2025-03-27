const Sequelize = require("sequelize");
const Messages =  require("../../db.provider").messages;
module.exports = (sequelize) => {
  const Users = sequelize.define("users", {
    id:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement:true,
    },
    user_name : {
      type: Sequelize.TEXT,
      allowNull: false
    },
    full_name : {
      type: Sequelize.TEXT,
      allowNull: true
    },
    user_mail:{
      type: Sequelize.STRING,
      allowNull: true,
    },
    email_verified_at :{
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
      
    },

    user_phone :{
      type: Sequelize.STRING,
      allowNull: true
    },

    user_password :{
      type: Sequelize.STRING,
      allowNull: true
    },
    user_type : {
      type: Sequelize.STRING,
      allowNull: true
    },
    status:{
      type:Sequelize.STRING,
      allowNull: true
    },
    permissions:{
      type:Sequelize.STRING,
      allowNull:false
    },
    note:{
      type: Sequelize.STRING,
      allowNull: true
    },
    avatar :{
      type: Sequelize.STRING,
      allowNull:true
    },

    remember_token:{
      type: Sequelize.STRING,
      allowNull:true
    },
    uuid:{ 
      type:Sequelize.TEXT,
      allowNull:true
    },
    pin:{
      type:Sequelize.STRING,
      allowNull:true
    },
    collector:{
      type:Sequelize.TINYINT ,
      allowNull:false,
      default: 0
    },
    created_at:{
      type:Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }, 
    updated_at:
    {
      type:Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    
    
  });
  { timestamps: true}
  // Users.belongsTo(Messages, { foreignKey: 'receiverId', as: 'receiver' });

  return Users;
};