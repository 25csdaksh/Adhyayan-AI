const express = require('express');
const {
  createChatSession,
  getChatSessions,
  getChatSessionById,
  deleteChatSession,
  getChatMessages,
  sendMessage,
} = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router({ mergeParams: true });

// Require valid authentication for all chat operations
router.use(authenticate);

router
  .route('/')
  .post(createChatSession)
  .get(getChatSessions);

router
  .route('/:sessionId')
  .get(getChatSessionById)
  .delete(deleteChatSession);

router
  .route('/:sessionId/messages')
  .get(getChatMessages)
  .post(sendMessage);

module.exports = router;
