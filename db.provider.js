const { Sequelize } = require("sequelize");
const DBConfig = require("./db_config");

const sequelize = new Sequelize(
  DBConfig.database_name,
  DBConfig.database_username,
  DBConfig.database_password,
  {
    host: DBConfig.host,
    dialect: DBConfig.dialect,
    logging: false,
  }
);

// Importer les modèles
const Users = require("./src/users/user.model")(sequelize);
const messages = require("./src/messages/messages.model")(sequelize);
const Enterprises = require("./src/Enterprises/Enterprises.model")(sequelize);
const Conversations = require("./src/conversations/Conversation.model")(sequelize);

// Définir les relations
Users.hasMany(messages, { foreignKey: "senderId", as: "sentMessages" });
Users.hasMany(messages, { foreignKey: "receiverId", as: "receivedMessages" });
messages.belongsTo(Users, { foreignKey: "senderId", as: "sender" });
messages.belongsTo(Users, { foreignKey: "receiverId", as: "receiver" });
messages.belongsTo(messages, { as: "responseFrom", foreignKey: "ResponseId" });

// Exporter l'objet de connexion et les modèles
module.exports = {
  connection: sequelize,
  Users,
  messages,
  Enterprises,
  Conversations,
};
