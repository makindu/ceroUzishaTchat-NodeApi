const { Timestamp } = require("mongodb");
const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const Enterprises = sequelize.define("enterprises", {
    id:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement:true
    },
    name: {
      type: Sequelize.STRING,
      allowNull:false
    },  	
		description	: {
    type: Sequelize.STRING,
    allowNull:true
  }, 
  rccm:{
      type: Sequelize.STRING,
      allowNull:true
    } ,
		national_identification	:
  {
    type: Sequelize.STRING,
    allowNull:true
  }, 
	num_impot:
  {
    type: Sequelize.STRING,
    allowNull:true
  },		
	autorisation_fct	:
  {
    type: Sequelize.STRING,
    allowNull:true
  },
	adresse	:
  {
    type: Sequelize.STRING,
    allowNull:true
  },
	phone :
  {
    type: Sequelize.STRING,
    allowNull:true
  },
	mail :
  {
    type: Sequelize.STRING,
    allowNull:true
  },
	website	:
  {
    type: Sequelize.STRING,
    allowNull:true
  },
	facebook:	
  {
    type: Sequelize.STRING,
    allowNull:true
  },
	instagram	:
  {
    type: Sequelize.STRING,
    allowNull:true
  },
	linkdin	:
  {
    type: Sequelize.STRING,
    allowNull:true
  },	
	logo	:
  {
    type: Sequelize.STRING,
    allowNull:true
  },	
  category	:
  {
    type: Sequelize.STRING,
    allowNull:true
  },	
	vat_rate	:
  {
    type: Sequelize.DOUBLE,
    allowNull:true
  },	
	uuid	:
  {
    type: Sequelize.STRING,
    allowNull:true
  },
	user_id :
  {
    type: Sequelize.BIGINT,
    allowNull:true
  },
sync_status	:
{
  type: Sequelize.STRING,
  allowNull:true
},
status	:
{
  type: Sequelize.STRING,
  allowNull:true
},
created_at	:
{
  type: Sequelize.DATE,
  allowNull:true
},
updated_at	:
{
  type: Sequelize.DATE,
  allowNull:true
},	
invoicefooter	:
{
  type: Sequelize.TEXT,
  allowNull:true
},
fidelitypointvalue:
{
  type: Sequelize.DOUBLE,
  allowNull:true
},		
fidelitydefaultmode	:
{
  type: Sequelize.TEXT,
  allowNull:true
},
initvaluefidelity	:
{
  type: Sequelize.INTEGER,
  allowNull:true
},
date_from_fidelity:
{
  type: Sequelize.DATE,
  allowNull:true
},
date_to_fidelity:
{
  type: Sequelize.DATE,
  allowNull:true
},
timestamps:true,
  });
  return Enterprises;
};
