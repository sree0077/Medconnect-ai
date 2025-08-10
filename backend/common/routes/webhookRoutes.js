const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../services/paymentService');

/**
 * Stripe webhook endpoint
 * This endpoint receives webhooks from Stripe for subscription events
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!process.env.STRIPE_SECRET_KEY || !endpointSecret) {
      console.log('Stripe webhook received but Stripe not configured');
      return res.status(200).json({ received: true, message: 'Stripe not configured' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    await handleWebhook(event);
    
    console.log(`Webhook handled successfully: ${event.type}`);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Test webhook endpoint for development
 */
router.post('/test', async (req, res) => {
  try {
    const { eventType, data } = req.body;
    
    console.log(`Test webhook received: ${eventType}`);
    
    // Simulate webhook event
    const mockEvent = {
      type: eventType,
      data: { object: data }
    };
    
    await handleWebhook(mockEvent);
    
    res.status(200).json({ 
      received: true, 
      message: `Test webhook ${eventType} processed successfully` 
    });
  } catch (error) {
    console.error('Error handling test webhook:', error);
    res.status(500).json({ error: 'Test webhook handler failed' });
  }
});

module.exports = router;
