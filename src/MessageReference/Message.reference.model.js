const Sequelize = require("sequelize");
const  messages = require('../messages/Messages.model'); // Vérifie bien que "messages" est en minuscule
module.exports = (sequelize) => {
    const MessageReference = sequelize.define('MessageReference', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        message_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: messages, // Utilisation correcte du modèle
                key: 'id'
            }
        },
        reference_type: {
            type: Sequelize.ENUM('Invoice', 'Expenditures', 'Debts', 'Payments', 'Stocks', 'customer', 'Tubs','Entries'),
            allowNull: false
        },
        reference_code: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        reference_label: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        reference_uuid: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
    }, {
        tableName: 'message_references',
        timestamps: true
    });

    return MessageReference;
};
