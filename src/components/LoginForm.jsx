import React, { useState } from 'react';
import './LoginForm.css';

const API_URL = import.meta.env.VITE_API_URL;

const LoginForm = ({ onSignUpClick, onResetPasswordClick, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log("🔐 Attempting login for:", username);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // OBLIGATORIU pentru cookie-uri httpOnly/JWT
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      console.log("📨 Server response:", data);

      if (response.ok && data.success) {
        console.log("✅ Login successful for user:", username);
        localStorage.setItem("username", username); // pentru FitFatPage
        onSubmit(username);
      } else {
        console.warn("⚠️ Login failed:", data.message);
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("❌ Error during login request:", error);
      setError("An error occurred while logging in. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Log In</h2>
      <input
        className="login_input"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        style={{ width: '90%' }}
      />
      <div className="password-login" style={{ position: 'relative' }}>
        <input
          className="login_input"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div
          type="button"
          style={{
            position: 'absolute',
            right: '0px',
            top: '40%',
            transform: 'translateY(-50%)'
          }}
          onClick={() => setShowPassword(!showPassword)}
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
      <button type="submit">Log In</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <div className="login-actions">
        <button type="button" onClick={onSignUpClick}>
          Sign Up
        </button>
        <button type="button" onClick={onResetPasswordClick}>
          Forgot Password?
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
