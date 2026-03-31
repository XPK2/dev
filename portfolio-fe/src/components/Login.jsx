import React, { useState, useRef } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Auto submit if all 6 filled
    if (value && index === 5 && newCode.every(v => v !== '')) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (fullCode) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await authApi.login(fullCode);
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('username', data.data.username);
        localStorage.setItem('userId', data.data.userId); // Ensure userId is saved
        navigate('/');
      } else {
        setError(data.message || 'Invalid login code');
        resetCode();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError('Connection to Backend (localhost:8080) failed.');
      resetCode();
    } finally {
      setLoading(false);
    }
  };

  const resetCode = () => {
    setCode(['', '', '', '', '', '']);
    setTimeout(() => {
      inputRefs.current[0].focus();
    }, 50);
  };

  return (
    <div className="login-overlay fade-in">
      <div className="glass-panel login-box">
        <Lock size={40} color="var(--primary)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', marginBottom: '8px' }}>Secret Space</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Enter your 6-digit code
        </p>
        
        <div className="digit-container">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="digit-input"
              disabled={loading}
              autoFocus={index === 0}
            />
          ))}
        </div>
        
        {error && <div className="error-text fade-in">{error}</div>}
        {loading && <div className="loading-text fade-in">Verifying...</div>}
      </div>
    </div>
  );
};

export default Login;
