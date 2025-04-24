import { motion } from "framer-motion";

interface LogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function Logo({ size = "medium", className = "" }: LogoProps) {
  const sizeClasses = {
    small: "text-xl",
    medium: "text-3xl",
    large: "text-5xl",
  };

  return (
    <motion.h1
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`font-brand font-bold text-primary-700 ${sizeClasses[size]} ${className}`}
    >
      ATLAS
    </motion.h1>
  );
}
