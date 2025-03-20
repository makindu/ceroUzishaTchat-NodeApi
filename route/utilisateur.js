const express = require('express');
const { ajouterUtilisateur, getTousUtilisateurs, getUtilisateur, modifierUtilisateur, supprimerUtilisateur } = require('../controler/utlisateur');
const router = express.Router();

router.route("/utilisateurs").post(ajouterUtilisateur);
router.route("/utilisateurs").get(getTousUtilisateurs);
router.route("/utilisateurs/:id").get(getUtilisateur);
router.route("/utilisateurs/:id").put(modifierUtilisateur);
router.route("/utilisateurs/:id").delete(supprimerUtilisateur);

module.exports =router;