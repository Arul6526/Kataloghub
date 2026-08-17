import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  htmlFor: explicitHtmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps) {
  const generatedId = React.useId();
  
  // Extract id from children if child is a valid React element with props
  const childId = React.isValidElement(children) ? (children.props as { id?: string }).id : undefined;
  const htmlFor = explicitHtmlFor || childId || generatedId;

  // Clone child to pass id if not already present
  const renderChildren = () => {
    if (React.isValidElement(children) && !childId) {
      return React.cloneElement(children as React.ReactElement<{ id?: string }>, {
        id: htmlFor,
      });
    }
    return children;
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium leading-none cursor-pointer"
        >
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </label>
      ) : null}
      {renderChildren()}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
}