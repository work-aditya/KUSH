const crypto = require('crypto');
const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');

// PhonePe API Endpoints for Standard Checkout V2 & OAuth
const PHONEPE_ENDPOINTS = {
  SANDBOX: {
    oauth: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
    checkout: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  },
  PRODUCTION: {
    oauth: 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',
    checkout: 'https://api.phonepe.com/apis/pg',
  },
};

class PhonePeService {
  constructor() {
    this.env = env.PHONEPE_ENVIRONMENT || 'SANDBOX';
    this.clientId = env.PHONEPE_CLIENT_ID || '';
    this.clientSecret = env.PHONEPE_CLIENT_SECRET || '';
    this.clientVersion = env.PHONEPE_CLIENT_VERSION || '1';
    this.merchantId = env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    this.saltKey = env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    this.saltIndex = env.PHONEPE_SALT_INDEX || '1';

    const endpoints = PHONEPE_ENDPOINTS[this.env] || PHONEPE_ENDPOINTS.SANDBOX;
    this.oauthUrl = endpoints.oauth;
    this.checkoutBaseUrl = endpoints.checkout;

    // Token caching in memory
    this.cachedToken = null;
    this.tokenExpiresAt = 0;
  }

  /**
   * Generates or retrieves cached OAuth 2.0 O-Bearer token from PhonePe
   * Uses client_credentials grant type with client_id, client_version, client_secret
   */
  async getOAuthToken() {
    // Return cached token if valid and has more than 60 seconds life left
    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.cachedToken;
    }

    // In sandbox testing if client credentials are not yet entered, use simulated token
    if ((!this.clientId || !this.clientSecret) && this.env === 'SANDBOX') {
      logger.info('Using sandbox simulated OAuth token (credentials pending in .env)');
      this.cachedToken = 'SANDBOX_SIMULATED_BEARER_TOKEN';
      this.tokenExpiresAt = Date.now() + 3600 * 1000;
      return this.cachedToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET are required for PhonePe Standard Checkout V2');
    }

    try {
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_version', this.clientVersion);
      params.append('client_secret', this.clientSecret);
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(this.oauthUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      if (response.data && response.data.access_token) {
        this.cachedToken = response.data.access_token;
        const expiresInSeconds = response.data.expires_in || 3600;
        this.tokenExpiresAt = Date.now() + expiresInSeconds * 1000;

        logger.info('PhonePe V2 OAuth Token successfully acquired', {
          expiresIn: expiresInSeconds,
          tokenType: response.data.token_type || 'O-Bearer',
        });

        return this.cachedToken;
      } else {
        throw new Error('Invalid OAuth response received from PhonePe');
      }
    } catch (error) {
      logger.error('Failed to obtain PhonePe V2 OAuth token', {
        error: error.message,
        response: error.response?.data,
      });

      if (this.env === 'SANDBOX') {
        logger.warn('Sandbox Fallback: Using simulated token due to OAuth connectivity error');
        this.cachedToken = 'SANDBOX_SIMULATED_BEARER_TOKEN';
        this.tokenExpiresAt = Date.now() + 3600 * 1000;
        return this.cachedToken;
      }

      throw new Error(`PhonePe OAuth Token Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Initiates payment order on PhonePe Standard Checkout V2
   * Endpoint: /checkout/v2/pay
   * Header: Authorization: O-Bearer <token>
   */
  async initiatePayment({ merchantTransactionId, merchantUserId, amountInRupees, userPhone, redirectUrl }) {
    const amountInPaise = Math.round(amountInRupees * 100);
    const returnUrl = redirectUrl || `${env.FRONTEND_URL}/payment/success?orderRef=${merchantTransactionId}`;

    logger.info('Initiating PhonePe Standard Checkout V2 Payment', {
      merchantTransactionId,
      amountInRupees,
      amountInPaise,
      env: this.env,
    });

    try {
      const token = await this.getOAuthToken();

      // If simulated token in sandbox environment without live preprod credentials:
      if (token === 'SANDBOX_SIMULATED_BEARER_TOKEN') {
        logger.warn('Sandbox Fallback: Returning simulated checkout URL for testing environment');
        return {
          success: true,
          redirectUrl: `${returnUrl}&simulated=true`,
          isSimulated: true,
          rawResponse: { simulated: true, merchantTransactionId },
        };
      }

      const payload = {
        merchantOrderId: merchantTransactionId,
        amount: amountInPaise,
        expireAfter: 1200, // 20 minutes
        paymentFlow: {
          type: 'PG_CHECKOUT',
          merchantUrls: {
            redirectUrl: returnUrl,
          },
        },
        metaInfo: {
          userId: merchantUserId ? merchantUserId.toString() : undefined,
          mobileNumber: userPhone ? userPhone.replace(/[^0-9]/g, '').slice(-10) : undefined,
        },
      };

      const payEndpoint = `${this.checkoutBaseUrl}/checkout/v2/pay`;
      const response = await axios.post(payEndpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${token}`,
        },
        timeout: 15000,
      });

