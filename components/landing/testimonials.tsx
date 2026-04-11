"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const t = useTranslations("Landing.Testimonials");

  const testimonials = useMemo(() => [
    {
      quote: t("items.0.quote"),
      author: t("items.0.author"),
      role: t("items.0.role"),
      initials: "SC",
    },
    {
      quote: t("items.1.quote"),
      author: t("items.1.author"),
      role: t("items.1.role"),
      initials: "MJ",
    },
    {
      quote: t("items.2.quote"),
      author: t("items.2.author"),
      role: t("items.2.role"),
      initials: "ER",
    },
  ], [t]);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-primary mb-4 tracking-wider uppercase"
          >
            {t("badge")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {t("title")}
          </motion.h2>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <Quote className="w-16 h-16 text-primary/20 mx-auto mb-8" />
              <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-relaxed mb-8">
                &ldquo;{testimonials[current].quote}&rdquo;
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {testimonials[current].initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-semibold">{testimonials[current].author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[current].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="rounded-full w-12 h-12"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === current
                      ? "w-8 bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="rounded-full w-12 h-12"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
