
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
    // Here you would implement the actual form submission
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
              <TabsList>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="contact">Contact Us</TabsTrigger>
                <TabsTrigger value="chat">Live Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="faq">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1">
                        <AccordionTrigger>How do I book a workspace?</AccordionTrigger>
                        <AccordionContent>
                          You can book a workspace by navigating to the Workspaces page, selecting your desired space, and choosing your preferred date and time.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Can I modify my booking?</AccordionTrigger>
                        <AccordionContent>
                          Yes, you can modify or cancel your booking up to 24 hours before the scheduled time through your dashboard.
                        </AccordionContent>
                      </AccordionItem>
                      {/* Add more FAQ items as needed */}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label>Name</label>
                          <Input
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label>Email</label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label>Subject</label>
                        <Input
                          value={formData.subject}
                          onChange={e => setFormData({...formData, subject: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label>Message</label>
                        <Textarea
                          value={formData.message}
                          onChange={e => setFormData({...formData, message: e.target.value})}
                          required
                        />
                      </div>
                      <Button type="submit">Send Message</Button>
                    </form>
                  </CardContent>
                </Card>
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
