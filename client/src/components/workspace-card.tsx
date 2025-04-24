import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@shared/schema";
import { formatWorkspaceType } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkspaceCardProps {
  workspace: Workspace;
  isAvailable?: boolean;
  onBookNow: (workspace: Workspace) => void;
}

export default function WorkspaceCard({
  workspace,
  isAvailable = true,
  onBookNow,
}: WorkspaceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="overflow-hidden card-hover h-full">
        <div className="h-48 w-full overflow-hidden relative">
          <img
            src={workspace.imageUrl}
            alt={workspace.name}
            className="w-full h-full object-cover"
          />
          <Badge
            className="absolute top-3 right-3"
            variant={isAvailable ? "success" : "destructive"}
          >
            {isAvailable ? "Available" : "Booked"}
          </Badge>
        </div>
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold">{workspace.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">{workspace.location}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {workspace.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>

          <Button
            className="w-full"
            variant={isAvailable ? "default" : "secondary"}
            disabled={!isAvailable}
            onClick={() => isAvailable && onBookNow(workspace)}
          >
            {isAvailable ? "Book Now" : "Unavailable"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
