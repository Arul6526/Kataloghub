import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/60 bg-gradient-to-b from-muted/20 to-muted/5 px-6 py-16 text-center transition-all hover:bg-muted/10",
        className,
      )}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>
      </div>

      {icon ? (
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm transition-transform hover:scale-110 duration-300 animate-in fade-in zoom-in">
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: cn("h-8 w-8", (icon.props as { className?: string }).className),
              })
            : icon}
        </div>
      ) : null}
      
      <div className="space-y-2 relative z-10 mb-6">
        <h3 className="font-space text-xl font-bold tracking-tight text-foreground">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      
      {action ? <div className="relative z-10">{action}</div> : null}
    </div>
  );
}