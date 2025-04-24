import { motion } from "framer-motion";
import { Role } from "@shared/schema";

interface RoleSelectorProps {
  selectedRole: Role;
  onRoleSelect: (role: Role) => void;
  type: "signup" | "signin";
}

const ROLE_DETAILS = {
  admin: {
    signin: {
      title: "Sign In as Admin",
      description: "Access admin dashboard and settings",
    },
    signup: {
      title: "Sign Up as Admin",
      description: "Manage workspaces, users, and analytics",
    },
  },
  general: {
    signin: {
      title: "Sign In as General",
      description: "Access your bookings and profile",
    },
    signup: {
      title: "Sign Up as General",
      description: "Book workspaces and manage own reservations",
    },
  },
  employee: {
    signin: {
      title: "Sign In as Employee",
      description: "Access company workspace portal",
    },
    signup: {
      title: "Sign Up as Employee",
      description: "Access company workspaces and amenities",
    },
  },
};

export default function RoleSelector({
  selectedRole,
  onRoleSelect,
  type,
}: RoleSelectorProps) {
  const roles: Role[] = ["admin", "general", "employee"];

  return (
    <div className="space-y-3 mb-8">
      {roles.map((role) => (
        <motion.button
          key={role}
          onClick={() => onRoleSelect(role)}
          className={`relative w-full text-left px-4 py-3 rounded-lg bg-white bg-opacity-10 border-2 
            ${selectedRole === role ? "border-primary-300" : "border-transparent"} 
            hover:border-white hover:bg-opacity-20 transition-all duration-200`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h3 className="font-semibold text-lg">{ROLE_DETAILS[role][type].title}</h3>
          <p className="text-sm text-gray-300">{ROLE_DETAILS[role][type].description}</p>
        </motion.button>
      ))}
    </div>
  );
}
