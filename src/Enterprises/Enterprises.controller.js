const { user } = require("../../db.provider");
const { Op } = require("sequelize");

const UserController = {};

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
    const result = await user.create(UserData);
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
    const data = await user.findAll({ where: condition });
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
    const data = await user.findByPk(parseInt(req.params.id));
    res.status(200).send({ message: "Success", error: null, data: data });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error occured", error: error.toString(), data: [] });
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
    let result = await user.update(req.body, { where: { id: req.params.id } });
    res.status(200).send({ message: "Success", error: null, data: result });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error", error: error.toString(), data: null });
  }
};

module.exports = UserController;
