import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Calendar, 
  LogOut,
  Camera,
  Trash
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  companyName: z.string().optional(),
  phoneNumber: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  
  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: user?.email || "",
      companyName: user?.companyName || "",
      phoneNumber: user?.phoneNumber || "",
      jobTitle: user?.jobTitle || "",
      department: user?.department || "",
    },
  });
  
  const handleProfileUpdate = (data: ProfileFormValues) => {
    // In a real app, this would call an API to update user data
    console.log("Updated profile data:", data);
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logoutMutation.mutate();
      navigate("/auth");
    }
  };
  
  const handleDeleteAccount = () => {
    if (confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
      // In a real app, this would call an API to delete the user's account
      toast({
        title: "Account deletion requested",
        description: "Your account deletion request has been submitted.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account settings and preferences
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="md:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-white text-xl">
                        {user?.companyName?.[0] || user?.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <h2 className="text-xl font-semibold">{user?.companyName || user?.email?.split('@')[0]}</h2>
                  <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                  <p className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-full mb-6">
                    {user?.role === 'admin' 
                      ? 'Administrator' 
                      : user?.role === 'employee' 
                        ? 'Employee' 
                        : 'General User'}
                  </p>
                </div>
                
                <nav className="space-y-1">
                  <a 
                    href="#" 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'profile' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('profile');
                    }}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Profile Information
                  </a>
                  <a 
                    href="#" 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'preferences' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('preferences');
                    }}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    Preferences
                  </a>
                  <a 
                    href="#" 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'notifications' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('notifications');
                    }}
                  >
                    <Bell className="mr-3 h-5 w-5" />
                    Notifications
                  </a>
                  <a 
                    href="#" 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'security' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('security');
                    }}
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    Security
                  </a>
                </nav>
                
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="md:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Manage your personal information and how it appears across the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" />
                                  </FormControl>
                                  <FormDescription>
                                    This is your primary email address
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company / Display Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Your name as displayed to others
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="phoneNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="tel" />
                                  </FormControl>
                                  <FormDescription>
                                    For booking confirmations and notifications
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="jobTitle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Department</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button type="submit">Save Changes</Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences</CardTitle>
                      <CardDescription>
                        Customize your experience with ATLAS
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Booking Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="default-workspace-type">Default Workspace Type</Label>
                            <select id="default-workspace-type" className="rounded-md border border-gray-300 py-2 px-3">
                              <option value="desk">Desk</option>
                              <option value="meeting_room">Meeting Room</option>
                              <option value="private_office">Private Office</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="default-booking-duration">Default Booking Duration</Label>
                            <select id="default-booking-duration" className="rounded-md border border-gray-300 py-2 px-3">
                              <option value="1">1 hour</option>
                              <option value="2">2 hours</option>
                              <option value="4">Half day (4 hours)</option>
                              <option value="8">Full day (8 hours)</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="auto-confirm">Auto-confirm bookings</Label>
                              <p className="text-sm text-gray-500">Automatically confirm bookings without review</p>
                            </div>
                            <Switch id="auto-confirm" checked={true} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium mb-4">Display Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="theme-mode">Theme</Label>
                            <select id="theme-mode" className="rounded-md border border-gray-300 py-2 px-3">
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="system">System default</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="date-format">Date Format</Label>
                            <select id="date-format" className="rounded-md border border-gray-300 py-2 px-3">
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button>Save Preferences</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Manage how you receive notifications from ATLAS
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-gray-500">Receive booking updates via email</p>
                          </div>
                          <Switch 
                            id="email-notifications" 
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                            <p className="text-sm text-gray-500">Receive notifications in browser</p>
                          </div>
                          <Switch 
                            id="push-notifications" 
                            checked={pushNotifications}
                            onCheckedChange={setPushNotifications}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="booking-reminders">Booking Reminders</Label>
                            <p className="text-sm text-gray-500">Get reminded 30 minutes before booking</p>
                          </div>
                          <Switch 
                            id="booking-reminders" 
                            checked={bookingReminders}
                            onCheckedChange={setBookingReminders}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium mb-4">Notify me about</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="notify-bookings" 
                              className="rounded text-primary focus:ring-primary" 
                              defaultChecked
                            />
                            <label htmlFor="notify-bookings" className="ml-2 text-sm">
                              Booking confirmations and changes
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="notify-reminders" 
                              className="rounded text-primary focus:ring-primary" 
                              defaultChecked
                            />
                            <label htmlFor="notify-reminders" className="ml-2 text-sm">
                              Booking reminders
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="notify-cancellations" 
                              className="rounded text-primary focus:ring-primary" 
                              defaultChecked
                            />
                            <label htmlFor="notify-cancellations" className="ml-2 text-sm">
                              Booking cancellations
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="notify-updates" 
                              className="rounded text-primary focus:ring-primary" 
                              defaultChecked
                            />
                            <label htmlFor="notify-updates" className="ml-2 text-sm">
                              Platform updates and new features
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button>Save Notification Settings</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security</CardTitle>
                      <CardDescription>
                        Manage your account security settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                          </div>
                          <div>
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div>
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                          <Button>Update Password</Button>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Add an extra layer of security to your account by enabling two-factor authentication.
                        </p>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>
                      
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button 
                          variant="destructive" 
                          className="flex items-center"
                          onClick={handleDeleteAccount}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}