const db = require("../config/database");

// POST /api/votes
exports.voteAnswer = async (req, res) => {
  const userId = req.user.userId;
  const { answer_id, vote_type } = req.body; // vote_type = 'up' or 'down'

  if (!['up', 'down'].includes(vote_type)) {
    return res.status(400).json({ message: "Invalid vote type" });
  }

  try {
    // Check if user already votedVote
    const existing = await db.query(
      `SELECT * FROM votes WHERE user_id = $1 AND answer_id = $2`,
      [userId, answer_id]
    );

    if (existing.rows.length > 0) {
      // Update vote
      await db.query(
        `UPDATE votes SET vote_type = $1, created_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND answer_id = $3`,
        [vote_type, userId, answer_id]
      );
    } else {
      // Insert new vote
      await db.query(
        `INSERT INTO votes (user_id, answer_id, vote_type) VALUES ($1, $2, $3)`,
        [userId, answer_id, vote_type]
      );
    }

    return res.status(200).json({ message: "Vote recorded" });
  } catch (err) {
    return res.status(500).json({ message: "Voting failed", error: err.message });
  }
};

// GET /api/votes/:answerId
exports.getVotesForAnswer = async (req, res) => {
  const answerId = req.params.answerId;

  try {
    const result = await db.query(`
      SELECT
        SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END) AS upvotes,
        SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END) AS downvotes
      FROM votes
      WHERE answer_id = $1
    `, [answerId]);

    const { upvotes, downvotes } = result.rows[0];
    const net = (upvotes || 0) - (downvotes || 0);

    return res.json({ upvotes: upvotes || 0, downvotes: downvotes || 0, netVotes: net });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching votes", error: err.message });
  }
};
