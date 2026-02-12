// src/components/Dashboard.jsx
import React, { useState, useContext } from 'react';
import AuthContext from '../store/auth-context';
import './Dashboard.css';

function Dashboard() {
    const [verificationMessage, setVerificationMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const authCtx = useContext(AuthContext);

    const handleSendVerification = async () => {
        setIsSending(true);
        setVerificationMessage('');

        try {
            const result = await authCtx.resendVerificationEmail();
            
            if (result.success) {
                setVerificationMessage('Verification email sent! Please check your inbox.');
                // Auto-clear message after 5 seconds
                setTimeout(() => setVerificationMessage(''), 5000);
            } else {
                setVerificationMessage(result.message);
            }
        } catch (error) {
            setVerificationMessage('An unexpected error occurred');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="dashboard-container">
            <h1>Welcome to Your Dashboard</h1>
            
            {/* Verify Email Section */}
            <div className="email-verification-section">
                <h2>Email Verification</h2>
                <p>Verify your email address to secure your account and enable password recovery.</p>
                
                <button 
                    onClick={handleSendVerification}
                    disabled={isSending}
                    className="verify-email-btn"
                >
                    {isSending ? 'Sending...' : 'Verify Email ID'}
                </button>
                
                {verificationMessage && (
                    <div className={`verification-message ${verificationMessage.includes('sent') ? 'success' : 'error'}`}>
                        {verificationMessage}
                    </div>
                )}
                
                <p className="verification-instruction">
                    Check your email, you might have received a verification link. Click on it to verify.
                </p>
            </div>

            {/* Other dashboard content can go here */}
        </div>
    );
}

export default Dashboard;