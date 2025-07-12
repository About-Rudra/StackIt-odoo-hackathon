const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  voteAnswer,
  getVotesForAnswer,
} = require("../controllers/voteController");

router.post("/", auth, voteAnswer);
router.get("/:answerId", getVotesForAnswer);

module.exports = router;
