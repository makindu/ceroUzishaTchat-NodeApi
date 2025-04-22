
const authenticateToken = require("../../middlewares/authenticateToken").authenticateToken;
const gettingData = require("./Conversation.controller").getData;
const gettingSingleConversations = require("./Conversation.controller").getSingleConversations;
const gettingConversationMedias = require("./Conversation.controller").getConversationMedias;
const creatingGroup = require("./Conversation.controller").createGroup;
const deletingPermanently = require("./Conversation.controller").deletePermanently;
const messageget = require("./Conversation.controller").messages;
const settingNewMember = require("./Conversation.controller").setNewMember;
const updatingConversations = require("./Conversation.controller").updateConversations;
const updatingParticipantGroup = require("./Conversation.controller").updatedParticipantGroup;
const router = require("express").Router();

router.post("/all",authenticateToken, gettingData);
router.get("/:id",authenticateToken, gettingSingleConversations);
router.post("/libraryMedias", authenticateToken,  gettingConversationMedias);
router.post("/new_group", authenticateToken,  creatingGroup);
router.get("delete/:id", authenticateToken,  deletingPermanently);
router.get("/messages/:conversationId",  authenticateToken, messageget);
router.post("/group/set_member",authenticateToken,  settingNewMember);
router.put("/update/:id", authenticateToken, updatingConversations);
router.put("/group/update_members", authenticateToken, updatingParticipantGroup);

module.exports = router;
