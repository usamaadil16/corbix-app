"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";

const SESSION_KEY = "corbix_loader_shown";
const COR = ["C", "O", "R"];
const BRIX = ["B", "R", "I", "X"];

export function Loader() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const alreadyShown =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(SESSION_KEY) === "1";

    if (alreadyShown) {
      setVisible(false);
      return;
    }

    window.sessionStorage.setItem(SESSION_KEY, "1");
    setReady(true);

    const holdMs = reduce ? 400 : 2200;
    const timer = window.setTimeout(() => setVisible(false), holdMs);
    return () => window.clearTimeout(timer);
  }, [reduce]);

  if (!visible) return null;

  const brickVariants: Variants = {
    hidden: { y: -40, opacity: 0 },
    show: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.5 + i * 0.12,
        type: "spring",
        stiffness: 420,
        damping: 24,
      },
    }),
  };

  return (
    <AnimatePresence>
      <motion.div
        key="corbix-loader"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
        initial={{ y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        aria-hidden
      >
        <div className="flex flex-col items-center">
          <div className="flex items-end gap-2 font-display text-5xl text-white md:text-7xl">
            {reduce || !ready ? (
              <span>
                COR<span className="text-accent">BRIX</span>
              </span>
            ) : (
              <>
                <span className="flex">
                  {COR.map((letter, i) => (
                    <motion.span
                      key={`cor-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
                <span className="flex text-accent">
                  {BRIX.map((letter, i) => (
                    <motion.span
                      key={`brix-${i}`}
                      custom={i}
                      variants={brickVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              </>
            )}
          </div>

          <motion.div
            className="mt-5 h-px w-40 origin-left bg-gradient-to-r from-accent to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: reduce ? 0 : 1.1, duration: 0.7, ease: "easeOut" }}
          />
          <motion.p
            className="mt-3 text-xs uppercase tracking-[0.3em] text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0.1 : 1.4, duration: 0.5 }}
          >
            A Name You Trust
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
