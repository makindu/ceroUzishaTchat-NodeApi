'use strict';

const { enterprises } = require('../db.provider');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('messages','status',{
        type: Sequelize.STRING,
        defaultValue: "unread",
        allowNull: false 
     
    });
await queryInterface.addColumn ('messages','enterprise_id',
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
await queryInterface.addColumn ('messages','read_at',
   {
    type: Sequelize.DATE,
    allowNull: true,   
  },
)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('enterprise_id');
    await queryInterface.removeColumn('read_at');

  }
};
