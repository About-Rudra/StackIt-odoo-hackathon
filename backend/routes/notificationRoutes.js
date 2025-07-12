const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getNotifications,
  markNotificationAsRead
} = require("../controllers/notificationController");

router.get("/", auth, getNotifications);
router.put("/:id/read", auth, markNotificationAsRead);

module.exports = router;
