
const gettingData = require("./Conversation.controller").ConversationsController.getData;
const gettingSingleConversations = require("./Conversation.controller").ConversationsController.getSingleConversations;
const gettingConversationMedias = require("./Conversation.controller").ConversationsController.getConversationMedias;
const creatingGroup = require("./Conversation.controller").ConversationsController.createGroup;
const deletingPermanently = require("./Conversation.controller").ConversationsController.deletePermanently;
const messageget = require("./Conversation.controller").ConversationsController.messages;
const settingNewMember = require("./Conversation.controller").ConversationsController.setNewMember;
const updatingConversations = require("./Conversation.controller").ConversationsController.updateConversations;
const updatingParticipantGroup = require("./Conversation.controller").ConversationsController.updatedParticipantGroup;
const authenticateToken = require('../../middlewares/authenticateToken').authenticateToken;

const router = require("express").Router();

router.post("/all",authenticateToken, gettingData);
router.get("/:id",authenticateToken, gettingSingleConversations);
router.post("/libraryMedias",authenticateToken,  gettingConversationMedias);
router.post("/new_group",authenticateToken,  creatingGroup);
router.get("delete/:id", authenticateToken, deletingPermanently);
router.get("/messages/:conversationId",authenticateToken,  messageget);
router.post("/group/set_member",authenticateToken,  settingNewMember);
router.put("/update/:id",authenticateToken,  updatingConversations);
router.put("/group/update_members", authenticateToken, updatingParticipantGroup);

module.exports = router;
