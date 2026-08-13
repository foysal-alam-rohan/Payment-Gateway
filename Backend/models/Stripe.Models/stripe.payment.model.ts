import { Schema, model, Document } from 'mongoose';

export enum StripePaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export interface IStripePayment extends Document {
  userId: string;
  stripeCheckoutSessionId: string;
  stripeCustomerId?: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: StripePaymentStatus;
  customerEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StripePaymentSchema = new Schema<IStripePayment>(
  {
    userId: {
      type: String, 
      required: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeCustomerId: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      lowercase: true,
      default: 'usd',
    },
    status: {
      type: String,
      enum: Object.values(StripePaymentStatus),
      default: StripePaymentStatus.PENDING,
    },
    customerEmail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// StripePaymentSchema.index({ stripeCheckoutSessionId: 1 });
// StripePaymentSchema.index({ userId: 1 });

const StripePaymentModel = model<IStripePayment>('stripe_payments', StripePaymentSchema);

export default StripePaymentModel;