'use strict';

const { enterprises } = require('../db.provider');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
await queryInterface.addColumn ('conversations','enterprise_id',
   {
    type: Sequelize.BIGINT(20).UNSIGNED,
    allowNull: false,
    references: {
      model: 'enterprises',  
      key: 'id',
    },
    onDelete: 'CASCADE',   
    onUpdate: 'CASCADE',   
  },
)

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('enterprise_id');

  }
};
