"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the website crawling work?",
    answer:
      "Our AI-powered crawler visits your website and extracts all relevant content including text, metadata, and structure. It respects robots.txt and can be configured to crawl specific pages or sections. The crawled content is then processed and indexed for your chatbot to use.",
  },
  {
    question: "What file formats can I upload?",
    answer:
      "We support a wide range of formats including PDF, DOCX, TXT, MD, HTML, and CSV. You can upload multiple files at once, and our system will automatically extract and process the content for training your chatbot.",
  },
  {
    question: "Is there a message limit?",
    answer:
      "Each plan comes with a monthly message limit. Starter includes 1,000 messages, Professional includes 10,000 messages, and Enterprise offers unlimited messages. You can always upgrade your plan or purchase additional message packs.",
  },
  {
    question: "Can I customize the chatbot's appearance?",
    answer:
      "Yes! You can customize colors, position, avatar, welcome message, and more. Our embed widget is fully customizable to match your brand identity. You can also use custom CSS for advanced styling.",
  },
  {
    question: "Do you offer an API?",
    answer:
      "Yes, we provide a comprehensive REST API that allows you to integrate our chatbot functionality into your own applications. The API supports creating conversations, sending messages, and managing chatbots programmatically.",
  },
  {
    question: "How secure is my data?",
    answer:
      "We take security seriously. All data is encrypted at rest and in transit. We use industry-standard security practices including SOC 2 compliance, regular security audits, and strict access controls. Your data is never used to train third-party AI models.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-primary mb-4 tracking-wider uppercase"
          >
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-black/5 rounded-xl px-6 data-[state=open]:border-primary/20 transition-colors"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
