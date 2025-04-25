
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { Workspace } from '@shared/schema';

interface WorkspaceCardProps {
  workspace: Workspace;
  isAvailable?: boolean;
  onBookNow: (workspace: Workspace) => void;
  isLoading?: boolean;
}

export default function WorkspaceCard({
  workspace,
  isAvailable = true,
  onBookNow,
  isLoading = false
}: WorkspaceCardProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card className="h-full">
          <CardContent className="p-6 space-y-4">
            <div className="h-48 bg-gray-200 rounded-md animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="aspect-video relative rounded-md overflow-hidden mb-4">
            <img
              src={workspace.imageUrl}
              alt={workspace.name}
              className="object-cover w-full h-full"
            />
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="destructive">Currently Unavailable</Badge>
              </div>
            )}
          </div>

          <h3 className="text-xl font-semibold mb-2">{workspace.name}</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{workspace.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>Capacity: {workspace.capacity}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {workspace.features.map((feature, index) => (
              <Badge key={index} variant="outline">
                {feature}
              </Badge>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={() => onBookNow(workspace)}
            disabled={!isAvailable}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
