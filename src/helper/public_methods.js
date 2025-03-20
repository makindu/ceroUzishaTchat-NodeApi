const { notebookoperation, notebook, componyaccounts, companyaccountsHistorys, account } = require("../../db.provider");
const companyaccountModel = require("../akiba/companyaccounts/companyaccount.model");
const notebookModel = require("../akiba/notebooks/notebook.model");
const { generatePrefixedUUID, generateRandomString } = require("../helper/uuid");

async function notbookexist(data) {
    try {

        let existingNotbook = await notebook.findOne({ _id: data.notebook._id });
        if (existingNotbook) {
            return {
                message: true,
                error: null,
                data: existingNotbook
            }
        }
        else {
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }
    } catch (error) {
        return {
            message: false,
            error: error,
            data: null
        }
    }

}
async function accountexist(data) {
    try {

        let existingAccount = await account.findOne({ _id: data.account });

        if (existingAccount) {
            return {
                message: true,
                error: null,
                data: existingAccount
            }
        }
        else {
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }
    } catch (error) {
        return {
            message: false,
            error: error,
            data: null
        }
    }

}
async function componyaccountsHistoryFindAndUpdate(data) {
    try {

        let history = await companyaccountsHistorys.findByIdAndUpdate(data._id, data);

        return {
            message: true,
            error: null,
            data: history
        }

    } catch (error) {
        console.log(error);
        return {
            message: false,
            error: error,
            data: null
        }
    }
}
async function accounnotbookUpdated(data) {
    try {
        let accountMember = await account.findOne({ _id: data.account });
        let newSold = 0;
        if (data.mouvment == 'withdraw') {
            newSold = accountMember.sold - data.notebook.sold;
        } else {
            newSold = data.amount;
            newSold += accountMember.sold;
            if (data.notebook.operation_done == 0) {
                newSold -= data.amount;
            }
        }
        let Memberaccount = {
            sold: newSold,
        };
        let resultat = await account.findByIdAndUpdate(data.account, Memberaccount);
        if (resultat) {
            return {
                message: true,
                error: null,
                data: resultat
            }
        }
        else {
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }

    } catch (error) {
        console.log(error);
        return {
            message: false,
            error: error,
            data: null
        }

    }
}
async function notbookUpdated(data) {
    try {
        let NoteBookMember = await notebook.findOne({ _id: data.notebook._id });
        let status = 'pending';
        let MemberNotbook = {};
        if (data.member.type == 'manager') {
            status = 'validated';
        }
        if (NoteBookMember.operation_done == 26) {

            status = "unavailable";
        };
        if (data.mouvment == 'withdraw') {
            status = "withdrawn";
            NoteBookMember.sold_operation = 0;
            MemberNotbook = {
                sold_operation: 0,
                note_status: status,
                sold: 0
            };
        }
        if (data.mouvment == 'entry') {
            MemberNotbook = {
                operation_done: NoteBookMember.operation_done + 1,
                sold_operation: NoteBookMember.sold_operation - 1,
                note_status: status,
                sold: data.member.type == 'manager' ? (NoteBookMember.amount * (NoteBookMember.operation_done + 1)) :NoteBookMember.note_status == "pending" ? 0 :   (NoteBookMember.amount * NoteBookMember.operation_done ) ,
            };
            MemberNotbook.sold = MemberNotbook.sold;
            // MemberNotbook.sold = MemberNotbook.sold - NoteBookMember.amount;
        }


        let resultat = await notebook.findByIdAndUpdate(data.notebook._id, MemberNotbook);
        console.log("here updating status");
        if (resultat) {
            console.log("here updating status");
            return {
                message: true,
                error: null,
                data: resultat
            }
        }
        else {
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }

    } catch (error) {
        return {
            message: false,
            error: error,
            data: null
        }

    }
}
async function historyMemberPassed(data) {
    try {
        let historySaved = await notebookoperation.create(data);
        if (historySaved) {
            return {
                message: true,
                error: null,
                data: historySaved
            }
        }
        else {
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }

    } catch (error) {
        return {
            message: false,
            error: error,
            data: null
        }

    }

}
async function companyaccountFindAndUpdateOne(data) {
    try {

        let componyaccountsUpdated = await componyaccounts.findOne({ money: data.money });
        let newSold = data.amount;

        newSold += componyaccountsUpdated.sold;
        let companyaccount = {
            sold: newSold,
        };
        let resultat = await componyaccounts.findByIdAndUpdate(componyaccountsUpdated._id, companyaccount);
        if (resultat) {
            return {
                message: true,
                error: null,
                data: resultat
            }
        }
        else {
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }
    } catch (error) {
        return {
            message: false,
            error: error,
            data: null
        }
    }
}
async function componyaccountsHistory(data, sent, historyStatus) {
    try {

        let dataHistory = {
            uuid: generatePrefixedUUID("CAH"),
            creation_status: historyStatus,
            mouvment: sent.mouvment,
            operation: data._id,
            type_operation: data.type_operation,
            amount: data.amount,
            done_by: data.done_by,
            done_at: data.done_at,
            validation: sent.validation,
            collecter: sent.collecter,
            money: data.money,
            mouvment: sent.mouvment,
            validated_by: sent.validated_by,
            observation: data.observation
        };
        console.log("accountHistoryIntiate ", dataHistory);
        let history = await companyaccountsHistorys.create(dataHistory);
        console.log("accountHistoryValidate");
        if (history) {
            console.log("passed");
            return {
                message: true,
                error: null,
                data: history
            }
        }
        else {
            console.log("not passed");
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }
    } catch (error) {
        console.log("not passed");
        return {
            message: false,
            error: error,
            data: null
        }
    }
}

