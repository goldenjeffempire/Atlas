import React from 'react';
import { useParams } from 'wouter';
import { useBookings } from '@/hooks/use-booking';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function BookingDetailPage() {
  const { id } = useParams();
  const { data: bookings, cancelBooking, isLoading, error } = useBookings();
  const currentBooking = id && bookings ? bookings.find(b => b.id === parseInt(id, 10)) : null;

  if (error) {
    return <div className="p-4 text-red-500">Error loading booking details</div>;
  }

  if (isLoading || !currentBooking) {
    return (
      <div className="container mx-auto p-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-gray-600">This booking may have been cancelled or doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-6"
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{currentBooking.workspace.name}</h2>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{currentBooking.workspace.location}</span>
              </div>
            </div>
            <Badge variant={currentBooking.status === 'confirmed' ? 'success' : 'secondary'}>
              {currentBooking.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <span>
                    {format(new Date(currentBooking.startTime), 'PPP')} - {format(new Date(currentBooking.endTime), 'PPP')}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>
                    {format(new Date(currentBooking.startTime), 'p')} - {format(new Date(currentBooking.endTime), 'p')}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{currentBooking.attendees} attendees</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {currentBooking.workspace.features.map((feature, index) => (
                  <Badge key={index} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="destructive"
              onClick={() => cancelBooking(currentBooking.id)}
              className="flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Booking
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}