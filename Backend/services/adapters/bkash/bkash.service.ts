import axios from "axios";

import appError from "../../../utils/appError.ts";
import BkashAuth from "./bkash.auth.service.ts";
import BkashPaymentModel from "../../../models/Bkash.Models/Bkash.payment.model.ts";
// import BkashRefundModel from "../../../models/Bkash.Models/Bkash.refund.model.ts";

declare const process: {
  env: {
    BKASH_BASE_URL      ?: string;
    BKASH_APP_KEY       ?: string;
    BKASH_CALLBACK_URL  ?: string;
  };
};

interface BkashCreatePaymentResponse {
  paymentID             : string;
  bkashURL              : string;
  callbackURL           : string;
  successCallbackURL    : string;
  failureCallbackURL    : string;
  cancelledCallbackURL  : string;
  amount                : string;
  intent                : string;
  currency              : string;
  paymentCreateTime     : string;
  transactionStatus     : string;
  merchantInvoiceNumber : string;
  statusCode            : string;
  statusMessage         : string;
}

interface BkashExecutePaymentResponse {
  paymentID             : string;
  transactionStatus     : string;
  amount                : string;
  currency              : string;
  intent                : string;
  merchantInvoiceNumber : string;
  statusCode            : string;
  statusMessage         : string;
  trxID                 : string; 
}

// interface BkashRefundTransactionResponse {
//   paymentID       : string;
//   trxID           : string;
//   refundAmount    : string;
//   sku             : string;
//   reason          : string;
//   statusMessage   : string;
//   statusCode      : string;
//   refundedAmount  : string;
//   refundStatus    : string;
// }

class BkashPaymentService {

  public async createPayment(
    userId  : number,
    amount  : number,
    invoice : string
  ): Promise<BkashCreatePaymentResponse> {

    const token = await BkashAuth.grantToken();
    
    const baseURL     = `${process.env.BKASH_BASE_URL}/tokenized/checkout/create`;
    const appKey      = process.env.BKASH_APP_KEY;
    const callbackURL = process.env.BKASH_CALLBACK_URL;

    if (!baseURL || !appKey || !callbackURL) {
      throw new appError("Missing bKash configuration.", 500);
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new appError("Invalid amount. Amount must be a positive number.", 400);
    }

    if (!invoice) {
      throw new appError("Invoice number is required.", 400);
    }

    try {
      const { data } = await axios.post<BkashCreatePaymentResponse>(
        baseURL,
        {
          mode                  : "0011",
          payerReference        : `user_${userId}`,
          callbackURL,
          amount                : Number(amount),
          currency              : "BDT",
          intent                : "sale",
          merchantInvoiceNumber : invoice,
        },
        {
          headers: {
            "Content-Type"  : "application/json",
            Accept          : "application/json",
            Authorization   : token,
            "X-App-Key"     : appKey,
          },
        }
      );

      await BkashPaymentModel.create({
        userId,
        paymentID     : data.paymentID,
        trxID         : "PENDING", 
        amount        : Number(amount),
        invoiceNumber : invoice,
        date          : new Date().toISOString(),
        status        : 'pending', 
      });

      return data;

    } catch (error: any) {
      console.error('bKash create payment failed:', {
        message       : error?.message,
        responseData  : error?.response?.data,
        status        : error?.response?.status
      });
      throw new appError(
        error?.response?.data?.statusMessage || "Failed to create bKash payment.", 500);
    }
  }

  public async executePayment(paymentID: string): Promise<BkashExecutePaymentResponse> {

    const token    = await BkashAuth.grantToken();
    
    const baseURL  = `${process.env.BKASH_BASE_URL}/tokenized/checkout/execute`;
    const appKey   = process.env.BKASH_APP_KEY;

    if (!baseURL || !appKey) {
      throw new appError("Missing bKash configuration.", 500);
    }

    try {
      const { data } = await axios.post<BkashExecutePaymentResponse>(
        baseURL,
        {
          paymentID,
        },
        {
          headers: {
            "Content-Type"  : "application/json",
            Accept          : "application/json",
            Authorization   : token,
            "X-App-Key"     : appKey,
          },
        }
      );

      await BkashPaymentModel.findOneAndUpdate(
        { paymentID },
        {
          paymentID   : data.paymentID,
          trxID       : data.trxID,
          status      : data.transactionStatus === 'Completed' ? 'completed' : 'failed',
        },
        { returnDocument: 'after' } 
      );

      return data;

    } catch (error: any) {
      console.error('bKash execute payment failed:', {
        message       : error?.message,
        responseData  : error?.response?.data,
        status        : error?.response?.status
      });
      
      await BkashPaymentModel.findOneAndUpdate(
        { paymentID },
        { status: 'failed' }
      );

      throw new appError(
        error?.response?.data?.statusMessage || "Failed to execute bKash payment.", 500);
    }
  }

