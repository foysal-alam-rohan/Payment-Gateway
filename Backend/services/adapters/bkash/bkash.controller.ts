import type { Request, Response } from "express";

import asyncHandler from "../../../utils/asyncHandler.ts";
import BkashPaymentService from "./bkash.service.ts";

class BkashPaymentController {

  // Create Payment
  public BkashCreatePayment = asyncHandler(

    async (req: Request, res: Response) => {

    const { userId, amount, invoice } = req.body;

      // Validate required fields
      if (!userId || !amount || !invoice) {
        return res.status(400).json({
          success : false,
          message : "userId, amount, and invoice are required",
        });
      }

      const payment = await BkashPaymentService.createPayment(
        userId,
        amount,
        invoice
      );

      return res.status(200).json({
        success : true,
        message : "Payment created successfully",
        data: {
          paymentID : payment.paymentID,
          bkashURL  : payment.bkashURL,
          amount    : payment.amount,
          invoice   : payment.merchantInvoiceNumber,
        },
      });
    }

  );

  // Execute Payment
  public BkashExecutePayment = asyncHandler(

  async (req: Request, res: Response) => {

    const paymentID = req.query.paymentID;

    if (!paymentID) {
      return res.redirect(
        `http://localhost:5173/error?message=paymentID%20is%20required`
      );
    }

    try {
      const result = await BkashPaymentService.executePayment(paymentID as string);

      const isCompleted = result.transactionStatus === 'Completed';
      const baseUrl     = 'http://localhost:5173';
      const redirectUrl = isCompleted
        ? `${baseUrl}/success`
        : `${baseUrl}/error?message=${encodeURIComponent(result.statusMessage || 'Payment failed')}`;

      return res.redirect(redirectUrl);

    } catch (error: any) {
      const errorMsg = error?.message || 'Payment execution failed';
      return res.redirect(`http://localhost:5173/error?message=${encodeURIComponent(errorMsg)}`);
    }
  }

  );

  // Query Payment Status
  public BkashQueryPayment = asyncHandler(

    async (req: Request, res: Response) => {
      const rawPaymentID = req.params.paymentID as string | string[] | undefined;
      const paymentID    = Array.isArray(rawPaymentID) ? rawPaymentID[0] : rawPaymentID;

      if (!paymentID) {
        return res.status(400).json({
          success : false,
          message : "paymentID is required",
        });
      }

      const result = await BkashPaymentService.queryPayment(paymentID);

      return res.status(200).json({
        success : true,
        data    : result,
      });
    }

  );

  // Search Transaction
  public BkashSearchTransaction = asyncHandler(

    async(req: Request, res: Response) => {
      const rawTrxID = req.params.trxID as string | string[] | undefined;
      const trxID    = Array.isArray(rawTrxID) ? rawTrxID[0] : rawTrxID;

      if (!trxID) {
        return res.status(400).json({
          success : false,
          message : "trxID is required",
        });
      }

      const result = await BkashPaymentService.searchTransaction(trxID);

      return res.status(200).json({
        success : true,
        data    : result,
      });
    }

  );

  // Refund Transaction
  // public BkashRefundTransaction = asyncHandler(

  //   async (req: Request, res: Response) => {
  //   const { paymentID, trxID, refundAmount, sku, reason } = req.body;
  //     const refund = await BkashPaymentService.refundTransaction(paymentID, trxID, refundAmount, sku, reason);
  //     return res.status(200).json({
  //       success : true,
  //       message : "Refund successfully",
  //       data: {
  //         refundAmount : refund.refundAmount,
  //         paymentID  : refund.paymentID,
  //         trxID    : refund.trxID,
  //         sku   : refund.sku,
  //         reason: refund.reason
  //       },
  //     });
  //   }
  
  // )

}

export default new BkashPaymentController();