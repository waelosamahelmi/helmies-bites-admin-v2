/**
 * Unified Payment Service
 * Handles all payment operations with proper error handling, recovery, and real-time updates
 */

import Stripe from 'stripe';
import { db } from '../db';
import { restaurantSettings, orders, orderItems } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  REQUIRES_ACTION = 'requires_action',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

// Payment method types
export enum PaymentMethodType {
  CARD = 'card',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  KLARNA = 'klarna',
  LINK = 'link',
  IDEAL = 'ideal',
  SEPA_DEBIT = 'sepa_debit',
  CASH = 'cash',
  TERMINAL = 'terminal',
}

interface PaymentIntentMetadata {
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  orderType?: 'delivery' | 'pickup';
  branchId?: string;
  [key: string]: string | undefined;
}

interface CreatePaymentIntentParams {
  amount: number; // Amount in euros (will be converted to cents)
  currency?: string;
  metadata?: PaymentIntentMetadata;
  paymentMethodTypes?: string[];
  customerId?: string; // Stripe Customer ID for saved payment methods
  setupFutureUsage?: 'on_session' | 'off_session'; // For saving payment methods
  idempotencyKey?: string; // For preventing duplicate payments
}

interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  status?: PaymentStatus;
  error?: string;
  errorCode?: string;
  requiresAction?: boolean;
  nextActionType?: string;
}

interface RefundParams {
  paymentIntentId: string;
  amount?: number; // Amount in euros, undefined for full refund
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

export class PaymentService {
  private stripe: Stripe | null = null;
  private stripeConfig: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
    enabled: boolean;
    testMode: boolean;
  } | null = null;

  /**
   * Initialize Stripe with configuration from database
   */
  async initialize(): Promise<void> {
    try {
      const settings = await db.select().from(restaurantSettings).limit(1);
      const config = settings[0];

      if (!config?.stripeSecretKey) {
        console.error('❌ Stripe secret key not found in database');
        this.stripe = null;
        this.stripeConfig = null;
        return;
      }

      this.stripeConfig = {
        secretKey: config.stripeSecretKey,
        publishableKey: config.stripePublishableKey || '',
        webhookSecret: config.stripeWebhookSecret || '',
        enabled: config.stripeEnabled || false,
        testMode: config.stripeTestMode || true,
      };

      this.stripe = new Stripe(this.stripeConfig.secretKey, {
        apiVersion: '2024-11-20.acacia',
        typescript: true,
      });

      console.log('✅ Payment Service initialized', {
        enabled: this.stripeConfig.enabled,
        testMode: this.stripeConfig.testMode,
        hasWebhookSecret: !!this.stripeConfig.webhookSecret,
      });
    } catch (error) {
      console.error('❌ Error initializing Payment Service:', error);
      throw error;
    }
  }

  /**
   * Get Stripe instance (initializes if needed)
   */
  private async getStripe(): Promise<Stripe> {
    if (!this.stripe) {
      await this.initialize();
    }

    if (!this.stripe || !this.stripeConfig?.enabled) {
      throw new Error('Stripe is not configured or disabled');
    }

    return this.stripe;
  }

  /**
   * Get publishable key for frontend
   */
  async getPublishableKey(): Promise<string> {
    if (!this.stripeConfig) {
      await this.initialize();
    }

    if (!this.stripeConfig?.publishableKey) {
      throw new Error('Stripe publishable key not configured');
    }

    return this.stripeConfig.publishableKey;
  }