  public async queryPayment(paymentID: string): Promise<any> {

    const token   = await BkashAuth.grantToken();
    
    const baseURL = `${process.env.BKASH_BASE_URL}/tokenized/checkout/payment/status`;
    const appKey  = process.env.BKASH_APP_KEY;

    if (!baseURL || !appKey) {
      throw new appError("Missing bKash configuration.", 500);
    }

    try {
      const { data } = await axios.post(
        baseURL,
        { paymentID },
        {
          headers: {
            "Content-Type"  : "application/json",
            Accept          : "application/json",
            Authorization   : token,
            "X-App-Key"     : appKey,
          },
        }
      );
      return data;

    } catch (error: any) { 
      console.error('bKash query payment failed:', {
        message       : error?.message,
        responseData  : error?.response?.data,
        status        : error?.response?.status
      });
      throw new appError(
        error?.response?.data?.statusMessage || "Failed to query bKash payment.", 500);
    }
  }

  public async searchTransaction(trxID: string): Promise<any> {

    const token    = await BkashAuth.grantToken();

    const baseURL  = `${process.env.BKASH_BASE_URL}/tokenized/checkout/general/searchTransaction`;
    const appKey   = process.env.BKASH_APP_KEY;

    try {
      const { data } = await axios.post(
      baseURL,
      { trxID },
      {
        headers: {
          Accept        : "application/json",
          Authorization : token,
          "X-App-key"   : appKey,
        },
      }
    );
    return data;

    } catch (error: any) { 
      console.error('bKash search transaction failed:', {
        message       : error?.message,
        responseData  : error?.response?.data,
        status        : error?.response?.status
      });
      throw new appError(
        error?.response?.data?.statusMessage || "Failed to search transaction.", 500);
    }
  
  }

  // public async refundTransaction(
  //   paymentID  : string,
  //   trxID : string,
  //   refundAmount  : number,
  //   sku: string,
  //   reason: string,

  // ): Promise<BkashRefundTransactionResponse> {

  //   const token = await BkashAuth.grantToken();
    
  //   // ✅ FIXED: Using URL-Based API endpoint (NOT tokenized)
  //   // This endpoint works with simple ****** authentication
  //   const baseURL = `${process.env.BKASH_BASE_URL}/checkout/payment/refund`;
    
  //   const appKey  = process.env.BKASH_APP_KEY;

  //   if (!baseURL || !appKey) {
  //     throw new appError("Missing bKash configuration.", 500);
  //   }

  //   if (!paymentID || !trxID || !sku || !reason) {
  //     throw new appError("Payment ID, transaction ID, SKU, and reason are required.", 400);
  //   }

  //   // Validate payment exists and is refundable
  //   const payment = await BkashPaymentModel.findOne({ paymentID });
  //   if (!payment) throw new appError("Payment not found", 404);
  //   if (payment.status !== 'completed') throw new appError("Payment not completed", 400);

  //   try {
  //     const { data } = await axios.post<BkashRefundTransactionResponse>(
  //       baseURL,
  //       {
  //         paymentID,
  //         trxID,
  //         amount: refundAmount,
  //         sku,
  //         reason,
  //       },        {
  //         headers: {
  //           "Content-Type"  : "application/json",
  //           Accept          : "application/json",
  //           Authorization   : token,
  //           "X-App-Key"     : appKey,
  //         },
  //       }
  //     );

  //     // Check if refund was successful (statusCode '0000' means success)
  //     if (data.statusCode !== '0000') {
  //       throw new appError(data.statusMessage || "Refund failed", 400);
  //     }

  //     await BkashRefundModel.create({
  //       paymentID     : data.paymentID,
  //       trxID         : data.trxID, 
  //       refundAmount  : Number(refundAmount),
  //       sku           : data.sku || sku,
  //       reason        : data.reason || reason, 
  //     });

  //     return data;
  //   } catch (error: any) {

  //     console.error('bKash refund transaction failed:', {
  //       message       : error?.message,
  //       responseData  : error?.response?.data,
  //       status        : error?.response?.status
  //     });

  //     throw new appError(
  //       error?.response?.data?.statusMessage || "Failed to refund bKash transaction.", 500);
  //   }

  // }

}

export default new BkashPaymentService();