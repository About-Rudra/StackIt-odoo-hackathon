import React, { useState } from 'react';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberSession: false,
  });

  const [userType, setUserType] = useState('USER');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          userType: userType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage or sessionStorage
      if (formData.rememberSession) {
        localStorage.setItem('token', data.token);
      } else {
        sessionStorage.setItem('token', data.token);
      }

      alert('✅ Login successful!');
      // Navigate to your dashboard or forum
      window.location.href = '/forum'; // change if using react-router
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    alert('Redirect to Register Page');
    // You can use navigation or redirect here
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">STACKIT</h1>
          <p className="login-subtitle">// COLLABORATIVE LEARNING TERMINAL</p>
        </div>

        <div className="user-type-selector">
          <button
            className={`user-type-btn ${userType === 'USER' ? 'active' : ''}`}
            onClick={() => setUserType('USER')}
            type="button"
          >
            USER
          </button>
          <button
            className={`user-type-btn ${userType === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setUserType('ADMIN')}
            type="button"
          >
            ADMIN
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">USERNAME OR EMAIL</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Enter your username or email"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-options">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="rememberSession"
                name="rememberSession"
                checked={formData.rememberSession}
                onChange={handleInputChange}
              />
              <label htmlFor="rememberSession" className="checkbox-label">
                Remember session
              </label>
            </div>
            <button type="button" className="forgot-password-btn">
              Forgot credentials?
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'INITIALIZE SESSION'}
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">OR</span>
        </div>

        <div className="register-section">
          <span className="register-text">New user? </span>
          <button type="button" className="register-btn" onClick={handleRegister}>
            Register access
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
