import { Schema, model, Document } from 'mongoose';

export interface IBkashRefund extends Document {
    paymentID       : string;
    trxID           : string;
    refundAmount    : Number;
    sku             : string;
    reason          : string;
}

const BkashRefundSchema = new Schema<IBkashRefund> (
    {
        paymentID: {
            type        : String,
            required    : true,
        },
        trxID: {
            type        : String,
            required    : true,
        },
        refundAmount: {
            type        : Number,
            required    : true,
        },
        sku : {
            type        : String,
            required    : true,
        },
        reason: {
            type        : String,
            required    : true,
        },
    },
    {
        timestamps      : true,
    }
);

const BkashRefundModel = model<IBkashRefund>("Bkash_Refunds", BkashRefundSchema);

export default BkashRefundModel;