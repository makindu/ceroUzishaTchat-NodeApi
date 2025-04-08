const  messageReference  = require("../../db.provider").messageReference ;
const Invoice =  require("../../db.provider").Invoice;
const Expenditures =  require("../../db.provider").Expenditures;
const Debts =  require("../../db.provider").Debts ;
const Tubs =  require("../../db.provider").Tubs ;
const Payments =  require("../../db.provider").Payments ;
const Stocks =  require("../../db.provider").Stocks ;
const customer =  require("../../db.provider").customer ;
const Entries =  require("../../db.provider").Entries;
const RequestHistory = require("../../db.provider").RequestHistory;
const { Op, where } = require("sequelize");
const allconstant = require("../constantes");

const messageReferenceController = {};

const modelMap = {
  invoice: Invoice,
  expenditures: Expenditures,
  debts: Debts,
  tubs: RequestHistory,
  payments: Payments,
  stocks: Stocks,
  customer: customer,
  entries: Entries,

};
messageReferenceController.create = async (data) => {
 
  try {
    const result = await messageReference.create(data);
    // res.status(200).send({ message: "Success", error: null, data: result });
    return {data :result, error : null};
  } catch (error) {
    return {data :null, error : error};

  }
};
messageReferenceController.createMany = async (data, message_id) => {
  try {
    console.log("\x1b[36m[START]\x1b[0m Begin creating references with Promise.all");

    await Promise.all(
      data.map(async (reference) => {
        try {
          console.log("\x1b[34m[BUILD]\x1b[0m Start building reference object");

          const referencesData = {
            message_id: message_id,
            reference_type: reference.reference_type,
            reference_code: reference.reference_code
          };

          console.log("\x1b[34m[CREATE]\x1b[0m Creating messageReference...");
          const resultat = await messageReference.create(referencesData, {   });

          if (resultat.reference_type === 'customer') {
            console.log("\x1b[35m[CUSTOMER]\x1b[0m Handling customer reference");

            const customereferenced = await customer.findAll({
              where: { id: reference.reference_code }
            });

            console.log("\x1b[35m[FOUND]\x1b[0m Customer referenced:", customereferenced);

            await Promise.all(customereferenced.map(async (c) => {
              const dataToUpdate = {
                reference_uuid: c.uuid || c.id,
                reference_label: c.customerName
              };

              console.log(`\x1b[33m[UPDATE]\x1b[0m Updating messageReference for ID ${resultat.id}`);
              const updateReference = await messageReference.update(dataToUpdate, {
                where: { id: resultat.id },
                 
              });
              console.log("\x1b[32m[UPDATED]\x1b[0m", updateReference);
            }));

            return resultat;
          } else {
            console.log("\x1b[35m[MODEL]\x1b[0m Type is not 'customer'. Handling other model.");
            
            let modelKey = reference.reference_type.toLowerCase();
            let model = modelMap[modelKey];

            console.log("\x1b[35m[MODEL]\x1b[0m  model.",model);
            if (model && typeof model.findOne === 'function') {
              // model = allconstant.capitalizeFirstLetter(model);
              const referenced = await model.findOne({
                where: { id: reference.reference_code },
                // attributes : allconstant.Userattributes,
                
              });

              if (referenced) {
                const dataToUpdate = {
                  reference_uuid: referenced.uuid || referenced.id,
                  reference_type: reference.reference_type || null
                };

                console.log("\x1b[33m[UPDATE]\x1b[0m Updating with data:", dataToUpdate);
                const updateReference = await messageReference.update(dataToUpdate, {
                  where: { id: resultat.id },
                   
                });

                console.log("\x1b[32m[UPDATED]\x1b[0m Reference updated:", updateReference);
              } else {
                console.warn("\x1b[31m[WARN]\x1b[0m No referenced record found in model:", reference.reference_type);
              }
            } else {
              console.warn("\x1b[31m[WARN]\x1b[0m No model found for type:", allconstant.capitalizeFirstLetter(reference.reference_type));
            }

            return resultat;
          }
        } catch (error) {
          console.error("\x1b[31m[ERROR]\x1b[0m Erreur lors du traitement d'une référence :", error);
        }
      })
    );

    console.log("\x1b[36m[DONE]\x1b[0m All references processed.");
  } catch (error) {
    console.error("\x1b[31m[FATAL ERROR]\x1b[0m An error occurred in createMany:", error);
  }
};

messageReferenceController.showByMessageId = async (id) => {
    try {
        const refeenceData = await messageReference.findAll({
            where:{
                message_id : id
            },
            // attribute: allconstant.refeencesattribute,
             
        });
        console.log("message references", refeenceData );
        return {data:refeenceData , error : null};
    }catch (e) 
    {
        return {data:null , error : e};
    }
};
module.exports =  messageReferenceController;