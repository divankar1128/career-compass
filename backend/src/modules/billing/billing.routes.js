import { Router } from "express";
import express from "express";
import { stripe } from "../../config/stripe.js";
import { env } from "../../config/env.js";
import { User } from "../users/user.model.js";
import { authRequired } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { logger } from "../../config/logger.js";

const router = Router();

// Webhook BEFORE express.json (raw body)
export const webhookRouter = Router();
webhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, env.stripe.webhookSecret);
    } catch (err) {
      logger.warn("Stripe signature failed", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const planFromPrice = await resolvePlan(s);
        await User.updateOne(
          { _id: s.client_reference_id },
          { stripeCustomerId: s.customer, plan: planFromPrice || "pro" },
        );
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object;
        const plan = await resolvePlanFromSub(sub);
        await User.updateOne({ stripeCustomerId: sub.customer }, { plan: plan || "pro" });
        break;
      }
      case "customer.subscription.deleted":
        await User.updateOne({ stripeCustomerId: event.data.object.customer }, { plan: "free" });
        break;
      default:
        logger.info(`Unhandled stripe event ${event.type}`);
    }
    res.json({ received: true });
  }),
);

async function resolvePlan(session) {
  if (!stripe || !session.subscription) return null;
  const sub = await stripe.subscriptions.retrieve(session.subscription);
  return resolvePlanFromSub(sub);
}
function resolvePlanFromSub(sub) {
  const priceId = sub.items?.data?.[0]?.price?.id;
  if (priceId === env.stripe.prices.team) return "team";
  if (priceId === env.stripe.prices.pro) return "pro";
  return "pro";
}

// Authenticated routes
router.use(authRequired);

router.post(
  "/checkout",
  asyncHandler(async (req, res) => {
    if (!stripe) throw new AppError("Stripe not configured", 503);
    const { plan = "pro" } = req.body;
    const price = plan === "team" ? env.stripe.prices.team : env.stripe.prices.pro;
    if (!price) throw new AppError("Price not configured", 500);
    const user = await User.findById(req.user.id);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: user.stripeCustomerId || undefined,
      customer_email: user.stripeCustomerId ? undefined : user.email,
      client_reference_id: user._id.toString(),
      line_items: [{ price, quantity: 1 }],
      success_url: `${req.headers.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/billing/cancelled`,
    });
    res.json({ url: session.url });
  }),
);

router.post(
  "/portal",
  asyncHandler(async (req, res) => {
    if (!stripe) throw new AppError("Stripe not configured", 503);
    const user = await User.findById(req.user.id);
    if (!user.stripeCustomerId) throw new AppError("No Stripe customer", 400);
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${req.headers.origin}/billing`,
    });
    res.json({ url: portal.url });
  }),
);

export default router;
