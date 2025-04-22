
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

router.post("/all", gettingData);
router.get("/:id", gettingSingleConversations);
router.post("/libraryMedias",  gettingConversationMedias);
router.post("/new_group",  creatingGroup);
router.get("delete/:id",  deletingPermanently);
router.get("/messages/:conversationId",  messageget);
router.post("/group/set_member",  settingNewMember);
router.put("/update/:id",  updatingConversations);
router.put("/group/update_members",  updatingParticipantGroup);

module.exports = router;
