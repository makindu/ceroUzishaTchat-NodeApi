const Sequelize = require("sequelize");
const DBConfig = require("./db_config");

const sequelize = new Sequelize(
  DBConfig.database_name,
  DBConfig.database_username,
  DBConfig.database_password,
  {
    host: DBConfig.host,
    dialect: DBConfig.dialect,
  }
);

let database = {};

database.connection = sequelize;
database.Users = require("./src/users/user.model")(sequelize);
database.messages = require("./src/messages/Messages.model")(sequelize);
database.Conversations = require("./src/conversations/Conversation.model")(sequelize);
database.enterprises =  require('./src/Enterprises/Enterprises.model')(sequelize);
database.libraries =  require('./src/libraries/libraries.model')(sequelize);
module.exports = database;
