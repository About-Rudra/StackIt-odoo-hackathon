const db = require("../config/database");

// POST /api/answers
const postAnswer = async (req, res) => {
  const { question_id, description } = req.body;
  const userId = req.user.userId;
  const username = req.user.username;

  try {
    await db.query(
      `INSERT INTO answers (description, user_id, question_id) VALUES ($1, $2, $3)`,
      [description, userId, question_id]
    );

    const questionOwner = await db.query(
      `SELECT user_id FROM questions WHERE id = $1`,
      [question_id]
    );

    const ownerId = questionOwner.rows[0]?.user_id;

    if (ownerId && ownerId !== userId) {
      await db.query(
        `INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)`,
        [ownerId, 'answer', `${username} answered your question.`]
      );
    }

    res.status(201).json({ message: "Answer submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to post answer", error: err.message });
  }
};

// PUT /api/answers/:id/accept
const acceptAnswer = async (req, res) => {
  const answerId = req.params.id;
  const userId = req.user.userId;

  try {
    const result = await db.query(
      `SELECT q.id, q.user_id
       FROM answers a JOIN questions q ON a.question_id = q.id
       WHERE a.id = $1`,
      [answerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const question = result.rows[0];
    if (question.user_id !== userId) {
      return res.status(403).json({ message: "You are not the owner of this question" });
    }

    await db.query(
      `UPDATE answers SET is_accepted = false WHERE question_id = $1`,
      [question.id]
    );

    await db.query(
      `UPDATE answers SET is_accepted = true WHERE id = $1`,
      [answerId]
    );

    res.json({ message: "Answer accepted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Failed to accept answer", error: err.message });
  }
};

// ✅ Export both
module.exports = {
  postAnswer,
  acceptAnswer,
};
