// const Sequelize = require('sequelize');
// const messages =  require ('../messages/Messages.model');
// const { Enterprises } = require('../../db.provider');
const Enterprises =   require('../Enterprises/Enterprises.model');
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const  Stocks = sequelize.define('stock_history_controllers', {
    id: {
      type: Sequelize.BIGINT(20),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    depot_id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,  // ID du dépôt lié à ce stock
    },
    service_id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,  // ID du service associé au stock
    },
    user_id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,  // ID de l'utilisateur ayant effectué l'opération
    },
    provider_id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,  // ID du fournisseur
    },
    invoice_id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,  // Référence à la facture
    },
    quantity: {
      type: Sequelize.DOUBLE,
      allowNull: false,  // Quantité en stock
    },
    quantity_before: {
      type: Sequelize.DOUBLE,
      allowNull: false,  // Quantité avant une opération
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false,  // Prix unitaire
    },
    total: {
      type: Sequelize.FLOAT,
      allowNull: false,  // Total du stock
    },
    expiration_date: {
      type: Sequelize.DATE,
      allowNull: true,  // Date d'expiration
    },
    document_type: {
      type: Sequelize.INTEGER(11),
      allowNull: false,  // Type de document (ex: facture, bon de livraison, etc.)
    },
    document_name: {
      type: Sequelize.STRING(255),
      allowNull: true,  // Nom du document
    },
    document_number: {
      type: Sequelize.STRING(50),
      allowNull: true,  // Numéro du document
    },
    attachment: {
      type: Sequelize.STRING(255),
      allowNull: true,  // Attachement lié (ex: fichier PDF)
    },
    motif: {
      type: Sequelize.STRING(255),
      allowNull: true,  // Motif de l'opération
    },
    code_bar: {
      type: Sequelize.STRING(100),
      allowNull: true,  // Code barre du produit
    },
    note: {
      type: Sequelize.STRING(255),
      allowNull: true,  // Note sur le stock
    },
    type: {
      type: Sequelize.STRING(255),
      allowNull: false,  // Type de stock (ex: entrée, sortie, etc.)
    },
    type_approvement: {
      type: Sequelize.STRING(255),
      allowNull: true,  // Type d'approbation (ex: manuelle, automatique)
    },
    status: {
      type: Sequelize.STRING(255),
      defaultValue: 'pending',  // Statut de l'opération (par exemple : 'pending', 'completed', etc.)
      allowNull: false,
    },
    uuid: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    enterprise_id: {
      type: Sequelize.BIGINT(20),
      allowNull: false,  
      refernces :[
        {
          model: Enterprises,
          key:'id'
        }
      ]
    },
    done_at: {
      type: Sequelize.DATE,
      allowNull: true,  // Date de l'opération
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
    quantity_used: {
      type: Sequelize.TEXT,
      allowNull: true,  // Quantité utilisée
    },
    price_used: {
      type: Sequelize.TEXT,
      allowNull: true,  // Prix utilisé
    },
    operation_used: {
      type: Sequelize.TEXT,
      allowNull: true,  // Opération associée à l'utilisation du stock
    },
    date_operation: {
      type: Sequelize.DATE,
      allowNull: true,  // Date de l'opération associée
    },
    palette: {
      type: Sequelize.TEXT,
      allowNull:true  // Palette associée
    },
    profit: {
      type: Sequelize.DOUBLE,
      allowNull: true,  // Profit généré à partir de l'opération
    },
    method_used: {
      type: Sequelize.TEXT,
      allowNull: true,  // Méthode utilisée (ex: manuel, automatique)
    },
    sold: {
      type: Sequelize.DOUBLE,
      allowNull: true,  // Quantité vendue
    },
    requesthistory_id: {
      type: Sequelize.INTEGER(11),
      allowNull: true,  // Référence à l'historique des demandes
    },
  }, {
    tableName: 'stock_history_controllers', 
    timestamps: false, 
  });

  
  // Retourner le modèle
  return  Stocks;
};
