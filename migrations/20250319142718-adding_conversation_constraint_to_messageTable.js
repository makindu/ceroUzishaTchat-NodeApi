'use strict';

const { enterprises } = require('../db.provider');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
await queryInterface.addColumn ('messages','conversation_id',
   {
    type: Sequelize.INTEGER(10),
    allowNull: false,
    references: {
      model: 'conversations',  
      key: 'id',
    },
    onDelete: 'CASCADE',   
    onUpdate: 'CASCADE',   
  },
)

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('conversation_id');

  }
};
