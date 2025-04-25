import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: "scale" | "lift" | "glow" | "bounce" | "none";
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0, 
  hover = "scale" 
}: AnimatedCardProps) {
  const getHoverAnimation = () => {
    switch (hover) {
      case "scale":
        return { scale: 1.02 };
      case "lift":
        return { y: -5 };
      case "bounce":
        return { y: -7, transition: { type: "spring", stiffness: 300 } };
      case "glow":
        // Use CSS class for glow effects since boxShadow in motion is problematic
        return {}; 
      case "none":
        return {};
      default:
        return { scale: 1.02 };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={getHoverAnimation()}
      className={cn(
        "overflow-hidden", 
        hover === "glow" ? "hover:shadow-lg hover:shadow-purple-200/50 transition-shadow duration-300" : "",
        className
      )}
    >
      {children}
    </motion.div>
  );
}