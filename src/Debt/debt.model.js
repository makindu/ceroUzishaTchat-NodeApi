// const Sequelize = require('sequelize');
// const messages =  require ('../messages/Messages.model');
// const { Enterprises } = require('../../db.provider');
// const Users =   require('../users/user.model');
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const  Debts = sequelize.define('debts', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    created_by_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    customer_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    invoice_id: {
      type: Sequelize.INTEGER,
      allowNull: true, // Si un `invoice_id` est optionnel
    },
    status: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    amount: {
      type: Sequelize.FLOAT,  // Ou `DECIMAL` si tu préfères avoir des valeurs plus précises
      allowNull: false,
    },
    sold: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    maturity: {
      type: Sequelize.DATE,
      allowNull: true, // Le champ peut être nul si la maturité n'est pas encore définie
    },
    uuid: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,  // Assure l'unicité du UUID
    },
    sync_status: {
      type: Sequelize.STRING(20),
      defaultValue: 'pending',  // Par exemple : "pending", "completed", "failed"
      allowNull: false,
    },
    done_at: {
      type: Sequelize.DATE,
      allowNull: true, // Peut être nul si le paiement n'est pas encore effectué
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
    tableName: 'debts', 
    timestamps: false, 
  });

  return  Debts;
};
