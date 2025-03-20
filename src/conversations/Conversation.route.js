const ConversationsController = require("./Conversation.controller");

const router = require("express").Router();

router.post("/all/:value?", ConversationsController.getData);
router.get("/:id", ConversationsController.getSingleConversations);
router.get("delete/:id", ConversationsController.deletePermanently);
// router.post("/send_message", ConversationsController.create);
router.put("/:id", ConversationsController.updateConversations);

module.exports = router;
