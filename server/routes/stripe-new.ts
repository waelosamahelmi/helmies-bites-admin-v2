import express from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { restaurantSettings, orders, orderItems, menuItems, branches } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { sendOrderConfirmationEmail } from '../email-service';

const router = express.Router();
const webhookRouter = express.Router();

// Helper function to get Stripe instance with keys from database
async function getStripeInstance(): Promise<Stripe | null> {
  try {
    const settings = await db.select().from(restaurantSettings).limit(1);
    if (!settings[0]?.stripeSecretKey) {
      console.error('❌ Stripe secret key not found in database');
      return null;
    }
    return new Stripe(settings[0].stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });
  } catch (error) {
    console.error('❌ Error fetching Stripe settings from database:', error);
    return null;
  }
}

// Validate Stripe API keys
router.post('/validate-keys', async (req, res) => {
  try {
    const { publishableKey, secretKey } = req.body;

    if (!publishableKey || !secretKey) {
      return res.status(400).json({
        error: 'Missing keys',
        message: 'Both publishable and secret keys are required'
      });
    }

    // Validate key formats
    const pubKeyPrefix = publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_');
    const secKeyPrefix = secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_');

    if (!pubKeyPrefix || !secKeyPrefix) {
      return res.status(400).json({
        error: 'Invalid key format',
        message: 'Keys must start with pk_test_/pk_live_ or sk_test_/sk_live_'
      });
    }

    // Test the secret key by making an API call
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Try to retrieve account info
    const account = await stripe.accounts.retrieve();

    res.json({
      valid: true,
      testMode: secretKey.startsWith('sk_test_'),
      accountId: account.id,
      country: account.country,
    });
  } catch (error) {
    console.error('❌ Stripe key validation error:', error);
    res.status(400).json({
      error: 'Invalid keys',
      message: error instanceof Error ? error.message : 'Keys are not valid'
    });
  }
});

