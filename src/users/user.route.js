const UserController = require("./user.controller");

const router = require("express").Router();

router.get("/all/:value?", UserController.getData);
router.get("/:id", UserController.getSingleUser);
router.post("/", UserController.create);
router.put("/:id", UserController.updateUser);

module.exports = router;
