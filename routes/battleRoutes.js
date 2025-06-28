const express = require("express");
const router = express.Router();
const { resolveBattle } = require("../controllers/battleController");

router.post("/result", resolveBattle);

module.exports = router;
