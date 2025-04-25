
import { motion } from "framer-motion";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>To revolutionize workspace management through innovative technology, making it easier for organizations to optimize their office space and enhance employee productivity.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Creating the future of hybrid work environments where booking and managing workspaces is seamless, efficient, and adaptable to evolving workplace needs.</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-lg shadow text-center">
                      <h3 className="font-semibold">Frontend</h3>
                      <p className="text-sm text-gray-600">React, TypeScript, Tailwind</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow text-center">
                      <h3 className="font-semibold">Backend</h3>
                      <p className="text-sm text-gray-600">Node.js, Express</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow text-center">
                      <h3 className="font-semibold">Database</h3>
                      <p className="text-sm text-gray-600">PostgreSQL, Drizzle ORM</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow text-center">
                      <h3 className="font-semibold">AI Integration</h3>
                      <p className="text-sm text-gray-600">OpenAI GPT</p>
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
