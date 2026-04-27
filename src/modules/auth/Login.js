// Authentication Module - Login Handler
// Handles user login, session management, and OTP verification

class LoginHandler {
  constructor() {
    this.users = [
      { id: 1, email: 'admin@smartbingo.com', password: 'admin123', role: 'admin' },
      { id: 2, email: 'user@smartbingo.com', password: 'user123', role: 'user' }
    ];
    this.sessions = new Map();
    this.otpStore = new Map();
  }

  // User login
  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    const sessionToken = this.generateSessionToken();
    this.sessions.set(sessionToken, { userId: user.id, role: user.role, expiresAt: Date.now() + 3600000 });
    
    return { success: true, token: sessionToken, user: { id: user.id, email: user.email, role: user.role } };
  }

  // Generate OTP
  generateOTP(phoneNumber) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // BUG FIX: OTP should expire after 120 seconds
    this.otpStore.set(phoneNumber, { otp, expiresAt: Date.now() + 120000 });
    console.log(`📱 OTP for ${phoneNumber}: ${otp} (expires in 120 seconds)`);
    return { success: true, message: 'OTP sent successfully' };
  }

  // Verify OTP
  verifyOTP(phoneNumber, otp) {
    const stored = this.otpStore.get(phoneNumber);
    if (!stored) {
      return { success: false, message: 'OTP not requested' };
    }
    if (Date.now() > stored.expiresAt) {
      return { success: false, message: 'OTP expired' };
    }
    if (stored.otp !== otp) {
      return { success: false, message: 'Invalid OTP' };
    }
    this.otpStore.delete(phoneNumber);
    return { success: true, message: 'OTP verified successfully' };
  }

  generateSessionToken() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  }

  validateSession(token) {
    const session = this.sessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return false;
    }
    return true;
  }

  logout(token) {
    this.sessions.delete(token);
    return { success: true };
  }
}

module.exports = new LoginHandler();