//added by fabrice
async function updateuserstory(data) {
    try {
        let result = await notebookoperation.findByIdAndUpdate(data._id,data);
        if (result) {
            console.log("updating notebookoperation for member");
            return {
                message: true,
                error: null,
                data: result
            }
        }
        else {
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }

    } catch (error) {
        return {
            message: false,
            error: error,
            data: null
        }

    }
}

async function updateaccountcompany(data) {
    try {
        let result = await companyaccountModel.findByIdAndUpdate(data._id,data);
        if (result) {
            console.log("updating updateaccountcompany");
            return {
                message: true,
                error: null,
                data: result
            }
        }
        else {
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }

    } catch (error) {
        return {
            message: false,
            error: error,
            data: null
        }

    }
}

async function updatecompanystory(data) {
    try {
        let result = await companyaccountsHistorys.findByIdAndUpdate(data._id,data);
        if (result) {
            console.log("updating updatecompanystory");
            return {
                message: true,
                error: null,
                data: result
            }
        }
        else {
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }

    } catch (error) {
        return {
            message: false,
            error: error,
            data: null
        }

    }
}

async function updatenotebook(data) {
    try {
        let result = await notebookModel.findByIdAndUpdate(data._id,data);
        if (result) {
            console.log("updating notebook");
            return {
                message: true,
                error: null,
                data: result
            }
        }
        else {
            return {
                message: false,
                error: "data not found",
                data: null
            }
        }

    } catch (error) {
        return {
            message: false,
            error: error,
            data: null
        }

    }
}

module.exports = {
    updatenotebook,
    updateuserstory,
    updateaccountcompany,
    updatecompanystory, 
    notbookexist, 
    accountexist, 
    notbookUpdated, 
    historyMemberPassed, 
    companyaccountFindAndUpdateOne, 
    accounnotbookUpdated, 
    componyaccountsHistory, 
    componyaccountsHistoryFindAndUpdate 
};

// try {
//     if (!data.uuid) {
//         data.uuid = generatePrefixedUUID('NH');
//     }
//     let existingNotbook = await notebook.findOne({ _id: data.notebook._id });
//     let existingAccount = await account.findOne({ _id: data.account });
//     if (existingNotbook.sold_operation == 0 || existingNotbook.note_status == "pending" || existingNotbook.note_status == "unavailable") {
//         console.log("notboook are unavalable");

//         return io.emit("new_notebook_operation", {
//             status: 400,
//             message: "book unavailable",
//             error: null,
//             data: null
//         });
//     }
//     console.log('tub finded', existingNotbook);
//     if (existingNotbook.amount == data.amount) {
//         let newDataNotbook = {
//             operation_done: existingNotbook.operation_done + 1,
//             sold_operation: existingNotbook.sold_operation - 1,
//         };
//         let notebookUpdated = await notebook.findByIdAndUpdate(existingNotbook._id, newDataNotbook);
//         if (notebookUpdated) {
//             let result = await notebookoperation.create(data);
//             if (existingNotbook.operation_done != 0 && result) {
//                 if (existingAccount && data.type_operation == 'entry') {
//                     let newSold = result.amount;
//                     newSold += existingAccount.sold;
//                     let newSoldeAccountMember = {
//                         sold: newSold
//                     }
//                     await account.findByIdAndUpdate(existingAccount._id, newSoldeAccountMember);

//                 }
//                 if (existingAccount && data.type_operation == 'withdraw') {
//                     let newSold = result.amount;
//                     newSold -= existingAccount.sold;
//                     let newSoldeAccountMember = {
//                         sold: newSold
//                     }
//                     await account.findByIdAndUpdate(existingAccount._id, newSoldeAccountMember);
//                 }
//                 if (existingNotbook.operation_done == 0) {
//                     let existingNotbook = await componyaccounts.findOne({ money: data.money });

//                     console.log('tub finded', existingNotbook);
//                     let newSold = result.amount;
//                     if (existingNotbook) {
//                         newSold += existingNotbook.sold;
//                     }
//                     creation_status = 'validated';
//                     let companyaccount = {
//                         sold: newSold,
//                     };
//                     await componyaccounts.findByIdAndUpdate(existingNotbook._id, companyaccount);


//                     let companyaccountsHistory = {
//                         uuid: generatePrefixedUUID('CAH'),
//                         operation: result._id,
//                         money: data.money,
//                         type_operation: 'deposit_book',
//                         amount: data.amount,
//                         done_by: data.done_by,
//                         done_at: data.done_at,
//                         mouvment: data.type_operation,
//                         observation: data.observation,
//                         creation_status: creation_status,
//                         sold_operation: existingNotbook.sold_operation - 1,
//                         validated_by: result.created_by
//                     }
//                     await companyaccountsHistorys.create(companyaccountsHistory);

//                 }
//                 return io.emit("new_notebook_operation", {
//                     status: 200,
//                     message: "success",
//                     error: null,
//                     data: result
//                 });
//             }
//         }
//     }
//     else {
//         console.log("amounts are not aquals");
//         io.emit("new_notebook_operation", {
//             status: 400,
//             message: "error occured",
//             error: error,
//             data: null
//         });
//     }

// } catch (error) {
//     console.log("error cactched " + error);
//     io.emit("new_notebook_operation", {
//         status: 500,
//         message: "error occured",
//         error: error,
//         data: null
//     });
// }