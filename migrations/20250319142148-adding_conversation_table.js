'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_user: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',  // Nom de la table 'users'
          key: 'id',
        },
        onDelete: 'CASCADE',   
        onUpdate: 'CASCADE',   
      },
      second_user: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',  // Nom de la table 'users'
          key: 'id',
        },
        onDelete: 'CASCADE',   
        onUpdate: 'CASCADE',   
      },
      status:{
        type:Sequelize.STRING,
        allowNull:false,
        defaultValue:"activated"
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,  // Valeur par défaut de la date actuelle
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,  // Valeur par défaut de la date actuelle
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('conversations');
  }
};
