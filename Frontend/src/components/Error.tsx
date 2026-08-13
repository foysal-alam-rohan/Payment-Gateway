import React from 'react';

const Error: React.FC = () => {
  const searchData = new URLSearchParams(window.location.search);
  const message: string | null = searchData.get('message');

  return (
    <div className="app-container">
      <div className="card">
        <span className="status-icon error">❌</span>
        <h1>Payment Failed</h1>
        <p className="subtitle">We couldn't process your payment.</p>
        <div className="status-message">
          {message ?? 'Something went wrong. Please try again.'}
        </div>
        <a href="/" className="link-back">← Try again</a>
      </div>
    </div>
  );
};

export default Error;