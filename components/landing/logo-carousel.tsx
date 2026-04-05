"use client";

import { motion } from "framer-motion";

const companies = [
  "Vercel",
  "Stripe",
  "Notion",
  "Figma",
  "Linear",
  "Discord",
  "Shopify",
  "Slack",
];

export function LogoCarousel() {
  return (
    <section className="py-16 border-y border-black/5 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mb-8"
        >
          Trusted by industry leaders
        </motion.p>

        <div className="relative overflow-hidden">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-muted/30 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-muted/30 to-transparent z-10" />

          {/* Scrolling Logos */}
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex gap-16 items-center"
          >
            {[...companies, ...companies].map((company, index) => (
              <span
                key={`${company}-${index}`}
                className="text-2xl font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors whitespace-nowrap cursor-default"
              >
                {company}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
