
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import ChatWidget from "@/components/chat-widget";
import { Building2, MessageSquare, User, Users } from "lucide-react";

export default function SupportPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you as soon as possible.",
      variant: "default"
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
            <h1 className="text-4xl font-bold mb-8">Support Center</h1>

            <Tabs defaultValue="faq">
              <TabsList className="w-full max-w-2xl mb-8">
                <TabsTrigger value="faq" className="flex-1">FAQ</TabsTrigger>
                <TabsTrigger value="contact" className="flex-1">Contact Us</TabsTrigger>
                <TabsTrigger value="chat" className="flex-1">Live Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="faq">
                <div className="grid md:grid-cols-3 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Admin FAQ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="a1">
                          <AccordionTrigger>How do I manage workspace configurations?</AccordionTrigger>
                          <AccordionContent>
                            Navigate to the Admin Dashboard and select "Workspace Management". Here you can add, edit, or remove workspaces and their attributes.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="a2">
                          <AccordionTrigger>How do I generate usage reports?</AccordionTrigger>
                          <AccordionContent>
                            In the Admin Dashboard, visit the "Reports" section where you can generate and export various usage analytics and statistics.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Employee FAQ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="e1">
                          <AccordionTrigger>How do I book a workspace?</AccordionTrigger>
                          <AccordionContent>
                            From your dashboard, click "Book Workspace", select your preferred space and time, then confirm your booking.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="e2">
                          <AccordionTrigger>Can I modify my booking?</AccordionTrigger>
                          <AccordionContent>
                            Yes, you can modify or cancel your booking up to 24 hours before the scheduled time through your dashboard.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        General FAQ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="g1">
                          <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                          <AccordionContent>
                            Click "Forgot Password" on the login page and follow the instructions sent to your email.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="g2">
                          <AccordionTrigger>Where can I find help articles?</AccordionTrigger>
                          <AccordionContent>
                            Help articles are available in our Knowledge Base section, accessible from your dashboard's help menu.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contact">
                <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Contact Form
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Subject</label>
                          <Input
                            value={formData.subject}
                            onChange={e => setFormData({...formData, subject: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Message</label>
                          <Textarea
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                            required
                            rows={5}
                          />
                        </div>
                        <Button type="submit" className="w-full">Send Message</Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Office Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.3059353029!2d-74.25986548248684!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1645564944227!5m2!1sen!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">ATLAS Headquarters</h3>
                          <p className="text-gray-600">123 Tech Street</p>
                          <p className="text-gray-600">New York, NY 10001</p>
                          <p className="text-gray-600 mt-2">contact@atlas-workspace.com</p>
                          <p className="text-gray-600">+1 (555) 123-4567</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <Card>
                  <CardContent className="p-6">
                    <ChatWidget />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
