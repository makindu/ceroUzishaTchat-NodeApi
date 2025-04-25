const { Sequelize } = require("sequelize");
const DBConfig = require("./db_config");

const sequelize = new Sequelize(
  DBConfig.database_name,
  DBConfig.database_username,
  DBConfig.database_password,
  {
    host: DBConfig.host,
    dialect: DBConfig.dialect,
    logging: console.log,
  }
);

// Importer les modèles
const Users = require("./src/users/user.model")(sequelize);
const messages = require('./src/messages/Messages.model')(sequelize);
const Enterprises = require("./src/Enterprises/Enterprises.model")(sequelize);
const Conversations = require("./src/conversations/Conversation.model")(sequelize);
const messageMention = require("./src/messageMention/message.mention.model")(sequelize);
const messageReference = require("./src/MessageReference/Message.reference.model")(sequelize);
const usersenterprises = require("./src/userEnterpise/user.entgerprise.model")(sequelize);
const customer = require("./src/customer/customer.model")(sequelize);
const Invoice = require("./src/invoices/invoices.model")(sequelize);
const Expenditures = require("./src/expenditures/expenditures.model")(sequelize);
const Debts = require("./src/Debt/debt.model")(sequelize);
const Payments = require("./src/Payment/Payment.model")(sequelize);
const Stocks = require("./src/Stock/stock.model")(sequelize);
const Money =  require("./src/Money/money.model")(sequelize);
const Tubs = require("./src/Tubs/tubs.model")(sequelize);
const Entries = require('./src/Entrie/entries.model')(sequelize);
const RequestHistory = require('./src/RequestHistory/requestHistory.model')(sequelize);
const Libraries = require('./src/libraries/libraries.model')(sequelize);
const Participer =  require('./src/conversations/participer.model')(sequelize);
const Token =  require('./middlewares/token.model')(sequelize);
// Définir les relations
Users.hasMany(messages, { foreignKey: "senderId", as: "sentMessages" });
Users.hasMany(messages, { foreignKey: "receiverId", as: "receivedMessages" });
messages.belongsTo(Users, { foreignKey: "senderId", as: "sender" });
messages.belongsTo(Users, { foreignKey: "receiverId", as: "receiver" });
messages.belongsTo(messages, { as: "responseFrom", foreignKey: "ResponseId" });
Users.hasMany(usersenterprises, { foreignKey: "user_id", as: "userEnterprises" });
usersenterprises.belongsTo(Users, { foreignKey: "user_id", as: "user" });
messages.hasMany(messageReference, { as: 'references', foreignKey: 'message_id' });
messages.hasMany(messageMention, { as: 'mentions', foreignKey: 'message_id' });
messageMention.belongsTo(Users, {foreignKey: 'mentioned_user_id',as: 'username'});
messageMention.belongsTo(messages, { as: 'message', foreignKey: 'message_id' });
messageReference.belongsTo(messages, { as: 'message', foreignKey: 'message_id' });
Enterprises.hasMany(usersenterprises, { foreignKey: "enterprise_id", as: "enterpriseUsers" });
usersenterprises.belongsTo(Enterprises, { foreignKey: "enterprise_id", as: "enterprise" });
Participer.belongsTo(Users, {foreignKey : "id_user", as :"participants" });
Conversations.hasMany(Participer,{foreignKey: "id_conversation" , as :"members"});
customer.belongsTo(Enterprises, { foreignKey: 'enterprise_id' });
Participer.belongsTo(Conversations, {foreignKey: 'id_conversation'});
Users.hasMany(Participer, { foreignKey: "id_user", as: "participations" });



// Relations / associations
Expenditures.belongsTo( Users, { foreignKey: 'user_id' });
Expenditures.belongsTo( Enterprises, { foreignKey: 'enterprise_id' });




// Exporter l'objet de connexion et les modèles
module.exports = {
  connection: sequelize,
  Users,
  messages,
  Enterprises,
  Conversations,
  messageMention,
  messageReference,
  usersenterprises,
  customer,
Invoice,
Expenditures,
Debts,
Payments,
Stocks,
Money,
 Tubs,
 Entries,
 RequestHistory,
 Libraries,
 Participer,
 Token

};
