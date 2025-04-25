import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaGoogle, FaLinkedin } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import RoleSelector from "@/components/role-selector";
import Logo from "@/components/logo";
import { 
  RegisterUserData, 
  registerUserSchema,
  LoginData,
  Role 
} from "@shared/schema";
import { z } from "zod";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<Role>("general");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Effect to handle redirect when user is logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterUserData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      role: "general",
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterUserData) => {
    // Create a validation function for role-specific fields
    const validateRoleFields = (): boolean => {
      let isValid = true;
      // Reset form errors first
      registerForm.clearErrors();

      if (selectedRole === "admin") {
        if (!data.adminTitle) {
          registerForm.setError("adminTitle", { 
            type: "required", 
            message: "Admin title is required" 
          });
          isValid = false;
        }
        if (!data.adminDepartment) {
          registerForm.setError("adminDepartment", { 
            type: "required", 
            message: "Department is required" 
          });
          isValid = false;
        }
      } else if (selectedRole === "general") {
        if (!data.jobTitle) {
          registerForm.setError("jobTitle", { 
            type: "required", 
            message: "Job title is required" 
          });
          isValid = false;
        }
      } else if (selectedRole === "employee") {
        if (!data.employeeId) {
          registerForm.setError("employeeId", { 
            type: "required", 
            message: "Employee ID is required" 
          });
          isValid = false;
        }
        if (!data.department) {
          registerForm.setError("department", { 
            type: "required", 
            message: "Department is required" 
          });
          isValid = false;
        }
      }

      if (!data.phoneNumber) {
        registerForm.setError("phoneNumber", { 
          type: "required", 
          message: "Phone number is required" 
        });
        isValid = false;
      }

      return isValid;
    };

    // If role-specific validation passes, submit the form
    if (validateRoleFields()) {
      registerMutation.mutate({ ...data, role: selectedRole });
    }
  };

  const handleRoleSelect = (role: Role) => {
    // Clear any previous role-specific field errors and values
    registerForm.clearErrors();
    
    // Clear previous role fields
    if (selectedRole === "admin") {
      registerForm.setValue("adminTitle", "");
      registerForm.setValue("adminDepartment", "");
    } else if (selectedRole === "general") {
      registerForm.setValue("jobTitle", "");
    } else if (selectedRole === "employee") {
      registerForm.setValue("employeeId", "");
      registerForm.setValue("department", "");
    }
    
    // Update the role
    setSelectedRole(role);
    registerForm.setValue("role", role);
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary-700 text-white md:w-2/5 p-8 flex flex-col justify-center auth-image"
      >
        <div className="bg-black bg-opacity-50 p-8 rounded-lg">
          <Logo size="large" className="mb-8 text-white" />
          <h2 className="text-xl font-bold mb-4">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </h2>
          <p className="text-gray-200 mb-8">
            {mode === "signin"
              ? "Select your account type to access your workspace bookings."
              : "Select your account type to get started with our workspace booking platform."}
          </p>

          <RoleSelector
            selectedRole={selectedRole}
            onRoleSelect={handleRoleSelect}
            type={mode}
          />

          <p className="text-sm">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              className="text-primary-300 hover:underline"
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="md:w-3/5 p-8 flex items-center justify-center"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-muted-foreground">
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} account selected
            </p>
          </div>

          {mode === "signin" ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 mb-4 rounded-md text-sm">
                <p className="font-medium">Demo Accounts:</p>
                <ul className="text-xs mt-1 space-y-1">
                  <li><span className="font-medium">Admin:</span> admin@atlas.com / test1234</li>
                  <li><span className="font-medium">Employee:</span> employee@atlas.com / test1234</li>
                  <li><span className="font-medium">General:</span> user@atlas.com / test1234</li>
                </ul>
              </div>
              
              <div>
                <Label htmlFor="login-email">Email Address</Label>
                <Input
                  id="login-email"
                  placeholder="you@example.com"
                  {...loginForm.register("email")}
                  className="mt-1"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password">Password</Label>
                  <Button variant="link" className="p-0 h-auto text-primary text-xs">
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  {...loginForm.register("password")}
                  className="mt-1"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="relative flex items-center justify-center my-6">
                <Separator className="w-full" />
                <div className="text-sm text-muted-foreground bg-background px-3 absolute">
                  or continue with
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button" className="flex items-center justify-center">
                  <FaGoogle className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" type="button" className="flex items-center justify-center">
                  <FaLinkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="Enter your company name"
                  {...registerForm.register("companyName")}
                  className="mt-1"
                />
                {registerForm.formState.errors.companyName && (
                  <p className="text-sm text-destructive mt-1">
                    {registerForm.formState.errors.companyName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="you@example.com"
                  {...registerForm.register("email")}
                  className="mt-1"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter your phone number"
                  {...registerForm.register("phoneNumber")}
                  className="mt-1"
                />
                {registerForm.formState.errors.phoneNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {registerForm.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Role-specific fields */}
              {selectedRole === "admin" && (
                <>
                  <div>
                    <Label htmlFor="adminTitle">Job Title</Label>
                    <Input
                      id="adminTitle"
                      placeholder="E.g. Facilities Manager"
                      {...registerForm.register("adminTitle")}
                      className={`mt-1 ${registerForm.formState.errors.adminTitle ? 'border-destructive' : ''}`}
                    />
                    {registerForm.formState.errors.adminTitle && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.adminTitle.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="adminDepartment">Department</Label>
                    <Input
                      id="adminDepartment"
                      placeholder="E.g. Operations"
                      {...registerForm.register("adminDepartment")}
                      className={`mt-1 ${registerForm.formState.errors.adminDepartment ? 'border-destructive' : ''}`}
                    />
                    {registerForm.formState.errors.adminDepartment && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.adminDepartment.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {selectedRole === "general" && (
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="E.g. Software Engineer"
                    {...registerForm.register("jobTitle")}
                    className={`mt-1 ${registerForm.formState.errors.jobTitle ? 'border-destructive' : ''}`}
                  />
                  {registerForm.formState.errors.jobTitle && (
                    <p className="text-sm text-destructive mt-1">
                      {registerForm.formState.errors.jobTitle.message}
                    </p>
                  )}
                </div>
              )}

              {selectedRole === "employee" && (
                <>
                  <div>
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      placeholder="Enter your employee ID"
                      {...registerForm.register("employeeId")}
                      className={`mt-1 ${registerForm.formState.errors.employeeId ? 'border-destructive' : ''}`}
                    />
                    {registerForm.formState.errors.employeeId && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.employeeId.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      placeholder="E.g. Engineering"
                      {...registerForm.register("department")}
                      className={`mt-1 ${registerForm.formState.errors.department ? 'border-destructive' : ''}`}
                    />
                    {registerForm.formState.errors.department && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.department.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  {...registerForm.register("password")}
                  className="mt-1"
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  {...registerForm.register("confirmPassword")}
                  className="mt-1"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="relative flex items-center justify-center my-6">
                <Separator className="w-full" />
                <div className="text-sm text-muted-foreground bg-background px-3 absolute">
                  or continue with
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button" className="flex items-center justify-center">
                  <FaGoogle className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" type="button" className="flex items-center justify-center">
                  <FaLinkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
