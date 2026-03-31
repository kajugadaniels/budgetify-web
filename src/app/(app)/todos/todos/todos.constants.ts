import type { TodoPriority } from "@/lib/types/todo.types";

export const PRIORITY_META: Record<
  TodoPriority,
  {
    label: string;
    description: string;
    chipClass: string;
    railClass: string;
  }
> = {
  TOP_PRIORITY: {
    label: "Top priority",
    description: "Items that are closest to becoming real purchases.",
    chipClass: "bg-primary/14 text-primary",
    railClass: "from-primary/20 via-primary/8 to-transparent",
  },
  PRIORITY: {
    label: "Priority",
    description: "Worth planning for once the critical items are stable.",
    chipClass: "bg-success/14 text-success",
    railClass: "from-success/18 via-success/8 to-transparent",
  },
  NOT_PRIORITY: {
    label: "Not priority",
    description: "Still interesting, but not worth immediate financial pressure.",
    chipClass: "bg-white/8 text-text-secondary",
    railClass: "from-white/10 via-white/4 to-transparent",
  },
};
