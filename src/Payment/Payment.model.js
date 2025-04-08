// const Sequelize = require('sequelize');
// const messages =  require ('../messages/Messages.model');
// const { Enterprises } = require('../../db.provider');
// const Users =   require('../users/user.model');
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const  Payments = sequelize.define('debt_payments', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    done_by_id: {
      type: Sequelize.INTEGER,
      allowNull: false,  // L'ID de l'utilisateur qui a effectué le paiement
    },
    debt_id: {
      type: Sequelize.INTEGER,
      allowNull: false,  // Référence à la dette liée à ce paiement
    },
    amount_payed: {
      type: Sequelize.FLOAT,  // Montant payé
      allowNull: false,
    },
    uuid: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,  // UUID unique pour chaque paiement
    },
    sync_status: {
      type: Sequelize.INTEGER,
      defaultValue: '0',  // Par exemple : "pending", "completed", "failed"
      allowNull: false,
    },
    done_at: {
      type: Sequelize.DATE,
      allowNull: true,  // Date de paiement
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
    tableName: 'debt_payments', 
    timestamps: false, 
  });

  
  // Retourner le modèle
  return  Payments;
};
