const ConversationsController = require("./Conversation.controller");

const router = require("express").Router();

router.post("/all", ConversationsController.getData);
router.get("/:id", ConversationsController.getSingleConversations);
router.post("/libraryMedias", ConversationsController.getConversationMedias);
router.post("/new_group", ConversationsController.createGroup);
router.get("delete/:id", ConversationsController.deletePermanently);
router.get("/messages/:conversationId", ConversationsController.messages);
// router.post("/send_message", ConversationsController.create);
router.put("/:id", ConversationsController.updateConversations);
router.put("/rew_role", ConversationsController.setrole);

module.exports = router;
