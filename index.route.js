const router = require("express").Router();

router.use("/messages", require("./src/messages/Messages.route"));
router.use("/conversations", require("./src/conversations/Conversation.route"));
module.exports = router;
