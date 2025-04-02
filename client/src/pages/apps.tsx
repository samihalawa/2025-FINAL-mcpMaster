import { useState } from "react";
import AppList from "@/components/apps/app-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AppsPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Connected Applications</h1>
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </div>
        
        <AppList />
      </div>
    </div>
  );
}
