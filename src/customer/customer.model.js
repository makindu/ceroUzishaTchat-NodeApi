// const Sequelize = require('sequelize');
// const messages =  require ('../messages/Messages.model');
// const Users =   require('../users/user.model');
const Sequelize = require('sequelize');


module.exports = (sequelize) => {
  const customer = sequelize.define('customer_controllers', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pos_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    created_by_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    customerName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    marital_status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    other_contact: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    adress: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    mail: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    employer: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    uuid: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    sex: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    enterprise_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    done_at: {
      type: Sequelize.DATE,
      allowNull: true,
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
    totalpoints: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    totalbonus: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    totalcautions: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    sync_status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    member_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'customer_controllers', 
    timestamps: false, // Désactive les timestamps par défaut (createdAt, updatedAt)
  });



  return customer;
};