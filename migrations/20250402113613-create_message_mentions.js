'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('message_mentions', {
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
      mentioned_user_id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('message_mentions');
  }
};
