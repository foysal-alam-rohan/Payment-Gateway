import type { Request, Response } from "express";

import appError from "../../../utils/appError.ts";
import asyncHandler from "../../../utils/asyncHandler.ts";
import StripePaymentService from "./stripe.service.ts";

const parseRawPayload = (payload: unknown): Buffer => {
  
  if (Buffer.isBuffer(payload)) {
    return payload;
  }

  if (typeof payload === "string") {
    return Buffer.from(payload);
  }

  return Buffer.from(JSON.stringify(payload ?? {}));
  
};

export const stripeWebhookHandler = asyncHandler(

  async (req: Request, res: Response) => {

    const stripeSignature = req.headers["stripe-signature"];

    if (typeof stripeSignature !== "string" || stripeSignature.trim().length === 0) {
      throw new appError("Missing Stripe signature header.", 400);
    }

    const rawPayload = parseRawPayload(req.body);

    const stripePaymentService = StripePaymentService as unknown as {
      handleWebhookEvent: (payload: Buffer, signature: string) => Promise<void>;
    };

    await stripePaymentService.handleWebhookEvent(rawPayload, stripeSignature);

    return res.status(200).json({
      success: true,
      message: "Stripe webhook received successfully.",
    });
  }
  
);

export default stripeWebhookHandler;
