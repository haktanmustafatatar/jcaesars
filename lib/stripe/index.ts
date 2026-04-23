import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummyForBuild", {
  apiVersion: "2025-02-24.acacia",
});

// Plan fiyatlarını Stripe'dan getir
export async function getStripePrices() {
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"],
  });

  return prices.data;
}

// Checkout session oluştur
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_period_days: 14, // 14 günlük ücretsiz deneme
    },
  });

  return session;
}

// Müşteri portal session oluştur
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Müşteri oluştur
export async function createCustomer({
  email,
  name,
  metadata,
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  });

  return customer;
}

// Abonelik detaylarını getir
export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });

  return subscription;
}

// Aboneliği iptal et
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

// Aboneliği güncelle (plan değiştirme)
export async function updateSubscription({
  subscriptionId,
  newPriceId,
}: {
  subscriptionId: string;
  newPriceId: string;
}) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: "create_prorations",
  });

  return updatedSubscription;
}

// Webhook event işleme
export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      // Abonelik oluştur
      await handleCheckoutCompleted(session);
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice;
      // Ödeme başarılı
      await handlePaymentSucceeded(invoice);
      break;

    case "invoice.payment_failed":
      const failedInvoice = event.data.object as Stripe.Invoice;
      // Ödeme başarısız
      await handlePaymentFailed(failedInvoice);
      break;

    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      // Abonelik silindi
      await handleSubscriptionDeleted(subscription);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// Checkout tamamlandığında
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { prisma } = await import("@/lib/prisma");

  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) return;

  // Subscription oluştur
  await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: "ACTIVE",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
    },
  });
}

// Ödeme başarılı
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice: ${invoice.id}`);
  // TODO: Email notification gönder
}

// Ödeme başarısız
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice: ${invoice.id}`);
  // TODO: Email notification gönder, grace period başlat
}

// Abonelik silindi
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { prisma } = await import("@/lib/prisma");

  await prisma.subscription.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      status: "CANCELED",
    },
  });
}
