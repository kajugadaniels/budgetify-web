/**
 * Merges class names, filtering out falsy values.
 * Upgrade to clsx + tailwind-merge if class conflicts become an issue.
 */
export function cn(
  ...classes: (string | undefined | null | false | 0)[]
): string {
  return classes.filter(Boolean).join(" ");
}
