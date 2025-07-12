const db = require("../config/database");

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    await db.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating notification", error: err.message });
  }
};
