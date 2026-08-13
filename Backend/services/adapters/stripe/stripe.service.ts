import Stripe from "stripe";
import dotenv from "dotenv";

import appError from "../../../utils/appError.ts";
import StripePaymentModel from "../../../models/Stripe.Models/stripe.payment.model.ts";
import { StripePaymentStatus } from "../../../models/Stripe.Models/stripe.payment.model.ts";

declare const process: {
  env: {
    STRIPE_SECRET_KEY   ?: string;
    STRIPE_SUCCESS_URL  ?: string;
    STRIPE_CANCEL_URL   ?: string;
  };
};

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing in your environment variables!");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-07-29.dahlia',
  appInfo: {
    name    : "stripe-samples/checkout-one-time-payments",
    version : "0.0.1",
    url     : "https://github.com"
  }
});

class StripePaymentService {

  public async createCheckoutSession(
    userId   : string,
    quantity : number
  ): Promise<Stripe.Checkout.Session> {

    if (!userId) {
      throw new appError("userId is required to create a payment session.", 400);
    }

    if (isNaN(quantity) || quantity <= 0) {
      throw new appError("Quantity must be a positive number.", 400);
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode                  : "payment",
        payment_method_types  : ['card'],
        line_items            : [
          {
            price_data: {
              currency      : 'usd',
              product_data  : {
                name        : "IbnVitalon Premium Service",
                description : "One-time subscription payment",
              },
              unit_amount   : 298900, // $299.00
            },
            quantity : quantity
          },
        ],
        success_url : process.env.STRIPE_SUCCESS_URL || `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url  : process.env.STRIPE_CANCEL_URL || `http://localhost:5173/error`,
        metadata    : {
          userId : userId,
        }
      });

      const stripeCustomerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer && "id" in session.customer
            ? session.customer.id
            : undefined;

      const customerEmail = session.customer_email || undefined;
      const stripePaymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : undefined;

      // Create payment record
      await StripePaymentModel.create({
        userId                  : userId,
        stripeCheckoutSessionId : session.id,
        amount                  : session.amount_total ? session.amount_total / 100 : 299,
        currency                : 'usd',
        status                  : StripePaymentStatus.PENDING,
        ...(customerEmail ? { customerEmail } : {}),
        ...(stripeCustomerId ? { stripeCustomerId } : {}),
        ...(stripePaymentIntentId ? { stripePaymentIntentId } : {})
      });

      return session;

    } catch (error: any) {
      console.error('Stripe session creation failed:', {
        message       : error?.message,
        responseData  : error?.response?.data,
        status        : error?.response?.status
      });
      throw new appError(error?.message || "Failed to create Stripe payment session.", 500);
    }
  }

  public async retrieveSession(
    sessionId : string
  ): Promise<Stripe.Checkout.Session> {

    if (!sessionId) {
      throw new appError("Session ID is required.", 400);
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      await this.syncPaymentRecordFromSession(session);
      return session;
      
    } catch (error: any) {
      console.error('Stripe session retrieval failed:', {
        message       : error?.message,
        responseData  : error?.response?.data,
        status        : error?.response?.status
      });
      throw new appError(error?.message || "Failed to fetch Stripe session.", 500);
    }
  }

  private async syncPaymentRecordFromSession(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const mappedStatus = this.mapSessionStatusToPaymentStatus(session);

    if (mappedStatus) {
      await this.updatePaymentRecord(session, mappedStatus);
    }
  }

  private mapSessionStatusToPaymentStatus(
    session: Stripe.Checkout.Session
  ): StripePaymentStatus | null {
    if (session.status === "complete" || session.payment_status === "paid") {
      return StripePaymentStatus.COMPLETED;
    }

    if (session.status === "expired") {
      return StripePaymentStatus.EXPIRED;
    }

    if (session.status === "open" && session.payment_status === "unpaid") {
      return StripePaymentStatus.PENDING;
    }

    if (session.payment_status === "no_payment_required") {
      return StripePaymentStatus.COMPLETED;
    }

    return StripePaymentStatus.FAILED;
  }

  private async updatePaymentRecord(
    session : Stripe.Checkout.Session,
    status  : StripePaymentStatus
  ): Promise<void> {
    if (!session.id) {
      return;
    }

    const metadataUserId =
      typeof session.metadata?.userId === "string" && session.metadata.userId
        ? session.metadata.userId
        : "unknown";

    await StripePaymentModel.findOneAndUpdate(
      { stripeCheckoutSessionId: session.id },
      {
        $set: {
          status,
          userId                : metadataUserId,
          amount                : session.amount_total ? session.amount_total / 100 : 0,
          currency              : session.currency || "usd",
          stripeCustomerId      : session.customer || undefined,
          stripePaymentIntentId : session.payment_intent || undefined,
          customerEmail:
            session.customer_details?.email ||
            session.customer_email ||
            undefined,
        },
      },
      { new: true, upsert: true }
    );
  }
  
}

export default new StripePaymentService();