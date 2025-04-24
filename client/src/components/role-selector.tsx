import { motion } from "framer-motion";
import { Role } from "@shared/schema";
import { Check } from "lucide-react";

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
      fields: ["Company Name", "Admin Title", "Department", "Email", "Password"],
    },
    color: "text-purple-300",
    bgColor: "bg-purple-500/20",
  },
  general: {
    signin: {
      title: "Sign In as General",
      description: "Access your bookings and profile",
    },
    signup: {
      title: "Sign Up as General",
      description: "Book workspaces and manage own reservations",
      fields: ["Company Name", "Job Title", "Email", "Password"],
    },
    color: "text-green-300",
    bgColor: "bg-green-500/20",
  },
  employee: {
    signin: {
      title: "Sign In as Employee",
      description: "Access company workspace portal",
    },
    signup: {
      title: "Sign Up as Employee",
      description: "Access company workspaces and amenities",
      fields: ["Company Name", "Employee ID", "Department", "Email", "Password"],
    },
    color: "text-blue-300",
    bgColor: "bg-blue-500/20",
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
          className={`relative w-full text-left px-5 py-4 rounded-lg backdrop-blur-sm border-2 
            ${selectedRole === role 
              ? (role === "admin" ? "border-purple-300 bg-purple-500/20" : 
                 role === "general" ? "border-green-300 bg-green-500/20" : 
                 "border-blue-300 bg-blue-500/20")
              : "border-transparent bg-white bg-opacity-10"} 
            hover:border-white hover:bg-opacity-20 transition-all duration-200`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{ROLE_DETAILS[role][type].title}</h3>
              <p className="text-sm text-gray-300 mb-3">{ROLE_DETAILS[role][type].description}</p>
              
              {type === "signup" && selectedRole === role && (
                <div className="text-xs text-gray-300 space-y-1">
                  <p className={`${ROLE_DETAILS[role].color} font-medium`}>Required fields:</p>
                  <ul className="ml-2 space-y-1">
                    {ROLE_DETAILS[role].signup.fields.map((field, i) => (
                      <li key={i} className="flex items-center">
                        <span className={`inline-block h-1 w-1 rounded-full ${ROLE_DETAILS[role].color} mr-2`}></span>
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {selectedRole === role && (
              <div className="bg-primary-500 text-white p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
