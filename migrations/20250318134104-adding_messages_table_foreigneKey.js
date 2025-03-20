'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {

    senderId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',  // Nom de la table 'users'
        key: 'id',
      },
    },
    receiverId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',  // Nom de la table 'users'
        key: 'id',
      },
    },
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
