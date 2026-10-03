const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticate } = require('../middlewares/auth');

// Public / Authenticated Plan Catalog
router.get('/plans', billingController.getPlans);

// Webhook receiver (Unauthenticated, Signature Verified)
router.post('/webhook', billingController.handleWebhook);

// Protected User Billing Endpoints
router.get('/subscription', authenticate, billingController.getSubscription);
router.get('/payments', authenticate, billingController.getPaymentHistory);
router.post('/checkout', authenticate, billingController.checkout);
router.post('/verify', authenticate, billingController.verifyPayment);
router.post('/cancel', authenticate, billingController.cancelSubscription);
router.post('/resume', authenticate, billingController.resumeSubscription);

module.exports = router;
