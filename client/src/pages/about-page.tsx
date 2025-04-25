
import { motion } from "framer-motion";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Users, Building2, Bot, Lock, Scale } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-8">About ATLAS</h1>
            
            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">To revolutionize workspace management through innovative technology, making it easier for organizations to optimize their office space and enhance employee productivity in the modern hybrid work environment.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">Creating the future of hybrid work environments where booking and managing workspaces is seamless, efficient, and adaptable to evolving workplace needs, empowering organizations and their employees to work smarter.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                      <Users className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold">User-Centric</h3>
                        <p className="text-gray-600">Prioritizing user experience in every feature</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Lock className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold">Security</h3>
                        <p className="text-gray-600">Enterprise-grade security by design</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Scale className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold">Scalability</h3>
                        <p className="text-gray-600">Built to grow with your organization</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-4 bg-white rounded-lg shadow-sm border">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Database className="h-5 w-5 text-purple-600" />
                        Frontend
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>React 18</li>
                        <li>TypeScript</li>
                        <li>Tailwind CSS</li>
                        <li>Framer Motion</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        Backend
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>Node.js</li>
                        <li>Express</li>
                        <li>PostgreSQL</li>
                        <li>Drizzle ORM</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Bot className="h-5 w-5 text-purple-600" />
                        AI Features
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>OpenAI GPT</li>
                        <li>AI Chat Support</li>
                        <li>Smart Suggestions</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Lock className="h-5 w-5 text-purple-600" />
                        Security
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>JWT Authentication</li>
                        <li>Role-based Access</li>
                        <li>Data Encryption</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
