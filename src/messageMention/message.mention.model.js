// const Sequelize = require('sequelize');
const messages =  require ('../messages/Messages.model');
const Users =   require('../users/user.model');
// // const  {messages,Users}  = require('../../db.provider'); // Vérifie bien que "messages" est en minuscule
// // const  Users  = require('../../db.provider'); // Vérifie bien que "messages" est en minuscule

// module.exports = (sequelize) => {
// const MessageMention = sequelize.define('MessageMention', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     message_id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//             model: messages,
//             key: 'id'
//         }
//     },
//     mentioned_user_id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//             model: Users,
//             key: 'id'
//         }
//     }
// }, {
//     tableName: 'message_mentions',
//     timestamps: false
// });
//  return MessageMention;
// };
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
const MessageMention = sequelize.define('MessageMention', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: messages,  // Référence correcte
            key: 'id'
        }
    },
    mentioned_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Users,  // Référence correcte
            key: 'id'
        }
    }
}, {
    tableName: 'message_mentions',
    timestamps: false
});

 return MessageMention;
};

