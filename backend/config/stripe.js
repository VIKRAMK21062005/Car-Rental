// config/stripe.js
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY not found in .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
console.log("vikramkey",stripe)
export default stripe;
