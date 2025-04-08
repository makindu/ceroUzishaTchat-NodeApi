// const Sequelize = require('sequelize');
// const messages =  require ('../messages/Messages.model');
// const { Enterprises } = require('../../db.provider');
const Users =   require('../users/user.model');
const Enterprises = require('../Enterprises/Enterprises.model');
const Stocks =  require('../Stock/stock.model');
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const  RequestHistory = sequelize.define('request_histories', {
    id: {
      type: Sequelize.BIGINT(20),
      primaryKey: true,
      autoIncrement: true,
    },
    amount: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    status: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    motif: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    request_id: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
    },
    invoice_id: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
    },
    fence_id: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
    },
    user_id: {
      type: Sequelize.BIGINT(20),
      allowNull: true,
      references:{
        model:Users,
        key: 'id'
      }
    },
    fund_id: {
      type: Sequelize.BIGINT(20),
      allowNull: true,
      references:{
        model: Stocks,
        key:'id'
      }
    },
    enterprise_id: {
      type: Sequelize.BIGINT(20),
      allowNull: true,
      references:{
        model:Enterprises,
        key:'id'
      }
    },
    sold: {
      type: Sequelize.DOUBLE,
      allowNull: true,
    },
    done_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    account_id: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
    },
    notebook_id: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
    },
    beneficiary: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    provenance: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    uuid: {
      type: Sequelize.TEXT,
      allowNull: false,
      unique: true
    },
  }, {
    tableName: 'request_histories', 
    timestamps: false, 
  });

  
  // Retourner le modèle
  return  RequestHistory;
};
