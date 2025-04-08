const Sequelize = require("sequelize");
const Users = require('../users/user.model');
const Enterprises = require('../Enterprises/Enterprises.model');
module.exports = (sequelize) => {
  const usersenterprises = sequelize.define("usersenterprises", {
    id:{
      type: Sequelize.BIGINT(20).UNSIGNED,
      primaryKey: true,
      autoIncrement:true,
    },
    user_id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
            allowNull: false,
            references: {
                model: Users,
                key: 'id'
            }
        },
        enterprise_id: {
            type: Sequelize.BIGINT(20).UNSIGNED,

                allowNull: false,
                references: {
                    model: Enterprises,
                    key: 'id'
                }
            }
  },
  { timestamps: false}
);
  // Users.belongsTo(Messages, { foreignKey: 'receiverId', as: 'receiver' });

  return usersenterprises;
};

