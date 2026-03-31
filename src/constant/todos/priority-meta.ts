import type { TodoPriority } from "@/lib/types/todo.types";

export const PRIORITY_META: Record<
  TodoPriority,
  {
    label: string;
    description: string;
    chipClass: string;
    railClass: string;
    selectedClass: string;
  }
> = {
  TOP_PRIORITY: {
    label: "Top priority",
    description: "Items that are closest to becoming real purchases.",
    chipClass: "bg-success/14 text-success",
    railClass: "from-success/20 via-success/8 to-transparent",
    selectedClass: "border-success bg-success text-background",
  },
  PRIORITY: {
    label: "Priority",
    description: "Worth planning for once the critical items are stable.",
    chipClass: "bg-primary/14 text-primary",
    railClass: "from-primary/18 via-primary/8 to-transparent",
    selectedClass: "border-primary bg-primary text-background",
  },
  NOT_PRIORITY: {
    label: "Not priority",
    description: "Still interesting, but not worth immediate financial pressure.",
    chipClass: "bg-warning/16 text-warning",
    railClass: "from-warning/20 via-warning/8 to-transparent",
    selectedClass: "border-warning bg-warning text-background",
  },
};
