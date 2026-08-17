"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HeaderUserProps {
  email: string;
}

export function HeaderUser({ email }: HeaderUserProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-3.5 w-3.5" />
          </span>
          <span className="hidden max-w-[180px] truncate text-xs font-normal sm:inline">
            {email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Masuk sebagai
          <div className="truncate text-sm font-medium text-foreground">
            {email}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className="text-destructive">
          <LogOut className="h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}