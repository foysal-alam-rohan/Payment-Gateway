import { Schema, model, Document } from 'mongoose';

export interface IBkashPayment extends Document {
  userId        : number;
  amount        : number;
  paymentID     : string;
  trxID         : string;
  invoiceNumber : string;
  date          : string;
  status        : 'pending' | 'completed' | 'failed';
  createdAt     : Date;
  updatedAt     : Date;
}

const BkashPaymentSchema = new Schema<IBkashPayment> (
  {
    userId: {
      type      : Number,
      required  : true,
    },
    paymentID: {
      type      : String,
      required  : true,
      unique    : true,
    },
    trxID: {
      type      : String,
      default   : 'PENDING',
    },
    amount: {
      type      : Number,
      required  : true,
    },
    invoiceNumber: {
      type      : String, 
      required  : true,
    },
    date: {
      type      : String,
      required  : true,
    },
    status: {
      type      : String,
      enum      : ['pending', 'completed', 'failed'],
      default   : 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const BkashPaymentModel = model<IBkashPayment>('bkash_payments', BkashPaymentSchema);

export default BkashPaymentModel;