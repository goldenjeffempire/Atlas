import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Users, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingWithWorkspace } from "@/hooks/use-booking";
import { formatDate, formatTimeRange } from "@/lib/utils";

interface EnhancedBookingCardProps {
  booking: BookingWithWorkspace;
  onReschedule: (booking: BookingWithWorkspace) => void;
  onCancel: (bookingId: number) => void;
  isPast?: boolean;
}

export default function EnhancedBookingCard({
  booking,
  onReschedule,
  onCancel,
  isPast = false
}: EnhancedBookingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusColor = () => {
    if (booking.status === "cancelled") return "bg-red-100 text-red-800";
    if (isPast) return "bg-gray-100 text-gray-800";
    
    // Check if it's today
    const today = new Date();
    const bookingDate = new Date(booking.startTime);
    
    if (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    ) {
      return "bg-green-100 text-green-800";
    }
    
    return "bg-blue-100 text-blue-800";
  };
  
  const getStatusText = () => {
    if (booking.status === "cancelled") return "Cancelled";
    if (isPast) return "Completed";
    
    // Check if it's today
    const today = new Date();
    const bookingDate = new Date(booking.startTime);
    
    if (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }
    
    return "Upcoming";
  };
  
  const getWorkspaceIcon = () => {
    switch(booking.workspace.type) {
      case "desk":
        return "D";
      case "meeting_room":
        return "M";
      default:
        return "W";
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className={`overflow-hidden border ${isPast || booking.status === "cancelled" ? "border-gray-200 opacity-75" : "border-purple-100 shadow-sm"} hover:shadow-md transition-all`}>
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${isPast || booking.status === "cancelled" ? "bg-gray-100 text-gray-500" : "bg-purple-100 text-primary"} flex items-center justify-center`}>
                  <span className="text-lg">{getWorkspaceIcon()}</span>
                </div>
                <div>
                  <p className="font-medium">{booking.workspace.name}</p>
                  <p className="text-sm text-gray-500">{booking.workspace.location}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(new Date(booking.startTime))} • {formatTimeRange(new Date(booking.startTime), new Date(booking.endTime))}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
                
                {!isPast && booking.status !== "cancelled" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReschedule(booking)}
                      className="h-8"
                    >
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8"
                      onClick={() => onCancel(booking.id)}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full mt-2 text-xs text-gray-500"
            >
              {isExpanded ? "Show less" : "Show details"}
            </Button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 pt-3 border-t border-gray-100"
                >
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Date: {formatDate(new Date(booking.startTime))}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Time: {formatTimeRange(new Date(booking.startTime), new Date(booking.endTime))}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Location: {booking.workspace.location}</span>
                    </div>
                    
                    {booking.workspace.features && booking.workspace.features.length > 0 && (
                      <div className="flex items-start text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <div>
                          <span>Features:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {booking.workspace.features.map((feature, idx) => (
                              <span 
                                key={idx} 
                                className="px-2 py-0.5 bg-gray-100 text-xs rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}