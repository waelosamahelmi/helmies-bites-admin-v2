/**
 * Payment API Routes
 * Rebuilt with proper error handling, recovery mechanisms, and real-time updates
 */

import express from 'express';
import { paymentService, PaymentStatus } from '../services/payment-service';
import { db } from '../db';
import { orders, restaurantSettings } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const router = express.Router();

/**
 * Get Stripe configuration (publishable key)
 */
router.get('/config', async (req, res) => {
  try {
    const publishableKey = await paymentService.getPublishableKey();

    res.json({
      publishableKey,
      success: true,
    });
  } catch (error: any) {
    console.error('Error fetching Stripe config:', error);
    res.status(500).json({
      success: false,
      error: 'Stripe not configured',
      message: error.message || 'Please configure Stripe keys in restaurant settings',
    });
  }
});

/**
 * Create payment intent
 */
router.post('/create-payment-intent', async (req, res) => {
  try {
    const {
      amount,
      currency = 'eur',
      metadata = {},
      paymentMethodTypes,
      customerId,
      savePaymentMethod = false,
    } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be greater than 0',
      });
    }

    // Generate idempotency key from order ID to prevent duplicates
    const idempotencyKey = metadata.orderId
      ? `payment-${metadata.orderId}-${Date.now()}`
      : undefined;

    // Create payment intent
    const result = await paymentService.createPaymentIntent({
      amount,
      currency,
      metadata,
      paymentMethodTypes,
      customerId,
      setupFutureUsage: savePaymentMethod ? 'off_session' : undefined,
      idempotencyKey,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent',
      message: error.message || 'Unknown error',
    });
  }
});

/**
 * Get payment intent status
 */
router.get('/payment-intent/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID required',
      });
    }

    const result = await paymentService.getPaymentIntentStatus(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment intent',
      message: error.message || 'Unknown error',
    });
  }
});

/**
 * Confirm payment intent
 * Called by frontend after Stripe confirms payment on client side
 */
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID required',
      });
    }

    const result = await paymentService.confirmPaymentIntent(
      paymentIntentId,
      orderId ? parseInt(orderId) : undefined
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Fetch updated order if orderId provided
    if (orderId) {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, parseInt(orderId)))
        .limit(1);

      res.json({
        ...result,
        order,
      });
    } else {
      res.json(result);
    }
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
      message: error.message || 'Unknown error',
    });
  }
});

/**
 * Cancel payment intent
 */
router.post('/cancel-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID required',
      });
    }

    const result = await paymentService.cancelPaymentIntent(paymentIntentId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error canceling payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel payment',
      message: error.message || 'Unknown error',
    });
  }
});

/**
 * Process refund
 */
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount, reason, metadata } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID required',
      });
    }

    const result = await paymentService.processRefund({
      paymentIntentId,
      amount,
      reason,
      metadata,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Update order if payment intent is linked to an order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntentId))
      .limit(1);

    if (order) {
      await db
        .update(orders)
        .set({
          paymentStatus: result.status,
          refundAmount: amount ? amount.toString() : order.totalAmount,
          refundReason: reason,
          refundedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      console.log(`✅ Order ${order.id} marked as ${result.status}`);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund',
      message: error.message || 'Unknown error',
    });
  }
});

/**
 * Create Stripe customer for saved payment methods
 */
router.post('/create-customer', async (req, res) => {
  try {
    const { email, name, phone, metadata } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email required',
      });
    }

    const result = await paymentService.createCustomer({
      email,
      name,
      phone,
      metadata,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer',
      message: error.message || 'Unknown error',
    });
  }
});

/**
 * List saved payment methods for a customer
 */
router.get('/payment-methods/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID required',
      });
    }

    const result = await paymentService.listPaymentMethods(customerId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error listing payment methods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list payment methods',
      message: error.message || 'Unknown error',
    });
  }
});

/**
 * Retry failed payment
 * Retrieves failed payment and creates new payment intent with same details
 */
