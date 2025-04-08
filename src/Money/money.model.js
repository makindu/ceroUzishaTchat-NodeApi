// const Sequelize = require('sequelize');
// const messages =  require ('../messages/Messages.model');
// const { Enterprises } = require('../../db.provider');
// const Users =   require('../users/user.model');
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const  Money = sequelize.define('moneys', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    abreviation: {
      type: Sequelize.STRING(10),
      allowNull: false,  // Abréviation de la monnaie (ex : 'USD', 'EUR', etc.)
    },
    principal: {
      type: Sequelize.FLOAT,
      allowNull: false,  // Montant principal associé à la monnaie
    },
    money_name: {
      type: Sequelize.STRING(100),
      allowNull: false,  // Nom de la monnaie (ex : 'Dollar', 'Euro', etc.)
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,  // Date de création de la monnaie
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,  // Date de mise à jour de la monnaie
    },
    enterprise_id: {
      type: Sequelize.INTEGER,
      allowNull: false,  // Référence à l'ID de l'entreprise
    },
  }, {
    tableName: 'moneys', 
    timestamps: false, 
  });

  
  // Retourner le modèle
  return  Money;
};
