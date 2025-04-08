// const Sequelize = require('sequelize');
// const messages =  require ('../messages/Messages.model');
// const { Enterprises } = require('../../db.provider');
const Users =   require('../users/user.model');
const Enterprises = require('../Enterprises/Enterprises.model');
const Money =  require('../Money/money.model');
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const  Tubs = sequelize.define('funds', {
    id: {
      type: Sequelize.BIGINT(20),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    sold: {
      type: Sequelize.DOUBLE,
      allowNull: false,  // Montant total du fonds
    },
    description: {
      type: Sequelize.STRING(255),
      allowNull: true,  // Description du fonds
    },
    money_id: {
      type: Sequelize.BIGINT(20),
      allowNull: false,  
      references:
        {
            model: Money,
            key:'id'
        }
      
    },
    user_id: {
      type: Sequelize.BIGINT(20),
      allowNull: false,  
      references:
        {
        model: Users,
        key:'id'
      }
      
    },
    enterprise_id: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
      references:{
        model: Enterprises,
        key:'id'
      }
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,  // Date de création
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,  // Date de mise à jour
    },
    principal: {
      type: Sequelize.INTEGER(11),
      allowNull: false,  // Montant principal du fonds
    },
    type: {
      type: Sequelize.TEXT,
      allowNull: false,  // Type du fonds (ex: 'initial', 'investment', 'loan', etc.)
    },
    fund_status: {
      type: Sequelize.TEXT,  
      allowNull: false,
    },
  }, {
    tableName: 'funds', 
    timestamps: false, 
  });

  
  // Retourner le modèle
  return  Tubs;
};
