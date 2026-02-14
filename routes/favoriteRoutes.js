const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/favoriteController");

router.get("/me", auth, ctrl.getMyFavorites);                 
router.patch("/me/:playerId", auth, ctrl.toggleFavorite);     

module.exports = router;
