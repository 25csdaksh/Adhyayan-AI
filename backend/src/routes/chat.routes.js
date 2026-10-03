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
const { aiRateLimiter } = require('../middlewares/rateLimiter');
const { validateObjectIds, validatePagination, validateBody } = require('../middlewares/validator');

const router = express.Router({ mergeParams: true });

// Require valid authentication and validate notebookId
router.use(authenticate);
router.use(validateObjectIds('notebookId'));

router
  .route('/')
  .post(createChatSession)
  .get(validatePagination, getChatSessions);

router
  .route('/:sessionId')
  .all(validateObjectIds('sessionId'))
  .get(getChatSessionById)
  .delete(deleteChatSession);

router
  .route('/:sessionId/messages')
  .all(validateObjectIds('sessionId'))
  .get(validatePagination, getChatMessages)
  .post(
    aiRateLimiter,
    validateBody({
      message: { required: true, minLength: 1, maxLength: 8000 },
    }),
    sendMessage
  );

module.exports = router;
