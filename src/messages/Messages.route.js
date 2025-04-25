const {MessagesController} = require("./Messages.controller");
const authenticateToken = require('../../middlewares/authenticateToken').authenticateToken;
const router = require("express").Router();

router.get("/all/:value?",authenticateToken, MessagesController.getData);
router.post("/all",authenticateToken, MessagesController.getMessagesByConversation);
// router.get("/:id", MessagesController.getSingleMessages);
router.post("/send_message_group/:value?",authenticateToken, MessagesController.create);
router.post("/get_conversation",authenticateToken, MessagesController.groupMessagesByReceivernConversation);
router.post("/send_message",authenticateToken, MessagesController.create);
router.post("/send_multiple",authenticateToken, MessagesController.createMedia);
router.put("/update_message/:id",authenticateToken, MessagesController.updateMessages);

module.exports = router;
