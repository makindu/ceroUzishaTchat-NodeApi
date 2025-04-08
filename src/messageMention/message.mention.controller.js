const  messageMention  = require("../../db.provider").messageMention ;
const { Op } = require("sequelize");
const allconstant = require("../constantes");

const messageMentionController = {};

async function  createMetion (data){
 
  try {
console.log("before mentions in");
    const result = await messageMention.create(data);
    // res.status(200).send({ message: "Success", error: null, data: result });
    console.log("data mentions",result);
    return {data :result, error : null};
} catch (error) {
      console.log("data mentions error",error);
    return {data :null, error : error};

  }
};
messageMentionController.showByMessageId = async (id)=>{
    try {
        const mentionData = await messageMention.findAll({
            where:{
                message_id : id
            },
            // attribute: allconstant.mentionsattribute,
            logging: console.log, 
        });
        console.log("message mention", mentionData );
        return {data: mentionData, error: null};
    } catch (e) {
        return {data : null, error: e}
    }
};
module.exports =  messageMentionController;