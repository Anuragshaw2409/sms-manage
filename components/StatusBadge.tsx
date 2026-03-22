import { Badge } from "@/components/ui/badge";

export function StatusBadge({
  status,
  text,
}: {
  status: string;
  text?: string;
}) {
  const variants: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    inactive: "bg-muted text-muted-foreground border-border",
    completed: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    refunded: "bg-muted text-muted-foreground border-border",
    expired: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const statusKey = status?.toLowerCase() || "";
  const variantClass = variants[statusKey] || variants.inactive;

  return (
    <Badge variant="outline" className={variantClass}>
      {text ? text : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
