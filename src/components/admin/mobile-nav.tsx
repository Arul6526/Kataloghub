"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ExternalLink } from "lucide-react";
import { SidebarBrand, SidebarNav } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MobileNav({
  brandName,
  brandLogoUrl,
  storeSlug,
}: {
  brandName: string;
  brandLogoUrl?: string | null;
  storeSlug?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const siteUrl = storeSlug ? `/toko/${storeSlug}` : "/";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Buka menu">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="left-0 top-0 h-dvh max-w-[280px] translate-x-0 translate-y-0 rounded-none border-r sm:rounded-none flex flex-col justify-between p-0">
        <div>
          <DialogHeader className="border-b px-4">
            <DialogTitle className="sr-only">Menu Navigasi</DialogTitle>
            <SidebarBrand brandName={brandName} brandLogoUrl={brandLogoUrl} />
          </DialogHeader>
          <div className="overflow-y-auto p-4" onClick={() => setOpen(false)}>
            <SidebarNav />
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/20">
          <Button
            asChild
            variant="default"
            size="sm"
            className="w-full gap-2 font-bold shadow-md"
            onClick={() => setOpen(false)}
          >
            <Link href={siteUrl} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Lihat Situs Publik
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}