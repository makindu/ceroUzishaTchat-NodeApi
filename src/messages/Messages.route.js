const MessagesController = require("./Messages.controller");

const router = require("express").Router();

router.get("/all/:value?", MessagesController.getData);
router.post("/all/:value", MessagesController.getMessagesByConversation);
// router.get("/:id", MessagesController.getSingleMessages);
router.post("/send_message_group/:value?", MessagesController.create);
router.post("/get_conversation", MessagesController.groupMessagesByReceivernConversation);
router.post("/send_message", MessagesController.create);
router.post("/send_multiple", MessagesController.createMedia);
router.put("/update_message/:id", MessagesController.updateMessages);

module.exports = router;
