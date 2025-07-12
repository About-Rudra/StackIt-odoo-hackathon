const express = require("express");
const router = express.Router();
const { postAnswer, acceptAnswer } = require("../controllers/answerController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, postAnswer);          
router.put("/:id/accept", auth, acceptAnswer); 

module.exports = router;
