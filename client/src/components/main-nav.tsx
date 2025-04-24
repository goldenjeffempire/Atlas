import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/workspaces", label: "Workspaces" },
  { href: "/calendar", label: "Calendar" },
  { href: "/analytics", label: "Analytics" },
];

export default function MainNav() {
  const [location] = useLocation();

  return (
    <div className="flex items-center">
      <Logo size="small" className="mr-10" />
      <nav className="hidden md:flex space-x-8">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.a
                className={cn(
                  "px-1 py-5 text-sm font-medium relative",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                    layoutId="navbar-indicator"
                  />
                )}
              </motion.a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
