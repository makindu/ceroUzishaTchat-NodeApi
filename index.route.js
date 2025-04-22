const router = require("express").Router();

router.use("/messages", require("./src/messages/Messages.route"));
router.use("/conversations", require("./src/conversations/Conversation.route"));
router.use("/",require("./middlewares/token.route") );
module.exports = router;
