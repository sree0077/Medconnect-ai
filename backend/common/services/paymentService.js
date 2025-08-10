// Payment Service - Stripe Integration
// This service handles all payment-related operations including subscription management

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');

/**
 * Create a Stripe customer for a user
 */
const createStripeCustomer = async (user) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe not configured');
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });

    // Update user with Stripe customer ID
    await User.findByIdAndUpdate(user._id, {
      'subscription.stripeCustomerId': customer.id,
    });

    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

/**
 * Create a subscription for a user
 */
const createSubscription = async (userId, priceId, paymentMethodId) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      // For development/demo purposes, simulate successful subscription
      return simulateSubscriptionCreation(userId, priceId);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.subscription?.stripeCustomerId;
    
    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await createStripeCustomer(user);
      customerId = customer.id;
    }

    // Attach payment method to customer
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user subscription data
    const tier = getPlanTierFromPriceId(priceId);
    await updateUserSubscriptionData(userId, {
      tier,
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      startDate: new Date(subscription.start_date * 1000),
      nextPaymentDate: new Date(subscription.current_period_end * 1000),
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      status: subscription.status,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Cancel a subscription
 */
const cancelSubscription = async (userId, reason = '') => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    if (process.env.STRIPE_SECRET_KEY) {
      // Cancel at period end to allow user to use remaining time
      await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
        metadata: {
          cancellation_reason: reason,
        },
      });
    }

    // Update user subscription status
    await User.findByIdAndUpdate(userId, {
      'subscription.status': 'cancelled',
      'subscription.cancelledAt': new Date(),
      'subscription.cancelReason': reason,
      'subscription.autoRenew': false,
    });

    // Update detailed subscription record
    await Subscription.findOneAndUpdate(
      { userId },
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason,
        autoRenew: false,
        $push: {
          history: {
            action: 'cancelled',
            reason: reason,
            timestamp: new Date(),
          }
        }
      }
    );

    return { success: true, message: 'Subscription cancelled successfully' };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

/**
 * Handle Stripe webhooks
 */
const handleWebhook = async (event) => {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};

/**
 * Simulate subscription creation for development
 */
const simulateSubscriptionCreation = async (userId, priceId) => {
  const tier = getPlanTierFromPriceId(priceId);
  
  await updateUserSubscriptionData(userId, {
    tier,
    status: 'active',
    stripeSubscriptionId: `sim_sub_${Date.now()}`,
    stripeCustomerId: `sim_cus_${Date.now()}`,
    startDate: new Date(),
    nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  return {
    subscriptionId: `sim_sub_${Date.now()}`,
    clientSecret: null,
    status: 'active',
    simulated: true,
  };
};

/**
 * Get plan tier from Stripe price ID
 */
const getPlanTierFromPriceId = (priceId) => {
  // Map Stripe price IDs to plan tiers
  const priceMapping = {
    [process.env.STRIPE_PRO_PRICE_ID]: 'pro',
    [process.env.STRIPE_CLINIC_PRICE_ID]: 'clinic',
  };
  
  return priceMapping[priceId] || 'pro'; // Default to pro if not found
};

/**
 * Update user subscription data
 */
const updateUserSubscriptionData = async (userId, subscriptionData) => {
  // Update user model
  await User.findByIdAndUpdate(userId, {
    'subscription.tier': subscriptionData.tier,
    'subscription.status': subscriptionData.status,
    'subscription.stripeSubscriptionId': subscriptionData.stripeSubscriptionId,
    'subscription.stripeCustomerId': subscriptionData.stripeCustomerId,
    'subscription.startDate': subscriptionData.startDate,
    'subscription.nextPaymentDate': subscriptionData.nextPaymentDate,
    'subscription.autoRenew': true,
  });

  // Update or create detailed subscription record
  await Subscription.findOneAndUpdate(
    { userId },
    {
      tier: subscriptionData.tier,
      status: subscriptionData.status,
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
      stripeCustomerId: subscriptionData.stripeCustomerId,
      startDate: subscriptionData.startDate,
      nextPaymentDate: subscriptionData.nextPaymentDate,
      $push: {
        history: {
          action: 'created',
          toTier: subscriptionData.tier,
          timestamp: new Date(),
        }
      }
    },
    { upsert: true }
  );
};

/**
 * Webhook handlers
 */
const handleSubscriptionCreated = async (subscription) => {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;
  
  if (userId) {
    const tier = getPlanTierFromPriceId(subscription.items.data[0].price.id);
    await updateUserSubscriptionData(userId, {
      tier,
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      startDate: new Date(subscription.start_date * 1000),
      nextPaymentDate: new Date(subscription.current_period_end * 1000),
    });
  }
};

const handleSubscriptionUpdated = async (subscription) => {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;
  
  if (userId) {
    await User.findByIdAndUpdate(userId, {
      'subscription.status': subscription.status,
      'subscription.nextPaymentDate': new Date(subscription.current_period_end * 1000),
    });
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;
  
  if (userId) {
    await User.findByIdAndUpdate(userId, {
      'subscription.tier': 'free',
      'subscription.status': 'cancelled',
      'subscription.cancelledAt': new Date(),
    });
  }
};

const handlePaymentSucceeded = async (invoice) => {
  const customer = await stripe.customers.retrieve(invoice.customer);
  const userId = customer.metadata.userId;
  
  if (userId) {
    // Add to billing history
    await User.findByIdAndUpdate(userId, {
      'subscription.lastPaymentDate': new Date(invoice.status_transitions.paid_at * 1000),
      $push: {
        billingHistory: {
          invoiceId: invoice.id,
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency.toUpperCase(),
          status: 'paid',
          paymentDate: new Date(invoice.status_transitions.paid_at * 1000),
          description: `${invoice.lines.data[0].description}`,
          stripeInvoiceId: invoice.id,
          downloadUrl: invoice.hosted_invoice_url,
        }
      }
    });
  }
};

const handlePaymentFailed = async (invoice) => {
  const customer = await stripe.customers.retrieve(invoice.customer);
  const userId = customer.metadata.userId;
  
  if (userId) {
    await User.findByIdAndUpdate(userId, {
      'subscription.status': 'past_due',
    });
  }
};

module.exports = {
  createStripeCustomer,
  createSubscription,
  cancelSubscription,
  handleWebhook,
  simulateSubscriptionCreation,
};
