import express from "express";
const router = express.Router();

import BkashPaymentController from "../services/adapters/bkash/bkash.controller.ts";

import stripePaymentController from "../services/adapters/stripe/stripe.controller.ts";
import { stripeWebhookHandler } from "../services/adapters/stripe/stripe.webhook.ts";

// ==================== Stripe Routes ====================
router.post(
  "/stripe/create-payment",
  stripePaymentController.StripeCreatePayment
);

router.post(
  "/stripe/webhook",
  stripeWebhookHandler
);
  
router.get(
  "/stripe/query-payment/:sessionId",
  stripePaymentController.StripeQueryPayment
);

// ==================== Bkash Routes ====================
router.post(
  "/bkash/create-payment",
  BkashPaymentController.BkashCreatePayment
);

router.get(
  "/bkash/execute-payment",
  BkashPaymentController.BkashExecutePayment
);
 
router.get(
  "/bkash/payment/execute",
  BkashPaymentController.BkashExecutePayment
);
 
router.get(
  "/bkash/query-payment/:paymentID",
  BkashPaymentController.BkashQueryPayment
);

router.get(
  "/bkash/search-transaction/:trxID",
  BkashPaymentController.BkashSearchTransaction
);

// router.post(
//   "/bkash/refund-transaction",
//   BkashPaymentController.BkashRefundTransaction
// );

export default router;