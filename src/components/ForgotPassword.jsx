import React, { useState } from 'react';
import './ForgotPassword.css'; // Import CSS specific to ForgotPassword

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = ({ onBackClick }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, newPassword }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Failed to parse JSON response:', jsonErr);
        // If response is not JSON (e.g. HTML error page), show generic error
        setError('Unexpected server response. Please try again later.');
        setLoading(false);
        return;
      }

      if (res.ok && data.success) {
        setMessage('Password reset successfully. You can now log in.');
        setEmail('');
        setNewPassword('');
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="forgot-password-form"
      style={{
        maxWidth: 350,
        margin: '40px auto',
        background: '#fff',
        borderRadius: 10,
        padding: 24,
        boxShadow: '0 2px 8px #0001',
      }}
    >
      <h2>Reset Password</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            marginBottom: 16,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #ccc',
          }}
        />
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New password"
            value={newPassword}
            required
            minLength={8}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 36px 10px 10px',
              borderRadius: 8,
              border: '1px solid #ccc',
            }}
          />
          <div
            type="button"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
            }}
            onClick={() => setShowPassword((v) => !v)}
            className="toggle-password"
            tabIndex={-1}
          >
            {showPassword ? (
              <img
                src="/assets/icons8-eye-50.png"
                style={{ width: '24px', height: '24px' }}
                alt="hide password"
              />
            ) : (
              <img
                src="/assets/icons8-closed-eye-50.png"
                style={{ width: '24px', height: '24px' }}
                alt="show password"
              />
            )}
          </div>
        </div>
        <button
          type="submit"
          className="form-button"
          style={{ width: '100%', marginBottom: 12 }}
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        <button
          type="button"
          className="cancel-button"
          style={{ width: '100%' }}
          onClick={onBackClick}
          disabled={loading}
        >
          Back
        </button>
        {message && (
          <div style={{ color: 'green', marginTop: 10 }}>{message}</div>
        )}
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
};

export default ForgotPassword;
