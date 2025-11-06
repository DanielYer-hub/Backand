const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/availabilityController");

router.get("/me", auth, ctrl.getMyAvailability);
router.patch("/me", auth, ctrl.updateMyAvailability);
router.get("/:id", ctrl.getPublicAvailability); 

module.exports = router;