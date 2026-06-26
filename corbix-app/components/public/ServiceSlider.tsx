"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";

type ServiceSlide = {
  title: string;
  description: string;
};

type ServiceSliderProps = {
  slides: ServiceSlide[];
};

export function ServiceSlider({ slides }: ServiceSliderProps) {
  const reduce = useReducedMotion();

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max snap-x gap-4">
        {slides.map((slide) => {
          const content = (
            <Card className="h-full w-[320px] snap-start">
              <h3 className="text-lg font-semibold text-white">{slide.title}</h3>
              <p className="mt-2 text-sm text-muted">{slide.description}</p>
            </Card>
          );

          if (reduce) {
            return <div key={slide.title}>{content}</div>;
          }

          return (
            <motion.div
              key={slide.title}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {content}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
