const db = require("../config/database");

exports.askQuestion = async (req, res) => {
  const { title, description, tags } = req.body;
  const userId = req.user.userId;

  try {
    await db.query(
      "INSERT INTO questions (title, description, tags, user_id) VALUES ($1, $2, $3, $4)",
      [title, description, tags, userId]
    );

    return res.status(201).json({ message: "Question posted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to post question", error: err.message });
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT q.id, q.title, q.tags, q.created_at, u.username
      FROM questions q
      JOIN users u ON q.user_id = u.id
      ORDER BY q.created_at DESC
    `);

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch questions", error: err.message });
  }
};

exports.getQuestionById = async (req, res) => {
  const questionId = req.params.id;

  try {
    // Fetch question
    const question = await db.query(
      `SELECT q.*, u.username FROM questions q JOIN users u ON q.user_id = u.id WHERE q.id = $1`,
      [questionId]
    );

    if (question.rows.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Fetch answers for that question
    const answers = await db.query(
      `SELECT a.*, u.username FROM answers a JOIN users u ON a.user_id = u.id WHERE a.question_id = $1 ORDER BY a.created_at ASC`,
      [questionId]
    );

    return res.json({
      question: question.rows[0],
      answers: answers.rows,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch question", error: err.message });
  }
};