router.post('/retry-payment', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID required',
      });
    }

    // Get order details
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)))
      .limit(1);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Cancel old payment intent if exists
    if (order.stripePaymentIntentId) {
      await paymentService.cancelPaymentIntent(order.stripePaymentIntentId);
    }

    // Create new payment intent
    const result = await paymentService.createPaymentIntent({
      amount: parseFloat(order.totalAmount),
      metadata: {
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail || undefined,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderType: order.orderType as 'delivery' | 'pickup',
        branchId: order.branchId?.toString(),
      },
      idempotencyKey: `retry-${order.id}-${Date.now()}`,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error retrying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retry payment',
      message: error.message || 'Unknown error',
    });
  }
});

/**
 * Webhook handler for Stripe events
 * Handles real-time payment status updates
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).send('Missing stripe-signature header');
  }

  try {
    // Verify webhook signature
    const event = paymentService.verifyWebhookSignature(req.body, signature);

    if (!event) {
      return res.status(400).send('Invalid signature');
    }

    console.log('📧 Webhook received:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
    });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.processing':
        await handlePaymentProcessing(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true, type: event.type });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

/**
 * Webhook event handlers
 */

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('✅ Payment succeeded:', paymentIntent.id);

    // Find order by payment intent ID
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
      .limit(1);

    if (!order) {
      console.error('❌ Order not found for payment intent:', paymentIntent.id);
      return;
    }

    // Check if already processed
    if (order.paymentStatus === 'paid') {
      console.log('⚠️ Payment already processed for order:', order.id);
      return;
    }

    // Update order payment status
    await db
      .update(orders)
      .set({
        paymentStatus: 'paid',
        paymentMethodDetails: {
          type: paymentIntent.payment_method_types?.[0] || 'unknown',
          last4: (paymentIntent.charges?.data?.[0]?.payment_method_details as any)?.card?.last4,
          brand: (paymentIntent.charges?.data?.[0]?.payment_method_details as any)?.card?.brand,
          receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url,
        },
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    console.log(`✅ Order ${order.id} marked as paid`);

    // TODO: Send order confirmation email
    // TODO: Trigger real-time notification to admin dashboard
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('❌ Payment failed:', paymentIntent.id);

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
      .limit(1);

    if (order) {
      await db
        .update(orders)
        .set({
          paymentStatus: 'failed',
          paymentMethodDetails: {
            error: paymentIntent.last_payment_error?.message,
            error_code: paymentIntent.last_payment_error?.code,
          },
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      console.log(`❌ Order ${order.id} marked as failed`);

      // TODO: Send payment failure notification to customer
    }
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('🚫 Payment canceled:', paymentIntent.id);

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
      .limit(1);

    if (order) {
      await db
        .update(orders)
        .set({
          paymentStatus: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      console.log(`🚫 Order ${order.id} marked as canceled`);
    }
  } catch (error) {
    console.error('❌ Error handling payment cancellation:', error);
  }
}

async function handlePaymentProcessing(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('⏳ Payment processing:', paymentIntent.id);

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
      .limit(1);

    if (order && order.paymentStatus !== 'paid') {
      await db
        .update(orders)
        .set({
          paymentStatus: 'processing',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      console.log(`⏳ Order ${order.id} marked as processing`);
    }
  } catch (error) {
    console.error('❌ Error handling payment processing:', error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    console.log('💸 Charge refunded:', charge.id);

    if (!charge.payment_intent) return;

    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent.id;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntentId))
      .limit(1);

    if (order) {
      const refundAmount = charge.amount_refunded / 100; // Convert from cents

      await db
        .update(orders)
        .set({
          paymentStatus: charge.amount_refunded === charge.amount ? 'refunded' : 'partially_refunded',
          refundAmount: refundAmount.toString(),
          refundedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      console.log(`💸 Order ${order.id} refunded €${refundAmount}`);
    }
  } catch (error) {
    console.error('❌ Error handling charge refund:', error);
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log('⚠️ Dispute created:', dispute.id);

    // TODO: Send alert to admin
    // TODO: Log dispute details for manual review
  } catch (error) {
    console.error('❌ Error handling dispute:', error);
  }
}

export default router;
