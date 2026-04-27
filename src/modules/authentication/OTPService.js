/**
 * OTP Service Module - Authentication
 * 
 * Handles One-Time Password generation, verification, and expiration
 * 
 * Bug Reported: OTP expires too fast (30 seconds)
 * Fix: Increased expiry time to 120 seconds
 * 
 * File Location: backend/src/modules/auth/OTPService.js
 * 
 * @module Authentication/OTPService
 */

class OTPService {
  constructor() {
    this.otpStore = new Map();
    // BUG FIX: Changed from 30000ms (30 seconds) to 120000ms (120 seconds)
    this.OTP_EXPIRY_MS = 120000; // 120 seconds - FIXED for mobile users
    this.MAX_ATTEMPTS = 5;
    this.attemptCount = new Map();
  }

  /**
   * Generate and send OTP to user's phone
   * @param {string} phoneNumber - User's mobile number
   * @returns {Object} Result with OTP (for demo) or success message
   */
  generateOTP(phoneNumber) {
    // Validate phone number
    if (!this.validatePhoneNumber(phoneNumber)) {
      return {
        success: false,
        message: 'Invalid phone number format'
      };
    }

    // Check rate limiting
    if (this.isRateLimited(phoneNumber)) {
      return {
        success: false,
        message: 'Too many attempts. Please try again later.'
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calculate expiry time
    const expiresAt = Date.now() + this.OTP_EXPIRY_MS;
    
    // Store OTP with metadata
    this.otpStore.set(phoneNumber, {
      otp,
      expiresAt,
      generatedAt: new Date(),
      attempts: 0,
      verified: false
    });

    // BUG FIX: Log OTP for demo (in production, send via SMS)
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
    console.log(`⏰ OTP expires in ${this.OTP_EXPIRY_MS / 1000} seconds`);

    return {
      success: true,
      message: 'OTP sent successfully',
      // Only include OTP in response for demo purposes
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      expiresInSeconds: this.OTP_EXPIRY_MS / 1000
    };
  }

  /**
   * Verify OTP entered by user
   * @param {string} phoneNumber - User's mobile number
   * @param {string} enteredOtp - OTP entered by user
   * @returns {Object} Verification result
   */
  verifyOTP(phoneNumber, enteredOtp) {
    const storedData = this.otpStore.get(phoneNumber);
    
    // Check if OTP exists
    if (!storedData) {
      return {
        success: false,
        message: 'OTP not requested. Please request a new OTP.'
      };
    }

    // Check if already verified
    if (storedData.verified) {
      return {
        success: false,
        message: 'OTP already used. Please request a new OTP.'
      };
    }

    // Increment attempt count
    storedData.attempts++;
    
    // Check max attempts
    if (storedData.attempts > this.MAX_ATTEMPTS) {
      this.otpStore.delete(phoneNumber);
      this.updateAttemptCount(phoneNumber, true);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    // BUG FIX: Check if OTP has expired (expiry time increased to 120 seconds)
    if (Date.now() > storedData.expiresAt) {
      this.otpStore.delete(phoneNumber);
      return {
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
        expired: true
      };
    }

    // Verify OTP
    if (storedData.otp !== enteredOtp) {
      this.otpStore.set(phoneNumber, storedData);
      return {
        success: false,
        message: 'Invalid OTP. Please try again.',
        attemptsRemaining: this.MAX_ATTEMPTS - storedData.attempts
      };
    }

    // OTP verified successfully
    storedData.verified = true;
    storedData.verifiedAt = new Date();
    this.otpStore.set(phoneNumber, storedData);
    
    console.log(`✅ OTP verified for ${phoneNumber}`);
    
    // Generate session token
    const sessionToken = this.generateSessionToken(phoneNumber);
    
    return {
      success: true,
      message: 'OTP verified successfully',
      sessionToken,
      expiresIn: this.OTP_EXPIRY_MS / 1000
    };
  }

  /**
   * Resend OTP (with rate limiting)
   * @param {string} phoneNumber - User's mobile number
   * @returns {Object} Result
   */
  resendOTP(phoneNumber) {
    // Delete existing OTP
    this.otpStore.delete(phoneNumber);
    
    // Generate new OTP
    return this.generateOTP(phoneNumber);
  }

  /**
   * Check if user is rate limited
   * @param {string} phoneNumber - User's mobile number
   * @returns {boolean} True if rate limited
   */
  isRateLimited(phoneNumber) {
    const attempts = this.attemptCount.get(phoneNumber) || 0;
    return attempts >= 3; // Max 3 OTP requests per hour
  }

  /**
   * Update attempt count for rate limiting
   * @param {string} phoneNumber - User's mobile number
   * @param {boolean} reset - Reset counter
   */
  updateAttemptCount(phoneNumber, reset = false) {
    if (reset) {
      this.attemptCount.delete(phoneNumber);
      return;
    }
    
    const current = this.attemptCount.get(phoneNumber) || 0;
    this.attemptCount.set(phoneNumber, current + 1);
    
    // Reset after 1 hour
    setTimeout(() => {
      this.attemptCount.delete(phoneNumber);
    }, 3600000);
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} Valid or not
   */
  validatePhoneNumber(phoneNumber) {
    // Basic validation for Indian mobile numbers
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Generate session token after successful verification
   * @param {string} phoneNumber - User's mobile number
   * @returns {string} Session token
   */
  generateSessionToken(phoneNumber) {
    return `sess_${Date.now()}_${phoneNumber}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get OTP status for debugging
   * @param {string} phoneNumber - User's mobile number
   * @returns {Object} OTP status
   */
  getOTPStatus(phoneNumber) {
    const storedData = this.otpStore.get(phoneNumber);
    if (!storedData) {
      return { exists: false };
    }
    
    const now = Date.now();
    return {
      exists: true,
      verified: storedData.verified,
      expired: now > storedData.expiresAt,
      expiresInSeconds: Math.max(0, (storedData.expiresAt - now) / 1000),
      attemptsUsed: storedData.attempts
    };
  }

  /**
   * Clean up expired OTPs (run periodically)
   */
  cleanupExpiredOTPs() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [phone, data] of this.otpStore) {
      if (now > data.expiresAt) {
        this.otpStore.delete(phone);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired OTPs`);
    }
  }

  /**
   * Get OTP expiry configuration
   * @returns {Object} Expiry configuration
   */
  getOTPConfig() {
    return {
      expirySeconds: this.OTP_EXPIRY_MS / 1000,
      maxAttempts: this.MAX_ATTEMPTS,
      rateLimitPerHour: 3
    };
  }
}

// Start cleanup job every 5 minutes
const otpService = new OTPService();
setInterval(() => otpService.cleanupExpiredOTPs(), 5 * 60 * 1000);

module.exports = otpService;
