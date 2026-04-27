import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      setMessage(`Login successful! Token: ${res.data.token}`);
    } catch (error) {
      setMessage('Login failed: ' + error.response?.data?.message);
    }
  };

  const sendOTP = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/otp/send`, { phone });
      setOtpSent(true);
      setMessage('OTP sent! Check console for code');
    } catch (error) {
      setMessage('Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/otp/verify`, { phone, otp });
      setMessage(res.data.message);
    } catch (error) {
      setMessage('Invalid OTP');
    }
  };

  return (
    <div>
      <h1>Login to SmartBinGo</h1>
      
      <div>
        <h3>Email Login</h3>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
      </div>
      
      <div>
        <h3>OTP Login (Mobile)</h3>
        <input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={sendOTP}>Send OTP</button>
        {otpSent && (
          <>
            <input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button onClick={verifyOTP}>Verify OTP</button>
          </>
        )}
      </div>
      
      <p>{message}</p>
    </div>
  );
}

export default Login;
