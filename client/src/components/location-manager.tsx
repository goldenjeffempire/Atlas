
import React, { useState } from 'react';
import { Location } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function LocationManager() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);

  const handleAddLocation = async (location: Partial<Location>) => {
    try {
      // API call to add location
      toast({
        title: "Location added",
        description: "New location has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add location.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select>
            <option value="city">City</option>
            <option value="building">Building</option>
            <option value="floor">Floor</option>
            <option value="campus">Campus</option>
            <option value="region">Region</option>
          </Select>
          
          <Input placeholder="Location name" />
          <Input placeholder="Address" />
          
          <Button onClick={() => handleAddLocation({})}>
            Add Location
          </Button>

          <div className="mt-6">
            {locations.map((location) => (
              <div key={location.id} className="p-4 border rounded-lg mb-2">
                <h3 className="font-medium">{location.name}</h3>
                <p className="text-sm text-gray-500">{location.type}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
