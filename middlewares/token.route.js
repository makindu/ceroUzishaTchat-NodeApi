const login = require("./authenticateToken").login ;
const router = require("express").Router();
const  logout  = require("./authenticateToken").logout; // adapte le chemin si besoin

router.post("/logout", logout);
router.post("/generate_token", login);

module.exports = router;