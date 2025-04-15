const ConversationsController = require("./Conversation.controller");

const router = require("express").Router();

router.post("/all", ConversationsController.getData);
router.get("/:id", ConversationsController.getSingleConversations);
router.post("/libraryMedias", ConversationsController.getConversationMedias);
router.post("/new_group", ConversationsController.createGroup);
router.get("delete/:id", ConversationsController.deletePermanently);
router.get("/messages/:conversationId", ConversationsController.messages);
router.post("/group/set_member", ConversationsController.setNewMember);
router.put("/update/:id", ConversationsController.updateConversations);
router.put("/group/update_members", ConversationsController.updatedParticipantGroup);

module.exports = router;
