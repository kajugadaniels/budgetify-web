interface UserDisplayInput {
  email?: string | null;
  firstName?: string | null;
  fullName?: string | null;
  lastName?: string | null;
}

export function getUserDisplayName(
  user: UserDisplayInput,
  fallback = "Budgetify user",
): string {
  const fromFullName = user.fullName?.trim();

  if (fromFullName) {
    return fromFullName;
  }

  const fromNames = [user.firstName, user.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();

  if (fromNames) {
    return fromNames;
  }

  const fromEmail = user.email?.trim();

  if (fromEmail) {
    return fromEmail;
  }

  return fallback;
}

export function getUserInitial(displayName: string): string {
  return displayName[0]?.toUpperCase() ?? "B";
}