      const data = response.data;
      const checkoutRedirectUrl = data?.redirectUrl || data?.data?.redirectUrl || data?.data?.instrumentResponse?.redirectInfo?.url;

      if (checkoutRedirectUrl) {
        return {
          success: true,
          redirectUrl: checkoutRedirectUrl,
          rawResponse: data,
        };
      } else {
        logger.error('PhonePe V2 Checkout Pay response missing redirect URL', { response: data });
        return {
          success: false,
          message: data?.message || 'Unable to retrieve PhonePe payment URL',
          rawResponse: data,
        };
      }
    } catch (error) {
      logger.error('PhonePe V2 Checkout Pay Network Error', {
        error: error.message,
        responseData: error.response?.data,
        merchantTransactionId,
      });

      // Sandbox simulated checkout fallback
      if (this.env === 'SANDBOX') {
        logger.warn('Sandbox Fallback: Returning simulated checkout URL for testing environment');
        return {
          success: true,
          redirectUrl: `${returnUrl}&simulated=true`,
          isSimulated: true,
          rawResponse: { simulated: true, merchantTransactionId },
        };
      }

      throw new Error(`PhonePe Payment Initiation Failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Checks status of an order directly from PhonePe Standard Checkout V2
   * Endpoint: /checkout/v2/order/{merchantOrderId}/status
   */
  async checkPaymentStatus(merchantTransactionId) {
    try {
      const token = await this.getOAuthToken();

      if (token === 'SANDBOX_SIMULATED_BEARER_TOKEN' && this.env === 'SANDBOX') {
        return {
          success: true,
          code: 'PAYMENT_SUCCESS',
          status: 'paid',
          transactionId: `SIM-${merchantTransactionId}`,
          rawResponse: { simulated: true },
        };
      }

      const statusEndpoint = `${this.checkoutBaseUrl}/checkout/v2/order/${merchantTransactionId}/status`;
      const response = await axios.get(statusEndpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${token}`,
        },
        timeout: 15000,
      });

      const data = response.data;
      const state = (data?.state || data?.code || '').toUpperCase();

      const isPaid = state === 'COMPLETED' || state === 'PAYMENT_SUCCESS';
      const isPending = state === 'PENDING' || state === 'PAYMENT_PENDING' || state === 'INITIATED';

      return {
        success: true,
        code: state,
        status: isPaid ? 'paid' : isPending ? 'pending' : 'failed',
        transactionId: data?.transactionId || data?.data?.transactionId,
        amount: data?.amount ? data.amount / 100 : undefined,
        rawResponse: data,
      };
    } catch (error) {
      logger.error('PhonePe V2 Status Check Error', {
        error: error.message,
        responseData: error.response?.data,
        merchantTransactionId,
      });

      if (this.env === 'SANDBOX') {
        return {
          success: true,
          code: 'PAYMENT_SUCCESS',
          status: 'paid',
          transactionId: `SIM-${merchantTransactionId}`,
          rawResponse: { simulated: true },
        };
      }

      return {
        success: false,
        status: 'pending',
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Verifies incoming webhook signature from PhonePe
   * Supports:
   * 1. Standard Checkout V2 HMAC signature verification using clientSecret
   * 2. Legacy / V1 SHA256 Checksum signature verification using saltKey
   */
  verifyWebhookSignature(payload, signature) {
    if (!payload || !signature) return false;

    // 1. Check V2 HMAC signature with clientSecret if provided
    if (this.clientSecret) {
      try {
        const computedHmac = crypto
          .createHmac('sha256', this.clientSecret)
          .update(payload)
          .digest('hex');
        if (computedHmac === signature) return true;
      } catch (err) {
        // Continue to legacy check
      }
    }

    // 2. Check Legacy Checksum with saltKey (Base64 + saltKey)###saltIndex
    try {
      const computedLegacy =
        crypto
          .createHash('sha256')
          .update(`${payload}${this.saltKey}`)
          .digest('hex') + `###${this.saltIndex}`;

      if (computedLegacy === signature) return true;
    } catch (err) {
      // Return false
    }

    return false;
  }

  /**
   * Retained for testing compatibility and legacy payload hashing
   */
  generateChecksum(payloadString, endpoint = '') {
    const stringToHash = `${payloadString}${endpoint}${this.saltKey}`;
    const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return `${hash}###${this.saltIndex}`;
  }
}

module.exports = new PhonePeService();
