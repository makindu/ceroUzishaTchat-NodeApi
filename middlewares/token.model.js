
const Sequelize = require("sequelize");

module.exports = (sequelize) => {
const Token = sequelize.define("personal_access_tokens", {
     id:{
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement:true,
        },
  tokenable_type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tokenable_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  token: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  abilities: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  last_used_at: {
    type: Sequelize.DATE,
    allowNull: true
  },
   created_at:{
        type:Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
      }, 
      updated_at:
      {
        type:Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
      },
}, {
  tableName: 'personal_access_tokens',
  timestamps: false
});
return Token;
}
