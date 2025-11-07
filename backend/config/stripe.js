// config/stripe.js - SECURE VERSION
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY not found in environment variables");
  throw new Error("Missing STRIPE_SECRET_KEY");
}

// ✅ FIX: Don't log the entire stripe object
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Only log that it's initialized (never log the key!)
console.log("✅ Stripe initialized successfully");

export default stripe;