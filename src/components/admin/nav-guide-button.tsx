"use client";

import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTour } from "@/components/admin/tour-provider";

export function NavGuideButton() {
  const { openTour } = useTour();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={openTour}
      className="gap-1.5 font-bold text-xs border-primary/30 text-primary hover:bg-primary/10 transition-colors shadow-sm"
      title="Buka Tour Panduan Interaktif"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Panduan</span>
    </Button>
  );
}
