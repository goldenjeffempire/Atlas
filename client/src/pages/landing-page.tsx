import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Logo from "@/components/logo";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  BarChart, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Logo size="medium" />
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/auth")}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                The smart way to book your workspace
              </h1>
              <p className="mt-4 text-xl text-gray-600">
                ATLAS makes it easy to find and book the perfect workspace for your needs.
                Discover available offices, desks, and meeting rooms in real-time.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")}
                  className="font-medium"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="font-medium"
                >
                  Explore Workspaces
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000" 
                  alt="Modern workspace" 
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Instant Booking</p>
                    <p className="text-sm text-gray-500">No waiting for approval</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need in one place</h2>
            <p className="mt-4 text-xl text-gray-600">
              ATLAS provides a seamless workspace booking experience with powerful features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Building2 className="h-8 w-8 text-purple-600" />,
                title: "Workspace Options",
                description: "Choose from a variety of workspace types including desks, meeting rooms, and private offices."
              },
              {
                icon: <Calendar className="h-8 w-8 text-purple-600" />,
                title: "Real-time Availability",
                description: "See which workspaces are available right now and book instantly with just a few clicks."
              },
              {
                icon: <MapPin className="h-8 w-8 text-purple-600" />,
                title: "Multiple Locations",
                description: "Find workspaces in different locations to suit your needs, whether you're traveling or working locally."
              },
              {
                icon: <Users className="h-8 w-8 text-purple-600" />,
                title: "Team Management",
                description: "Manage bookings for your entire team with role-based access control and permissions."
              },
              {
                icon: <BarChart className="h-8 w-8 text-purple-600" />,
                title: "Analytics Dashboard",
                description: "Get insights into workspace usage and optimize your bookings with detailed reports."
              },
              {
                icon: <Calendar className="h-8 w-8 text-purple-600" />,
                title: "Calendar Integration",
                description: "Sync your bookings with your calendar to keep track of your schedule."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="bg-purple-50 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-purple-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold">Ready to transform your workspace booking experience?</h2>
            <p className="mt-4 text-xl text-purple-100">
              Join thousands of professionals who are already using ATLAS to find and book workspaces.
            </p>
            <div className="mt-8">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white text-purple-700 hover:bg-purple-50"
                onClick={() => navigate("/auth")}
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo size="medium" className="text-white" />
              <p className="mt-4 text-gray-400">
                The smart way to book your workspace.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} ATLAS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}