// Get Stripe publishable key (for frontend)
router.get('/config', async (req, res) => {
  try {
    const settings = await db.select().from(restaurantSettings).limit(1);
    
    if (!settings[0]?.stripePublishableKey) {
      return res.status(404).json({ 
        error: 'Stripe not configured',
        message: 'Please configure Stripe keys in restaurant settings'
      });
    }

    res.json({
      publishableKey: settings[0].stripePublishableKey,
      testMode: settings[0].stripeTestMode ?? true,
    });
  } catch (error) {
    console.error('❌ Error fetching Stripe config:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Stripe configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('📝 Create payment intent request:', { 
      amount: req.body.amount, 
      currency: req.body.currency,
      metadata: req.body.metadata 
    });

    const { amount, currency = 'eur', metadata = {}, forcePaymentMethods, paymentMethodTypes } = req.body;

    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    console.log('🔑 Getting Stripe instance...');
    const stripe = await getStripeInstance();
    if (!stripe) {
      console.error('❌ Stripe instance is null - keys not configured');
      return res.status(500).json({ 
        error: 'Stripe not configured',
        message: 'Please configure Stripe keys in restaurant settings'
      });
    }

    console.log('✅ Stripe instance obtained successfully');

    // Create payment intent with automatic or manual payment methods
    // Stripe will show payment methods based on:
    // 1. What's enabled in Stripe Dashboard (Payment Methods settings)
    // 2. Customer's location (can be overridden with forcePaymentMethods)
    // 3. Currency and amount
    
    const paymentIntentOptions: any = {
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        integration: 'babylon_restaurant',
      },
    };

    // If forcePaymentMethods is provided (for testing), use specific methods
    // Otherwise use automatic payment methods with explicit types if provided
    if (forcePaymentMethods && Array.isArray(forcePaymentMethods)) {
      console.log('🧪 Testing mode: Forcing payment methods:', forcePaymentMethods);
      paymentIntentOptions.payment_method_types = forcePaymentMethods;
    } else if (paymentMethodTypes && Array.isArray(paymentMethodTypes) && paymentMethodTypes.length > 0) {
      console.log('📋 Explicit payment methods requested:', paymentMethodTypes);
      paymentIntentOptions.payment_method_types = paymentMethodTypes;
    } else {
      paymentIntentOptions.automatic_payment_methods = {
        enabled: true, // This enables all payment methods configured in Stripe Dashboard
        allow_redirects: 'always', // Enable redirect-based payment methods (bank transfers, SEPA, etc.)
      };
    }

    console.log('💳 Creating payment intent with options:', JSON.stringify(paymentIntentOptions, null, 2));
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);

    console.log('✅ Payment intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error:', JSON.stringify(error, null, 2));
    
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Retrieve payment intent status
router.get('/payment-intent/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe not configured',
        message: 'Please configure Stripe keys in restaurant settings'
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    console.error('❌ Error retrieving payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve payment intent',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Refund a payment (for cancelled orders)
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        error: 'Payment intent ID required',
        message: 'Please provide a payment intent ID to refund'
      });
    }

    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe not configured',
        message: 'Please configure Stripe keys in restaurant settings'
      });
    }

    // Create refund
    // If amount is not specified, Stripe will refund the entire amount
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason: reason as Stripe.RefundCreateParams.Reason,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundParams);

    console.log('✅ Refund created:', refund.id);

    res.json({
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount,
      currency: refund.currency,
    });
  } catch (error) {
    console.error('❌ Error creating refund:', error);
    res.status(500).json({ 
      error: 'Failed to create refund',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Webhook handler for Stripe events - use webhookRouter to separate from other routes
webhookRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('❌ No Stripe signature in webhook request');
    return res.status(400).send('No signature');
  }

  try {
    const settings = await db.select().from(restaurantSettings).limit(1);
    const webhookSecret = settings[0]?.stripeWebhookSecret;

    if (!webhookSecret) {
      console.error('❌ Webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).send('Stripe not configured');
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    console.log(`🔔 Webhook received: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ PaymentIntent succeeded:', paymentIntent.id);
        console.log('📦 Metadata:', paymentIntent.metadata);

        // Try to find and update order - use multiple lookup strategies
        try {
          let orderToUpdate = null;

          // Strategy 1: Look up by orderId in metadata (primary method)
          if (paymentIntent.metadata.orderId) {
            console.log(`🔍 Looking up order by ID: ${paymentIntent.metadata.orderId}`);
            const result = await db.select()
              .from(orders)
              .where(eq(orders.id, parseInt(paymentIntent.metadata.orderId)))
              .limit(1);
            orderToUpdate = result[0];
          }

          // Strategy 2: Fallback - look up by stripe_payment_intent_id
          if (!orderToUpdate) {
            console.log(`🔍 Fallback: Looking up order by payment intent ID: ${paymentIntent.id}`);
            const result = await db.select()
              .from(orders)
              .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
              .limit(1);
            orderToUpdate = result[0];
          }

          if (orderToUpdate) {
            // Only update if not already paid (prevent duplicate processing)
            if (orderToUpdate.paymentStatus !== 'paid') {
              await db.update(orders)
                .set({
                  paymentStatus: 'paid',
                  stripePaymentIntentId: paymentIntent.id,
                })
                .where(eq(orders.id, orderToUpdate.id));

              console.log(`✅ Order #${orderToUpdate.id} (${orderToUpdate.orderNumber}) marked as paid`);

              // Notify admins of the paid order
              const notifyAdmins = (app as any).notifyAdminsNewOrder;
              if (notifyAdmins) {
                console.log('📢 Notifying admins of paid order:', orderToUpdate.orderNumber);
                // Refresh order data to get latest state
                const refreshedOrder = await db.select()
                  .from(orders)
                  .where(eq(orders.id, orderToUpdate.id))
                  .limit(1);
                if (refreshedOrder[0]) {
                  notifyAdmins(refreshedOrder[0]);
                }
              }

              // Send order confirmation email if customer has email
              if (orderToUpdate.customerEmail) {
                try {
                  console.log(`📧 Sending confirmation email to ${orderToUpdate.customerEmail}`);

                  // Fetch order items with menu item details
                  const items = await db.select()
                    .from(orderItems)
                    .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
                    .where(eq(orderItems.orderId, orderToUpdate.id));

                  // Fetch branch info if available
                  let branchInfo = null;
                  if (orderToUpdate.branchId) {
                    const branchResult = await db.select()
                      .from(branches)
                      .where(eq(branches.id, orderToUpdate.branchId))
                      .limit(1);
                    branchInfo = branchResult[0];
                  }

                  // Prepare email data
                  const emailData = {
                    orderNumber: orderToUpdate.orderNumber || `#${orderToUpdate.id}`,
                    customerName: orderToUpdate.customerName,
                    customerEmail: orderToUpdate.customerEmail,
                    items: items.map(item => ({
                      name: item.menu_items?.name || 'Item',
                      quantity: item.order_items.quantity,
                      price: parseFloat(item.order_items.unitPrice),
                      totalPrice: parseFloat(item.order_items.totalPrice),
                      toppings: item.order_items.toppings as Array<{ name: string; price: number; }> || [],
                    })),
                    subtotal: parseFloat(orderToUpdate.subtotal),
                    deliveryFee: parseFloat(orderToUpdate.deliveryFee || '0'),
                    totalAmount: parseFloat(orderToUpdate.totalAmount),
                    orderType: orderToUpdate.orderType as 'delivery' | 'pickup',
                    deliveryAddress: orderToUpdate.deliveryAddress || undefined,
                  };

                  const emailSent = await sendOrderConfirmationEmail(emailData);
                  if (emailSent) {
                    console.log(`✅ Confirmation email sent successfully`);
                  } else {
                    console.error(`❌ Failed to send confirmation email`);
                  }
                } catch (emailError) {
                  console.error('❌ Error sending confirmation email:', emailError);
                }
              }
            } else {
              console.log(`ℹ️ Order #${orderToUpdate.id} already marked as paid, skipping`);
            }
          } else {
            console.error(`❌ Could not find order for payment intent ${paymentIntent.id}`);
            console.error(`   Metadata orderId: ${paymentIntent.metadata.orderId || 'missing'}`);
          }
        } catch (error) {
          console.error('❌ Error updating order status:', error);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ PaymentIntent failed:', paymentIntent.id);
        
        // Update order status to payment_failed
        if (paymentIntent.metadata.orderId) {
          try {
            await db.update(orders)
              .set({ 
                paymentStatus: 'failed',
                stripePaymentIntentId: paymentIntent.id,
              })
              .where(eq(orders.id, parseInt(paymentIntent.metadata.orderId)));
            
            console.log(`❌ Order ${paymentIntent.metadata.orderId} marked as payment failed`);
          } catch (error) {
            console.error('❌ Error updating order status:', error);
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('💰 Charge refunded:', charge.id);
        
        // Update order status to refunded
        if (charge.metadata.orderId) {
          try {
            await db.update(orders)
              .set({ 
                paymentStatus: 'refunded',
                status: 'cancelled',
              })
              .where(eq(orders.id, parseInt(charge.metadata.orderId)));
            
            console.log(`💰 Order ${charge.metadata.orderId} marked as refunded`);
          } catch (error) {
            console.error('❌ Error updating order status:', error);
          }
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log('⚠️ Dispute created:', dispute.id);
        // TODO: Notify admin about dispute
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Sync payments from Stripe - fetch all payment intents and compare with database
router.get('/sync-payments', async (req, res) => {
  try {
    console.log('🔄 Starting Stripe payment sync...');

    // Get Stripe instance
    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe not configured',
        message: 'Stripe is not properly configured'
      });
    }

    // Fetch all payment intents from Stripe (last 100, you can paginate if needed)
    console.log('📥 Fetching payment intents from Stripe...');
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });

    console.log(`✅ Found ${paymentIntents.data.length} payment intents in Stripe`);

    // Get all orders from database
    const allOrders = await db.select().from(orders);
    console.log(`📊 Found ${allOrders.length} orders in database`);

    const syncResults = {
      total_stripe_payments: paymentIntents.data.length,
      total_db_orders: allOrders.length,
      updated: 0,
      already_synced: 0,
      not_found_in_db: [] as string[],
      errors: [] as any[]
    };

    // Process each payment intent
    for (const pi of paymentIntents.data) {
      try {
        // Only process succeeded payments
        if (pi.status !== 'succeeded') {
          continue;
        }

        // Find matching order in database by payment intent ID
        const matchingOrders = allOrders.filter(
          order => order.stripePaymentIntentId === pi.id
        );

        if (matchingOrders.length === 0) {
          // Payment exists in Stripe but not in our database
          syncResults.not_found_in_db.push(pi.id);
          console.log(`⚠️ Payment intent ${pi.id} not found in database`);
          continue;
        }

        // Update order status if it's still pending
        for (const order of matchingOrders) {
          if (order.paymentStatus === 'pending_payment') {
            await db.update(orders)
              .set({ paymentStatus: 'paid' })
              .where(eq(orders.id, order.id));

            syncResults.updated++;
            console.log(`✅ Updated order #${order.id} to paid (was pending_payment)`);
          } else if (order.paymentStatus === 'paid') {
            syncResults.already_synced++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing payment intent ${pi.id}:`, error);
        syncResults.errors.push({
          payment_intent_id: pi.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('🎉 Sync completed!');
    console.log(`   Updated: ${syncResults.updated}`);
    console.log(`   Already synced: ${syncResults.already_synced}`);
    console.log(`   Not found in DB: ${syncResults.not_found_in_db.length}`);
    console.log(`   Errors: ${syncResults.errors.length}`);

    res.json({
      success: true,
      ...syncResults
    });
  } catch (error) {
    console.error('❌ Error syncing payments:', error);
    res.status(500).json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all payments from Stripe with details
router.get('/stripe-payments', async (req, res) => {
  try {
    console.log('💳 Fetching all payment intents from Stripe...');

    // Get Stripe instance
    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe not configured',
        message: 'Stripe is not properly configured'
      });
    }

    // Fetch payment intents from Stripe
    const limit = parseInt(req.query.limit as string) || 100;
    const paymentIntents = await stripe.paymentIntents.list({
      limit,
    });

    // Get all orders from database
    const allOrders = await db.select().from(orders);

    // Map payment intents with database order info
    const paymentsWithOrderInfo = paymentIntents.data.map(pi => {
      const matchingOrder = allOrders.find(
        order => order.stripePaymentIntentId === pi.id
      );

      return {
        stripe_payment_intent_id: pi.id,
        stripe_status: pi.status,
        stripe_amount: pi.amount / 100, // Convert from cents to euros
        stripe_currency: pi.currency,
        stripe_created: new Date(pi.created * 1000).toISOString(),
        stripe_customer_email: pi.receipt_email || null,
        stripe_description: pi.description || null,
        stripe_metadata: pi.metadata || {},
        db_order_id: matchingOrder?.id || null,
        db_order_number: matchingOrder?.orderNumber || null,
        db_payment_status: matchingOrder?.paymentStatus || null,
        db_customer_name: matchingOrder?.customerName || null,
        db_customer_email: matchingOrder?.customerEmail || null,
        is_synced: matchingOrder
          ? (pi.status === 'succeeded' && matchingOrder.paymentStatus === 'paid')
          : false,
        needs_sync: matchingOrder
          ? (pi.status === 'succeeded' && matchingOrder.paymentStatus === 'pending_payment')
          : false,
      };
    });

    // Count statistics
    const stats = {
      total_stripe_payments: paymentIntents.data.length,
      succeeded_in_stripe: paymentsWithOrderInfo.filter(p => p.stripe_status === 'succeeded').length,
      synced: paymentsWithOrderInfo.filter(p => p.is_synced).length,
      needs_sync: paymentsWithOrderInfo.filter(p => p.needs_sync).length,
      not_in_db: paymentsWithOrderInfo.filter(p => !p.db_order_id).length,
    };

    console.log('📊 Stripe payments stats:', stats);

    res.json({
      success: true,
      stats,
      payments: paymentsWithOrderInfo
    });
  } catch (error) {
    console.error('❌ Error fetching Stripe payments:', error);
    res.status(500).json({
      error: 'Failed to fetch payments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Link a Stripe payment intent to an existing order
router.post('/link-payment', express.json(), async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    console.log('🔗 Link payment request:', { paymentIntentId, orderId });

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Both payment intent ID and order ID are required'
      });
    }

    // Verify the payment intent exists in Stripe
    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe not configured',
        message: 'Stripe is not properly configured'
      });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Update order with payment intent ID
      await db.update(orders)
        .set({
          stripePaymentIntentId: paymentIntentId,
          paymentStatus: paymentIntent.status === 'succeeded' ? 'paid' : 'pending_payment'
        })
        .where(eq(orders.id, orderId));

      console.log(`✅ Linked payment intent ${paymentIntentId} to order #${orderId}`);

      res.json({
        success: true,
        message: 'Payment linked successfully',
        paymentStatus: paymentIntent.status === 'succeeded' ? 'paid' : 'pending_payment'
      });
    } catch (error) {
      console.error('❌ Error linking payment:', error);
      res.status(400).json({
        error: 'Failed to link payment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('❌ Error in link-payment endpoint:', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
export { webhookRouter };
