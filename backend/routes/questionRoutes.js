const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  askQuestion,
  getAllQuestions,
  getQuestionById,
} = require("../controllers/questionController");

// Public
router.get("/", getAllQuestions);
router.get("/:id", getQuestionById);

// Authenticated users only
router.post("/", auth, askQuestion);

module.exports = router;
