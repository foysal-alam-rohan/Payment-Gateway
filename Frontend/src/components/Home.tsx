import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';

// ---------- Logo Asset Imports ----------
import bkashLogo from "../../assets/images/bkash.png";
import payoneerLogo from "../../assets/images/payoneer.png";
import stripeLogo from "../../assets/images/stripe.png";
import visaLogo from "../../assets//images/visa.png";
import epayLogo from "../../assets/images/epay.jpg";
import logo from "../../assets/images/logo.png";

// ---------- Types ----------
interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    bkashURL?: string;
    paymentURL?: string;
    url?: string;
    paymentID?: string;
    amount?: number;
    invoice?: string;
    [key: string]: any;
  };
}

interface BackendError {
  message?: string;
  success?: boolean;
  errorDetails?: string;
  [key: string]: unknown;
}

type Gateway = {
  id: string;
  name: string;
  logo: string;
  endpoint: string;
};

const GATEWAYS: Gateway[] = [
  {
    id: 'bkash',
    name: 'bKash',
    logo: bkashLogo,
    endpoint: 'http://localhost:5000/api/bkash/create-payment',
  },
  {
    id: 'payoneer',
    name: 'Payoneer',
    logo: payoneerLogo,
    endpoint: 'http://localhost:5000/api/payoneer/payment/create',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: stripeLogo,
    endpoint: 'http://localhost:5000/api/stripe/create-payment',
  },
  {
    id: 'visa',
    name: 'Visa',
    logo: visaLogo,
    endpoint: 'http://localhost:5000/api/visa/payment/create',
  },
  {
    id: 'epay',
    name: 'ePay',
    logo: epayLogo,
    endpoint: 'http://localhost:5000/api/epay/payment/create',
  },
];

const Home: React.FC = () => {
  const [loadingGateway, setLoadingGateway] = useState<string | null>(null);
  const [amount] = useState(50);
  const [invoice] = useState(() => `INV-${Date.now()}`);

  const payWithGateway = async (gateway: Gateway): Promise<void> => {
    setLoadingGateway(gateway.id);
    try {
      const { data } = await axios.post<PaymentResponse>(
        gateway.endpoint,
        {
          userId: 123,
          amount,
          invoice,
        },
        { withCredentials: true }
      );

        const paymentUrl =
          data?.data?.bkashURL ||
          data?.data?.paymentURL ||
          data?.data?.url ||
          (data?.data && (data.data as any).paymentUrl);

        if (paymentUrl) {
          window.location.assign(paymentUrl);
        } else {
          throw new Error(data?.message || 'Payment initiation failed.');
        }
      } catch (error) {
        const err = error as AxiosError<BackendError>;
        const errorMessage = err.response?.data?.message || (error as Error).message || 'Payment initiation failed.';
        alert(errorMessage);
        console.error('Payment error:', err.response?.data || error);
      } finally {
        setLoadingGateway(null);
      }
    };

  return (
    <div className="app-container">
      <div className="card">
        <div className="logo-container">
          <img src={logo} alt="E-Pay Logo" className="epay-main-logo" />
        </div>

        <div className="bkash-badge">Secure Payment</div>
        <h1>Choose your payment method</h1>
        <p className="subtitle">Select a gateway below to complete your payment</p>

        <div className="payment-summary">
          <span className="summary-item">
            <span className="label">Amount</span>
            <span className="value">BDT {amount}.00</span>
          </span>
          <span className="summary-divider">|</span>
          <span className="summary-item">
            <span className="label">Invoice</span>
            <span className="value">{invoice}</span>
          </span>
        </div>

        <div className="gateway-grid">
          {GATEWAYS.map((gateway) => {
            const isLoading = loadingGateway === gateway.id;
            return (
              <button
                key={gateway.id}
                className="gateway-btn"
                onClick={() => payWithGateway(gateway)}
                disabled={!!loadingGateway}
              >
                <img
                  src={gateway.logo}
                  alt={`${gateway.name} logo`}
                  className="gateway-logo"
                />
                <span className="gateway-name">{gateway.name}</span>
                {isLoading && <span className="spinner-small" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;