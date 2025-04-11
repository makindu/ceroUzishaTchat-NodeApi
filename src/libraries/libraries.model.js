const Sequelize = require("sequelize");
const Users = require('../users/user.model');
const Enterprises = require('../Enterprises/Enterprises.model');

module.exports = (sequelize) => {
  const Libraries = sequelize.define("libraries", {

    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    	name:{
        type : Sequelize.STRING,
        allownull: false
      },	
	description	:{
    type:Sequelize.STRING,
    allownull:true
  },
  	done_at:{
      type: Sequelize.DATE,
      allownull:true
    },
    size	:{
      type: Sequelize.DOUBLE,
      allownull: true
    },	
    	uuid: {
        type: Sequelize.TEXT,
        allownull: false
      },	
      type	:{
        type: Sequelize.STRING,
        allownull: true
      }	,
      path	:{
        type: Sequelize.TEXT,
        allownull: true
      },
      extension	:{
        type: Sequelize.TEXT,
        allownull: true
      } ,
      visibility	: {
        type:Sequelize.TEXT,
        allownull: true
      },
      	enterprise_id :{
          type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: true,
        references: {
          model: Enterprises,  
          key: 'id',
        },
        },
        user_id :{
          type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: true,
        references: {
          model: Users,  
          key: 'id',
        },
        },
         created_at: {
              type: Sequelize.DATE,
              defaultValue: Sequelize.NOW,
              allowNull: false,
            },
                updated_at: {
                  type: Sequelize.DATE,
                  defaultValue: Sequelize.NOW,
                  allowNull: false,
                },
            }, {
    tableName : 'libraries',
    timestamps: false,  // Cela activera automatiquement `createdAt` et `updatedAt`
  });
  return Libraries;
};
