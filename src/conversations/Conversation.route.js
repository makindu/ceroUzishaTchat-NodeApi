const ConversationsController = require("./Conversation.controller");

const router = require("express").Router();

router.post("/all", ConversationsController.getData);
router.get("/:id", ConversationsController.getSingleConversations);
router.post("/libraryMedias", ConversationsController.getConversationMedias);
router.get("delete/:id", ConversationsController.deletePermanently);
router.get("/messages/:conversationId", ConversationsController.messages);
// router.post("/send_message", ConversationsController.create);
router.put("/:id", ConversationsController.updateConversations);

module.exports = router;
