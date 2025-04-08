'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('message_references', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      message_id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        references: {
          model: 'messages',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      reference_type: {
        type: Sequelize.ENUM('invoice','expenditure','debt','payment','stock','customer','tub'),
        allowNull: false
      },
      
      reference_code: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('message_references');
  }
};
