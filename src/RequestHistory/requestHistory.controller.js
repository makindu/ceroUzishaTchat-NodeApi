const   RequestHistory  = require("../../db.provider").RequestHistory ;
const { Op } = require("sequelize");
const allconstant = require("../constantes");

const  RequestHistoryController = {};

async function  createMetion (data){
 
  try {
console.log("before mentions in");
    const result = await  RequestHistory.create(data);
    // res.status(200).send({ message: "Success", error: null, data: result });
    console.log("data mentions",result);
    return {data :result, error : null};
} catch (error) {
      console.log("data mentions error",error);
    return {data :null, error : error};

  }
};
 RequestHistoryController.showByMessageId = async (id)=>{
    try {
        const mentionData = await  RequestHistory.findAll({
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
module.exports =   RequestHistoryController;