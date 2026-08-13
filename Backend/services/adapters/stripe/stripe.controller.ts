import type { Request, Response } from "express";

import asyncHandler from "../../../utils/asyncHandler.ts";
import StripePaymentService from "./stripe.service.ts";

class StripePaymentController {
  
  // Create Payment
  public StripeCreatePayment = asyncHandler(

    async (req: Request, res: Response) => {

    const { userId, quantity } = req.body;
    const parsedQuantity = quantity ? Number(quantity) : 1;

      // Validate required fields
      if (!userId) {
        return res.status(400).json({
          success : false,
          message : "userId is required",
        });
      }

      const session = await StripePaymentService.createCheckoutSession(
        userId,
        parsedQuantity
      );

      if (!session.url) {
        return res.status(500).json({
          success : false,
          message : "Stripe session URL generation failed.",
        });
      }

      return res.status(200).json({
        success : true,
        message : "Stripe session created successfully",
        data: {
          paymentURL : session.url,
          sessionID  : session.id,
          amount     : session.amount_total ? session.amount_total / 100 : 299,
        },
      });
    }

  );

  // Query Payment Status
  public StripeQueryPayment = asyncHandler(

    async (req: Request, res: Response) => {

    const rawSessionID = req.params.sessionId as string | string[] | undefined;
    const sessionID    = Array.isArray(rawSessionID) ? rawSessionID[0] : rawSessionID;

      if (!sessionID) {
        return res.status(400).json({
          success : false,
          message : "sessionId is required",
        });
      }

      const result = await StripePaymentService.retrieveSession(sessionID);

      return res.status(200).json({
        success : true,
        data    : result,
      });
    }

  );

}

export default new StripePaymentController();