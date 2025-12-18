import { CheckCircle2, Clock, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: "delivered" | "scheduled" | "pending";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
};

const statusConfig = {
  delivered: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    icon: CheckCircle2,
    label: "Delivered",
  },
  scheduled: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: Truck,
    label: "Scheduled",
  },
  pending: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    icon: Clock,
    label: "Pending",
  },
};

const sizeConfig = {
  sm: {
    wrapper: "px-2 py-0.5 text-xs",
    icon: "h-3 w-3",
  },
  md: {
    wrapper: "px-3 py-1 text-sm",
    icon: "h-3.5 w-3.5",
  },
  lg: {
    wrapper: "px-4 py-1.5 text-base",
    icon: "h-4 w-4",
  },
};

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-lg",
        config.bg,
        config.text,
        sizes.wrapper,
        className
      )}
    >
      {showIcon && <Icon className={sizes.icon} />}
      {config.label}
    </span>
  );
}

// Compact version for cards - just shows Done/Sched
export function StatusBadgeCompact({
  status,
  className,
}: {
  status: "delivered" | "scheduled" | "pending";
  className?: string;
}) {
  const isDelivered = status === "delivered";
  const Icon = isDelivered ? CheckCircle2 : Clock;

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold",
        isDelivered
          ? "bg-emerald-100 text-emerald-700"
          : "bg-blue-50 text-blue-600",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 mr-1" />
      {isDelivered ? "Done" : "Sched"}
    </span>
  );
}
