// const Sequelize = require('sequelize');
// const messages =  require ('../messages/Messages.model');
const { Enterprises } = require('../../db.provider');
const Users =   require('../users/user.model');
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const Expenditures = sequelize.define('expenditures', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references : {
        model: Users,
        key: 'id'
      }
    },
    money_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    ticket_office_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    motif: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    account_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    is_validate: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    uuid: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    sync_status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    enterprise_id: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
      references : {
        model: Enterprises,
        key: 'id'
      }
    },
    done_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    beneficiary: {
      type: Sequelize.STRING,
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
  }, {
    tableName: 'expenditures', // Nom de la table
    timestamps: false, // Désactive les timestamps par défaut (createdAt, updatedAt)
  });

  
  // Retourner le modèle
  return Expenditures;
};
