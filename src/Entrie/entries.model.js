// const Sequelize = require('sequelize');
const Money =  require ('../Money/money.model');
const  Enterprises  = require('../Enterprises/Enterprises.model');
const Users =   require('../users/user.model');
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const  Entries = sequelize.define('other_entries', {
    id: {
      type: Sequelize.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    pos_id: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
    },
    user_id: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
      refrences:{
        model:Users,
        key:'id'
      }
    },
    money_id: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
      refrences:{
        model:Money,
        key:'id'
      }
    },
    amount: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
    origin: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    motif: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    account_id: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
    },
    is_validate: {
      type: Sequelize.TINYINT(1),
      defaultValue: false,
    },
    uuid: {
      type: Sequelize.STRING(255),
      allowNull:true
    },
    sync_status: {
      type: Sequelize.TINYINT(1),
      allowNull:true
    },
    enterprise_id: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
      refrences:{
        model:Enterprises,
        key:'id'
      }
    },
    done_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    beneficiary: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  }, {
    tableName: 'other_entries', 
    timestamps: false, 
  });

  
  // Retourner le modèle
  return  Entries;
};
