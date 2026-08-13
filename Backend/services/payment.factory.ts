// // Backend/services/payment.factory.ts
// import { BkashPaymentController } from './adapters/bkash/bkash.service';
// import { IPaymentAdapter } from './adapters/payment.interface';

// export class PaymentFactory {
//   static getAdapter(provider: 'bkash' | 'stripe'): IPaymentAdapter {
//     switch (provider) {
//       case 'bkash':
//         return new BkashPaymentController();
//       default:
//         throw new Error('Unsupported payment provider');
//     }
//   }
// }
