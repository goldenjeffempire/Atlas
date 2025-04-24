import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { BookingWithWorkspace } from "@/hooks/use-booking";
import { formatTimeRange } from "@/lib/utils";
import { motion } from "framer-motion";

interface BookingCardProps {
  booking: BookingWithWorkspace;
  onReschedule: (booking: BookingWithWorkspace) => void;
  onCancel: (bookingId: number) => void;
}

export default function BookingCard({
  booking,
  onReschedule,
  onCancel,
}: BookingCardProps) {
  const isConfirmed = booking.status === "confirmed";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden card-hover">
        <div className="h-48 w-full overflow-hidden">
          <img
            src={booking.workspace.imageUrl}
            alt={booking.workspace.name}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{booking.workspace.name}</h3>
              <p className="text-sm text-muted-foreground">{booking.workspace.location}</p>
            </div>
            <Badge variant={isConfirmed ? "success" : "secondary"}>
              {isConfirmed ? "Confirmed" : "Pending"}
            </Badge>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-muted-foreground" />
              <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
            </div>
          </div>
          
          <div className="mt-5 flex flex-wrap gap-2">
            {booking.workspace.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
          
          <div className="mt-5 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => onReschedule(booking)}
            >
              <Calendar className="mr-1.5 h-4 w-4" />
              Reschedule
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => onCancel(booking.id)}
            >
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
