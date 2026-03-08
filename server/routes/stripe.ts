import express from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { restaurantSettings } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Helper function to get Stripe instance with keys from database
async function getStripeInstance(): Promise<Stripe | null> {
  try {
    const settings = await db.select().from(restaurantSettings).limit(1);
    console.log('🔍 Stripe settings check:', {
      hasSettings: !!settings[0],
      hasSecretKey: !!settings[0]?.stripeSecretKey,
      stripeEnabled: settings[0]?.stripeEnabled,
      secretKeyPrefix: settings[0]?.stripeSecretKey?.substring(0, 10) + '...',
    });
    if (!settings[0]?.stripeSecretKey) {
      console.error('❌ Stripe secret key not found in database');
      return null;
    }
    console.log('✅ Creating Stripe instance with secret key');
    return new Stripe(settings[0].stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });
  } catch (error) {
    console.error('❌ Error fetching Stripe settings from database:', error);
    return null;
  }
}

// Debug endpoint to check Stripe configuration status
router.get('/debug-config', async (req, res) => {
  try {
    const settings = await db.select().from(restaurantSettings).limit(1);
    
    res.json({
      hasSettings: !!settings[0],
      stripeEnabled: settings[0]?.stripeEnabled ?? false,
      hasPublishableKey: !!settings[0]?.stripePublishableKey,
      hasSecretKey: !!settings[0]?.stripeSecretKey,
      hasWebhookSecret: !!settings[0]?.stripeWebhookSecret,
      testMode: settings[0]?.stripeTestMode ?? true,
      publishableKeyPrefix: settings[0]?.stripePublishableKey?.substring(0, 12) || null,
      secretKeyPrefix: settings[0]?.stripeSecretKey?.substring(0, 10) || null,
    });
  } catch (error) {
    console.error('Error checking Stripe config:', error);
    res.status(500).json({ 
      error: 'Failed to check Stripe configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
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
    });
  } catch (error) {
    console.error('Error fetching Stripe config:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Stripe configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'sek', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe not configured',
        message: 'Please configure Stripe keys in restaurant settings'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (cents for EUR)
      currency: currency.toLowerCase(),
      metadata,
      // Finland-specific payment methods only
      payment_method_types: ['card', 'klarna'],
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Confirm payment intent
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID required' });
    }

    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe not configured',
        message: 'Please configure Stripe keys in restaurant settings'
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      paymentIntent,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('No signature header');
  }

  try {
    // Fetch webhook secret from database (same pattern as Stripe keys)
    const settings = await db.select().from(restaurantSettings).limit(1);
    const webhookSecret = settings[0]?.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('❌ Stripe webhook secret not found in database or environment');
      return res.status(400).send('Webhook secret not configured');
    }

    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).send('Stripe not configured');
    }

    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    console.log('📧 Webhook received:', {
      type: event.type,
      id: event.id,
      created: event.created,
    });

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log('💰 Payment succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          payment_method_types: paymentIntent.payment_method_types,
          status: paymentIntent.status,
        });

        try {
          // First check if order already exists with this payment intent
          const { orders } = await import('../../shared/schema');
          const existingOrders = await db.select().from(orders).where(
            eq(orders.stripePaymentIntentId, paymentIntent.id)
          ).limit(1);

          if (existingOrders.length > 0) {
            // Order already exists - update it to paid
            const existingOrder = existingOrders[0];
            console.log('📝 Order already exists, updating payment status:', {
              order_id: existingOrder.id,
              current_status: existingOrder.paymentStatus,
            });

            await db.update(orders).set({
              paymentStatus: 'paid',
            }).where(eq(orders.id, existingOrder.id));

            console.log(`✅ Order #${existingOrder.id} updated to paid`);
            res.json({ received: true, order_id: existingOrder.id });
          } else {
            // No existing order - create new one (Klarna flow)
            const isKlarna = paymentIntent.payment_method_types?.includes('klarna');
            console.log(isKlarna ? '🛍️ KLARNA payment - creating new order' : '🆕 Creating new order from payment');

            // Get order data from metadata
            const orderData = paymentIntent.metadata;
            if (!orderData || !orderData.cart) {
              console.error('❌ No order data in payment intent metadata');
              return res.status(400).json({ error: 'No order data' });
            }

            const order = await createOrderFromPayment(paymentIntent);

            console.log(`✅ Order created: ${order.id}`, {
              payment_method: isKlarna ? 'klarna' : 'card',
              total: order.total,
              customer_email: orderData.customer_email,
            });

            res.json({ received: true, order_id: order.id });
          }
        } catch (orderError) {
          console.error('❌ Failed to process order from payment:', orderError);
          // Return success to Stripe anyway to prevent retries
          res.json({ received: true, error: 'Order processing failed but payment succeeded' });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.error('❌ Payment failed:', {
          id: failedPayment.id,
          last_payment_error: failedPayment.last_payment_error,
        });
        res.json({ received: true });
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object as Stripe.PaymentIntent;
        console.log('🚫 Payment canceled:', canceledPayment.id);
        res.json({ received: true });
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
        res.json({ received: true });
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Helper function to create order from payment intent
async function createOrderFromPayment(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;
  const cart = JSON.parse(metadata.cart || '[]');

  // Import orders table
  const { orders, orderItems } = await import('../../shared/schema');

  // Create order
  const [order] = await db.insert(orders).values({
    customerName: metadata.customer_name || '',
    customerEmail: metadata.customer_email || '',
    customerPhone: metadata.customer_phone || '',
    customerAddress: metadata.customer_address || '',
    orderType: (metadata.order_type as 'delivery' | 'pickup') || 'delivery',
    branchId: metadata.branch_id ? parseInt(metadata.branch_id) : null,
    subtotal: parseFloat(metadata.subtotal || '0'),
    deliveryFee: parseFloat(metadata.delivery_fee || '0'),
    total: paymentIntent.amount / 100, // Convert from cents
    paymentMethod: 'online',
    paymentStatus: 'paid',
    stripePaymentIntentId: paymentIntent.id,
    status: 'pending',
    notes: metadata.notes || '',
  }).returning();

  // Create order items
  const items = cart.map((item: any) => ({
    orderId: order.id,
    menuItemId: item.id,
    quantity: item.quantity,
    price: item.price,
    toppings: item.selectedToppings || [],
    specialInstructions: item.specialInstructions || '',
  }));

  if (items.length > 0) {
    await db.insert(orderItems).values(items);
  }

  return order;
}

export default router;
