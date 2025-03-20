'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: Sequelize.TEXT,  // Si c'est un texte au lieu d'un tableau
        allowNull: true,
      },
      medias: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      senderId: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',  // Nom de la table 'users'
          key: 'id',
        },
        onDelete: 'CASCADE',   
        onUpdate: 'CASCADE',   
      },
      receiverId: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',  
          key: 'id',
        },
        onDelete: 'CASCADE',   
        onUpdate: 'CASCADE',   
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, 
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,  // Valeur par défaut de la date actuelle
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  }
};
