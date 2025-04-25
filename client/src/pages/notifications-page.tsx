import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bell, 
  ArrowLeft,
  CheckCheck,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

// Mock notification data - would typically come from an API
const mockNotifications = [
  {
    id: 1,
    title: "Booking Confirmed",
    description: "Your booking for 'Meeting Room 3' has been confirmed.",
    time: "2 hours ago",
    date: "2025-04-25T10:00:00Z",
    read: false,
    type: "success"
  },
  {
    id: 2,
    title: "Booking Reminder",
    description: "Your booking for 'Open Workspace' starts in 30 minutes.",
    time: "30 minutes ago",
    date: "2025-04-25T11:30:00Z",
    read: false,
    type: "info"
  },
  {
    id: 3,
    title: "Booking Cancelled",
    description: "Your booking for 'Phone Booth 2' has been cancelled.",
    time: "1 day ago",
    date: "2025-04-24T09:15:00Z",
    read: true,
    type: "error"
  },
  {
    id: 4,
    title: "Workspace Maintenance",
    description: "Workspace 'Meeting Room 1' will be unavailable for maintenance on Friday.",
    time: "2 days ago",
    date: "2025-04-23T14:20:00Z",
    read: true,
    type: "warning"
  },
  {
    id: 5,
    title: "New Workspace Available",
    description: "A new workspace 'Creative Studio' is now available for booking.",
    time: "3 days ago",
    date: "2025-04-22T08:45:00Z",
    read: true,
    type: "success"
  },
  {
    id: 6,
    title: "Booking Changed",
    description: "The location of your booking has been changed to 'Conference Room B'.",
    time: "4 days ago",
    date: "2025-04-21T16:10:00Z",
    read: true,
    type: "info"
  },
  {
    id: 7,
    title: "Payment Processed",
    description: "Your payment for premium workspace access has been processed successfully.",
    time: "5 days ago",
    date: "2025-04-20T11:05:00Z",
    read: true,
    type: "success"
  }
];

export default function NotificationsPage() {
  const [, navigate] = useLocation();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };
  
  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  const handleClearAllNotifications = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
    }
  };
  
  const handleBack = () => {
    navigate("/dashboard");
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center">
              <Bell className="h-6 w-6 mr-3 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'No unread notifications'}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
              <Button variant="outline" onClick={handleClearAllNotifications}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full mb-6">
                    <TabsTrigger value="all" className="flex-1">
                      All
                      <span className="ml-2 bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                        {notifications.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="flex-1">
                      Unread
                      <span className="ml-2 bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                        {unreadCount}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="success" className="flex-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Success
                    </TabsTrigger>
                    <TabsTrigger value="info" className="flex-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Info
                    </TabsTrigger>
                    <TabsTrigger value="error" className="flex-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Error
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab}>
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-10 bg-white rounded-lg shadow">
                        <Bell className="h-12 w-12 mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          {activeTab === "all" 
                            ? "You don't have any notifications yet." 
                            : activeTab === "unread" 
                              ? "You don't have any unread notifications." 
                              : `You don't have any ${activeTab} notifications.`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredNotifications.map(notification => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`p-4 border rounded-lg shadow-sm ${
                              notification.read ? 'bg-white' : 'bg-gray-50 border-gray-300'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className={`rounded-full p-2 mr-3 ${
                                notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {notification.type === 'success' ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : notification.type === 'error' ? (
                                  <XCircle className="h-5 w-5" />
                                ) : (
                                  <Clock className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h3 className={`text-base font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                                    {notification.title}
                                  </h3>
                                  <span className="text-xs text-gray-500">
                                    {notification.time}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  {notification.description}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                              {!notification.read && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  Mark as read
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                        <span>Email Notifications</span>
                        <span className="font-normal text-xs text-gray-500">
                          Receive booking updates via email
                        </span>
                      </Label>
                      <Switch 
                        id="email-notifications" 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                        <span>Push Notifications</span>
                        <span className="font-normal text-xs text-gray-500">
                          Receive notifications in browser
                        </span>
                      </Label>
                      <Switch 
                        id="push-notifications" 
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="booking-reminders" className="flex flex-col space-y-1">
                        <span>Booking Reminders</span>
                        <span className="font-normal text-xs text-gray-500">
                          Get reminded 30 min before booking
                        </span>
                      </Label>
                      <Switch 
                        id="booking-reminders" 
                        checked={bookingReminders}
                        onCheckedChange={setBookingReminders}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-3">Notification Types</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        <span>Success - Confirmations & approvals</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        <span>Info - Updates & reminders</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        <span>Warning - Important alerts</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        <span>Error - Cancellations & issues</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}