const express = require("express");
const router = express.Router();
const { resolveBattle } = require("../controllers/battleController");

router.post("/resolve", resolveBattle);

module.exports = router;
