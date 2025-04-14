const  {Users , Enterprises,usersenterprises } = require('../../db.provider');
const { Op } = require("sequelize");
const allconstant = require('../constantes');
const users = {};
const UserController = {};

/**
 * Vérifie si un utilisateur existe.
 * @param {Object} filter 
 * @returns {Promise<boolean>}
 */
UserController.userExists  = async (filter) =>{
  try {
    const user = await Users.findOne({ where: filter , attributes: allconstant.Userattributes });
    return !!user; 
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur :", error);
    return false;
  }
};
UserController.create = async (req, res) => {
  if (!req.body.fullname) {
    res.status(400).send("Fullname is requried");
    return;
  }
  const UserData = {
    fullname: req.body.fullname,
    username: req.body.username,
    password: req.body.password,
  };
  try {
    const result = await Users.create(UserData);
    res.status(200).send({ message: "Success", error: null, data: result });
  } catch (error) {
    res.status(500).send({
      message: "Error occured",
      error: error.toString(),
      data: null,
    });
  }
};

UserController.getData = async (req, res) => {
  let condition = {};
  if (req.params.value) {
    condition = {
      [Op.or]: { username: req.params.value, fullname: req.params.value },
    };
  }
  try {
    const data = await Users.findAll({ where: condition });
    res.status(200).send({ message: "Success", error: null, data: data });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error occured", error: error.toString(), data: [] });
  }
};

UserController.getSingleUser = async (req, res) => {
  // let condition = {};
  // if (req.params.id) {
  //   condition = {
  //     id:id,
  //   };
  // }
  if (!req.params.id) {
    res
      .status(400)
      .send({ message: "Error", error: "No data found", data: {} });
    return;
  }
  try {
    const data = await Users.findByPk(parseInt(req.params.id));
    res.status(200).send({ message: "Success", error: null, data: data });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error occured", error: error.toString(), data: [] });
  }
};
UserController.show = async (userid) => {
  try {
    console.log("user id",parseInt(userid));
    const userData = await Users.findByPk(parseInt(userid), {
      attributes: allconstant.Userattributes    });

    return userData;  // Retourne l'utilisateur avec les champs spécifiés
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching user data');
  }
};
UserController.showByEnterprisee = async (enterprise_id) => {
  try {
    const userData = await Users.findByPk(userid, {
      attributes: [`id`, `user_name`, `full_name`, `user_mail`, `user_phone`, `user_type`, `status`, `note`, `avatar`, `uuid`,  `collector` ], // spécifier les champs à retourner
    });

    return userData;  // Retourne l'utilisateur avec les champs spécifiés
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching user data');
  }
};

UserController.updateUser = async (req, res) => {
  if (!req.params.id) {
    res
      .status(400)
      .send({ message: "Error", error: "Aucun ID specifie", data: null });
    return;
  }

  try {
    let result = await Users.update(req.body, { where: { id: req.params.id } });
    res.status(200).send({ message: "Success", error: null, data: result });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error", error: error.toString(), data: null });
  }
};

UserController.getUserSocketId = (userId) => {
  return users[userId] || null;
}
UserController.getEnabledUsersByEnterprise = async (enterpriseId) => {
  // console.log("Enterpose id",enterpriseId);
  try {
    const users = await Users.findAll({
      include: [
        {
          model: usersenterprises,
          as: "userEnterprises", 
          where: { enterprise_id: enterpriseId }, 
          // attributes: allconstant.Userattributes, 
        },
      ],
      where: { status: "enabled" }, // Filtrer par statut
    });
    // console.log("data",users)
    return {data:users,error: null, message:"success" };
    } catch (error) {
      
    return {data:null,error: error.toString(), message:"error" };
  }
};
module.exports = UserController;
