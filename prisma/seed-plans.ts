import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export {};

async function main() {
  const plans = [
    {
      name: "Starter",
      slug: "starter",
      description: "Perfect for personal projects and small blogs.",
      priceMonthly: 0,
      priceYearly: 0,
      messageLimit: 100,
      chatbotLimit: 1,
      tokenLimit: 50000,
      isPopular: false,
      features: [
        "1 AI Chatbot",
        "100 Messages / month",
        "50,000 Tokens / month",
        "Basic Analytics",
        "Web Widget Integration"
      ]
    },
    {
      name: "Professional",
      slug: "pro",
      description: "Best for growing businesses and e-commerce stores.",
      priceMonthly: 49,
      priceYearly: 490,
      messageLimit: 5000,
      chatbotLimit: 5,
      tokenLimit: 1000000,
      isPopular: true,
      features: [
        "5 AI Chatbots",
        "5,000 Messages / month",
        "1,000,000 Tokens / month",
        "Advanced Analytics",
        "WhatsApp & Instagram Integration",
        "Custom Branding",
        "Lead Capture Tools"
      ]
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      description: "Full power for large scale organizations.",
      priceMonthly: 199,
      priceYearly: 1990,
      messageLimit: 50000,
      chatbotLimit: 20,
      tokenLimit: 10000000,
      isPopular: false,
      isEnterprise: true,
      features: [
        "20 AI Chatbots",
        "50,000 Messages / month",
        "10,000,000 Tokens / month",
        "Full API Access",
        "White-label Solution",
        "Dedicated Support",
        "Custom Training Models"
      ]
    }
  ];

  console.log("Seeding plans...");

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan
    });
  }

  console.log("Plans seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
