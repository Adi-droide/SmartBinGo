/**
 * Login Handler Module - Authentication
 * 
 * Handles user login, session management, and password validation
 * 
 * File Location: backend/src/modules/auth/LoginHandler.js
 * 
 * @module Authentication/LoginHandler
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginHandler {
  constructor() {
    this.users = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@smartbingo.com',
        password: this.hashPassword('admin123'),
        role: 'admin',
        createdAt: new Date()
      },
      {
        id: 2,
        name: 'Test User',
        email: 'user@smartbingo.com',
        password: this.hashPassword('user123'),
        role: 'user',
        createdAt: new Date()
      },
      {
        id: 3,
        name: 'Operator User',
        email: 'operator@smartbingo.com',
        password: this.hashPassword('operator123'),
        role: 'operator',
        createdAt: new Date()
      }
    ];
    
    this.sessions = new Map();
    this.SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
    this.MAX_LOGIN_ATTEMPTS = 5;
    this.loginAttempts = new Map();
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  hashPassword(password) {
    return bcrypt.hashSync(password, 10);
  }

  /**
   * Verify password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {boolean} Valid or not
   */
  verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  /**
   * User login
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Object} Login result
   */
  login(email, password) {
    // Check rate limiting
    if (this.isAccountLocked(email)) {
      return {
        success: false,
        message: 'Account temporarily locked due to too many failed attempts. Please try again later.'
      };
    }

    // Find user by email
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      this.recordFailedAttempt(email);
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Verify password
    const isValidPassword = this.verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      this.recordFailedAttempt(email);
      return {
        success: false,
        message: 'Invalid email or password',
        attemptsRemaining: this.MAX_LOGIN_ATTEMPTS - (this.loginAttempts.get(email)?.failed || 0)
      };
    }

    // Reset failed attempts on successful login
    this.loginAttempts.delete(email);

    // Generate session token
    const sessionToken = this.generateSessionToken(user);
    
    // Store session
    this.sessions.set(sessionToken, {
      userId: user.id,
      email: user.email,
      role: user.role,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.SESSION_EXPIRY_MS),
      lastActivity: new Date()
    });

    console.log(`✅ User logged in: ${user.email} (${user.role})`);

    return {
      success: true,
      message: 'Login successful',
      sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      expiresIn: this.SESSION_EXPIRY_MS / 1000
    };
  }

  /**
   * Logout user
   * @param {string} sessionToken - Session token to invalidate
   * @returns {Object} Logout result
   */
  logout(sessionToken) {
    if (this.sessions.has(sessionToken)) {
      const session = this.sessions.get(sessionToken);
      console.log(`👋 User logged out: ${session.email}`);
      this.sessions.delete(sessionToken);
    }
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  /**
   * Validate session token
   * @param {string} sessionToken - Session token to validate
   * @returns {Object} Validation result
   */
  validateSession(sessionToken) {
    const session = this.sessions.get(sessionToken);
    
    if (!session) {
      return {
        valid: false,
        message: 'Invalid session'
      };
    }
    
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionToken);
      return {
        valid: false,
        message: 'Session expired'
      };
    }
    
    // Update last activity
    session.lastActivity = new Date();
    this.sessions.set(sessionToken, session);
    
    return {
      valid: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role
      }
    };
  }

  /**
   * Generate JWT session token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateSessionToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'smartbingo-secret-key',
      { expiresIn: '24h' }
    );
  }

  /**
   * Record failed login attempt
   * @param {string} email - User's email
   */
  recordFailedAttempt(email) {
    const attempts = this.loginAttempts.get(email) || { failed: 0, firstAttempt: Date.now() };
    attempts.failed++;
    this.loginAttempts.set(email, attempts);
    
    console.log(`⚠️ Failed login attempt for ${email} (${attempts.failed}/${this.MAX_LOGIN_ATTEMPTS})`);
    
    // Reset after 15 minutes
    if (attempts.failed >= this.MAX_LOGIN_ATTEMPTS) {
      setTimeout(() => {
        this.loginAttempts.delete(email);
        console.log(`🔓 Account unlocked for ${email}`);
      }, 15 * 60 * 1000);
    }
  }

  /**
   * Check if account is locked due to too many failed attempts
   * @param {string} email - User's email
   * @returns {boolean} Locked or not
   */
  isAccountLocked(email) {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;
    
    // Check if within lock window (15 minutes)
    const lockWindow = 15 * 60 * 1000;
    if (Date.now() - attempts.firstAttempt > lockWindow) {
      this.loginAttempts.delete(email);
      return false;
    }
    
    return attempts.failed >= this.MAX_LOGIN_ATTEMPTS;
  }

  /**
   * Change user password
   * @param {string} email - User's email
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Result
   */
  changePassword(email, oldPassword, newPassword) {
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    if (!this.verifyPassword(oldPassword, user.password)) {
      return {
        success: false,
        message: 'Current password is incorrect'
      };
    }
    
    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters'
      };
    }
    
    user.password = this.hashPassword(newPassword);
    
    console.log(`🔐 Password changed for user: ${email}`);
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  /**
   * Get active sessions count
   * @returns {number} Number of active sessions
   */
  getActiveSessionsCount() {
    let active = 0;
    const now = Date.now();
    
    for (const [token, session] of this.sessions) {
      if (now < session.expiresAt) {
        active++;
      } else {
        this.sessions.delete(token);
      }
    }
    
    return active;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [token, session] of this.sessions) {
      if (now > session.expiresAt) {
        this.sessions.delete(token);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
    }
  }

  /**
   * Get session info (for debugging)
   * @param {string} sessionToken - Session token
   * @returns {Object} Session info
   */
  getSessionInfo(sessionToken) {
    const session = this.sessions.get(sessionToken);
    if (!session) {
      return { exists: false };
    }
    
    return {
      exists: true,
      userId: session.userId,
      email: session.email,
      role: session.role,
      expiresIn: Math.max(0, (session.expiresAt - Date.now()) / 1000),
      lastActivity: session.lastActivity
    };
  }
}

// Start cleanup job every hour
const loginHandler = new LoginHandler();
setInterval(() => loginHandler.cleanupExpiredSessions(), 60 * 60 * 1000);

module.exports = loginHandler;
