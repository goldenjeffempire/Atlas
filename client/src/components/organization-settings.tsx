
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Organization } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/ui/color-picker";
import { FileUpload } from "@/components/ui/file-upload";

export function OrganizationSettings() {
  const { toast } = useToast();
  const [org, setOrg] = useState<Partial<Organization>>({
    name: '',
    primaryColor: '#4F46E5',
    logoUrl: '',
  });

  const handleSave = async () => {
    try {
      // API call to save organization settings
      toast({
        title: "Settings saved",
        description: "Organization settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save organization settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization Name</label>
            <Input
              value={org.name}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              placeholder="Enter organization name"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand Color</label>
            <ColorPicker
              color={org.primaryColor}
              onChange={(color) => setOrg({ ...org, primaryColor: color })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Logo</label>
            <FileUpload
              onUpload={(url) => setOrg({ ...org, logoUrl: url })}
              accept="image/*"
            />
          </div>

          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
