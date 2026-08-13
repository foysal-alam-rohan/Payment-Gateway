import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Success: React.FC = () => {
  const [message, setMessage] = useState('Thank you for your payment. You will receive a confirmation shortly.');
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setIsSyncing(false);
      return;
    }

    const syncPayment = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/stripe/query-payment/${sessionId}`, {
          withCredentials: true,
        });

        if (data?.success && data?.data?.status === 'complete') {
          setMessage('Your payment was completed successfully and the database has been updated.');
        } else if (data?.data?.status === 'expired') {
          setMessage('This payment session has expired. Please try again.');
        } else {
          setMessage('Your payment was received, but the status is still being verified.');
        }
      } catch (error) {
        console.error('Failed to sync Stripe payment status:', error);
        setMessage('Your payment was completed, but we could not verify the database update automatically.');
      } finally {
        setIsSyncing(false);
      }
    };

    void syncPayment();
  }, []);

  return (
    <div className="app-container">
      <div className="card">
        <span className="status-icon success">✅</span>
        <h1>Payment Successful!</h1>
        <p className="subtitle">Your transaction was completed.</p>
        <div className="status-message">
          {isSyncing ? 'Finalizing your payment status...' : message}
        </div>
        <a href="/" className="link-back">← Back to home</a>
      </div>
    </div>
  );
};

export default Success;