  /**
   * Create a payment intent with idempotency and error handling
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentResult> {
    try {
      const stripe = await this.getStripe();

      // Validate amount
      if (!params.amount || params.amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount',
          errorCode: 'invalid_amount',
        };
      }

      // Convert amount to cents
      const amountInCents = Math.round(params.amount * 100);

      // Prepare payment intent parameters
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: amountInCents,
        currency: params.currency || 'eur',
        metadata: params.metadata || {},
      };

      // Configure payment methods
      if (params.paymentMethodTypes && params.paymentMethodTypes.length > 0) {
        paymentIntentParams.payment_method_types = params.paymentMethodTypes;
      } else {
        // Enable automatic payment methods with common options
        paymentIntentParams.automatic_payment_methods = {
          enabled: true,
          allow_redirects: 'never', // Keep payments embedded
        };
      }

      // Add customer if provided (for saved payment methods)
      if (params.customerId) {
        paymentIntentParams.customer = params.customerId;
      }

      // Setup for future usage (saving payment methods)
      if (params.setupFutureUsage) {
        paymentIntentParams.setup_future_usage = params.setupFutureUsage;
      }

      // Create payment intent with optional idempotency key
      const requestOptions: Stripe.RequestOptions = {};
      if (params.idempotencyKey) {
        requestOptions.idempotencyKey = params.idempotencyKey;
      }

      const paymentIntent = await stripe.paymentIntents.create(
        paymentIntentParams,
        requestOptions
      );

      console.log('✅ Payment intent created:', {
        id: paymentIntent.id,
        amount: params.amount,
        orderId: params.metadata?.orderId,
        status: paymentIntent.status,
      });

      // Update order with payment intent ID if orderId provided
      if (params.metadata?.orderId) {
        await this.updateOrderPaymentIntent(
          parseInt(params.metadata.orderId),
          paymentIntent.id
        );
      }

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
        status: this.mapStripeStatus(paymentIntent.status),
        requiresAction: paymentIntent.status === 'requires_action',
        nextActionType: paymentIntent.next_action?.type,
      };
    } catch (error: any) {
      console.error('❌ Error creating payment intent:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment intent',
        errorCode: error.code || 'unknown_error',
      };
    }
  }

  /**
   * Retrieve payment intent status
   */
  async getPaymentIntentStatus(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const stripe = await this.getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        requiresAction: paymentIntent.status === 'requires_action',
        nextActionType: paymentIntent.next_action?.type,
      };
    } catch (error: any) {
      console.error('❌ Error retrieving payment intent:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve payment intent',
        errorCode: error.code || 'unknown_error',
      };
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    orderId?: number
  ): Promise<PaymentResult> {
    try {
      const stripe = await this.getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment already succeeded:', paymentIntentId);

        // Update order status if orderId provided
        if (orderId) {
          await this.updateOrderPaymentStatus(orderId, PaymentStatus.SUCCEEDED, paymentIntent);
        }

        return {
          success: true,
          paymentIntentId: paymentIntent.id,
          status: PaymentStatus.SUCCEEDED,
        };
      }

      if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          error: 'Payment requires additional action',
          errorCode: 'requires_action',
          requiresAction: true,
          nextActionType: paymentIntent.next_action?.type,
        };
      }

      if (paymentIntent.status === 'canceled' || paymentIntent.status === 'failed') {
        return {
          success: false,
          error: 'Payment was canceled or failed',
          errorCode: paymentIntent.status,
          status: this.mapStripeStatus(paymentIntent.status),
        };
      }

      return {
        success: false,
        error: `Unexpected payment status: ${paymentIntent.status}`,
        errorCode: 'unexpected_status',
        status: this.mapStripeStatus(paymentIntent.status),
      };
    } catch (error: any) {
      console.error('❌ Error confirming payment intent:', error);
      return {
        success: false,
        error: error.message || 'Failed to confirm payment',
        errorCode: error.code || 'unknown_error',
      };
    }
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const stripe = await this.getStripe();
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

      console.log('✅ Payment intent canceled:', paymentIntentId);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: PaymentStatus.CANCELED,
      };
    } catch (error: any) {
      console.error('❌ Error canceling payment intent:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel payment',
        errorCode: error.code || 'unknown_error',
      };
    }
  }

  /**
   * Process a refund
   */
  async processRefund(params: RefundParams): Promise<PaymentResult> {
    try {
      const stripe = await this.getStripe();

      // Get payment intent to verify amount
      const paymentIntent = await stripe.paymentIntents.retrieve(params.paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return {
          success: false,
          error: 'Can only refund succeeded payments',
          errorCode: 'invalid_status',
        };
      }

      // Prepare refund parameters
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: params.paymentIntentId,
        metadata: params.metadata || {},
      };

      // Add amount if partial refund
      if (params.amount) {
        refundParams.amount = Math.round(params.amount * 100);
      }

      // Add reason if provided
      if (params.reason) {
        refundParams.reason = params.reason;
      }

      const refund = await stripe.refunds.create(refundParams);

      console.log('✅ Refund processed:', {
        id: refund.id,
        paymentIntentId: params.paymentIntentId,
        amount: params.amount ? `€${params.amount}` : 'full',
        status: refund.status,
      });

      return {
        success: true,
        paymentIntentId: params.paymentIntentId,
        status: params.amount ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED,
      };
    } catch (error: any) {
      console.error('❌ Error processing refund:', error);
      return {
        success: false,
        error: error.message || 'Failed to process refund',
        errorCode: error.code || 'unknown_error',
      };
    }
  }

  /**
   * Create a Stripe Customer for saved payment methods
   */
  async createCustomer(params: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      const stripe = await this.getStripe();

      const customer = await stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: params.metadata || {},
      });

      console.log('✅ Stripe customer created:', customer.id);

      return {
        success: true,
        customerId: customer.id,
      };
    } catch (error: any) {
      console.error('❌ Error creating customer:', error);
      return {
        success: false,
        error: error.message || 'Failed to create customer',
      };
    }
  }

  /**
   * List customer's saved payment methods
   */
  async listPaymentMethods(customerId: string): Promise<{
    success: boolean;
    paymentMethods?: Stripe.PaymentMethod[];
    error?: string;
  }> {
    try {
      const stripe = await this.getStripe();

      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return {
        success: true,
        paymentMethods: paymentMethods.data,
      };
    } catch (error: any) {
      console.error('❌ Error listing payment methods:', error);
      return {
        success: false,
        error: error.message || 'Failed to list payment methods',
      };
    }
  }

  /**
   * Update order with payment intent ID
   */
  private async updateOrderPaymentIntent(
    orderId: number,
    paymentIntentId: string
  ): Promise<void> {
    try {
      await db
        .update(orders)
        .set({
          stripePaymentIntentId: paymentIntentId,
          paymentStatus: 'processing',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      console.log(`✅ Order ${orderId} updated with payment intent ${paymentIntentId}`);
    } catch (error) {
      console.error(`❌ Failed to update order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Update order payment status
   */
  private async updateOrderPaymentStatus(
    orderId: number,
    status: PaymentStatus,
    paymentIntent?: Stripe.PaymentIntent
  ): Promise<void> {
    try {
      const updateData: any = {
        paymentStatus: status,
        updatedAt: new Date(),
      };

      // Store payment method details
      if (paymentIntent) {
        updateData.paymentMethodDetails = {
          type: paymentIntent.payment_method_types?.[0] || 'unknown',
          last4: (paymentIntent.charges?.data?.[0]?.payment_method_details as any)?.card?.last4,
          brand: (paymentIntent.charges?.data?.[0]?.payment_method_details as any)?.card?.brand,
          receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url,
        };
      }

      await db.update(orders).set(updateData).where(eq(orders.id, orderId));

      console.log(`✅ Order ${orderId} payment status updated to ${status}`);
    } catch (error) {
      console.error(`❌ Failed to update order ${orderId} status:`, error);
      throw error;
    }
  }

  /**
   * Map Stripe status to internal PaymentStatus
   */
  private mapStripeStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      requires_payment_method: PaymentStatus.PENDING,
      requires_confirmation: PaymentStatus.PENDING,
      requires_action: PaymentStatus.REQUIRES_ACTION,
      processing: PaymentStatus.PROCESSING,
      requires_capture: PaymentStatus.PROCESSING,
      succeeded: PaymentStatus.SUCCEEDED,
      canceled: PaymentStatus.CANCELED,
    };

    return statusMap[stripeStatus] || PaymentStatus.FAILED;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event | null {
    try {
      if (!this.stripe || !this.stripeConfig?.webhookSecret) {
        throw new Error('Webhook secret not configured');
      }

      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.stripeConfig.webhookSecret
      );
    } catch (error: any) {
      console.error('❌ Webhook signature verification failed:', error.message);
      return null;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
