"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { getProfile, updateProfile } from "@/lib/api/users/users.api";
import type { UserProfileResponse, UserStatus } from "@/lib/types/user.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

const STATUS_STYLES: Record<UserStatus, string> = {
  ACTIVE: "border-success/30 bg-success/10 text-success",
  SUSPENDED: "border-danger/30 bg-danger/10 text-danger",
  DISABLED: "border-border bg-white/6 text-text-secondary",
};

function formatDate(value: string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "Not available";

  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export default function ProfilePage() {
  const { token, user, updateUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState<UserProfileResponse | null>(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const response = await getProfile(sessionToken);
        if (!ignore) {
          setProfile(response);
          setFirstName(response.firstName ?? "");
          setLastName(response.lastName ?? "");
          updateUser(response);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : "Profile could not be loaded right now.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, [token, updateUser]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !profile) return;

    const normalizedFirstName = firstName.trim() || profile.firstName || "";
    const normalizedLastName = lastName.trim() || profile.lastName || "";

    const payload = {
      ...(normalizedFirstName !== (profile.firstName ?? "")
        ? { firstName: normalizedFirstName }
        : {}),
      ...(normalizedLastName !== (profile.lastName ?? "")
        ? { lastName: normalizedLastName }
        : {}),
    };

    if (Object.keys(payload).length === 0) {
      toast.info("Nothing changed.");
      return;
    }

    setSaving(true);

    try {
      const updated = await updateProfile(token, payload);
      setProfile(updated);
      setFirstName(updated.firstName ?? "");
      setLastName(updated.lastName ?? "");
      updateUser(updated);
      toast.success("Profile updated.");
    } catch (saveError) {
      toast.error(
        saveError instanceof ApiError
          ? saveError.message
          : "Profile could not be updated right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="glass-panel h-[250px] animate-pulse rounded-[32px]" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="glass-panel h-[380px] animate-pulse rounded-[32px]" />
            <div className="glass-panel h-[380px] animate-pulse rounded-[32px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="glass-panel rounded-[32px] p-6">
            <EmptyState
              title="Could not load your profile"
              description={error ?? "Profile data is unavailable."}
              action={{
                label: "Refresh",
                onClick: () => window.location.reload(),
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    profile.fullName ||
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.email;
  const initial = displayName[0]?.toUpperCase() ?? "B";

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="glass-panel rounded-[32px] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-primary/20 bg-primary/12 text-3xl font-semibold text-primary">
                {initial}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
                  Account
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-heading-lg text-text-primary">
                  {displayName}
                </h1>
                <p className="mt-2 text-sm text-text-secondary">{profile.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[profile.status]}`}
              >
                {profile.status.toLowerCase()}
              </span>
              <span
                className={
                  profile.isEmailVerified
                    ? "rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success"
                    : "rounded-full border border-border bg-white/6 px-3 py-1 text-xs font-medium text-text-secondary"
                }
              >
                {profile.isEmailVerified ? "Email verified" : "Email pending"}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <MetricCard label="Member since" value={formatDate(profile.createdAt)} />
            <MetricCard
              label="Last login"
              value={formatDate(profile.lastLoginAt, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            />
            <MetricCard label="Profile state" value={profile.status.toLowerCase()} />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="glass-elevated rounded-[32px] p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
              Personal details
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
              Keep your account identity current
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              Name changes flow through the app shell immediately so the web
              experience stays in sync with the authenticated session.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSave}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First name">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="Alice"
                    maxLength={80}
                  />
                </Field>

                <Field label="Last name">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="Mukamana"
                    maxLength={80}
                  />
                </Field>
              </div>

              <Field label="Email address">
                <input
                  type="email"
                  value={profile.email}
                  className={`${INPUT_CLASS} cursor-not-allowed opacity-70`}
                  disabled
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFirstName(profile.firstName ?? "");
                    setLastName(profile.lastName ?? "");
                  }}
                  className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </section>

          <aside className="glass-panel rounded-[32px] p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
              Account notes
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
              What this profile controls
            </h2>

            <div className="mt-6 space-y-3">
              <InfoCard
                title="Sign-in identity"
                body="Your email remains the stable account identifier across web and mobile."
              />
              <InfoCard
                title="Verification state"
                body={
                  profile.isEmailVerified
                    ? "Email verification is complete."
                    : "Email verification is still pending."
                }
              />
              <InfoCard
                title="Session visibility"
                body="Updating your profile here refreshes the name shown in the navigation shell."
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-subtle rounded-[24px] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-text-secondary/60">
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold tracking-heading-sm text-text-primary">
        {value}
      </p>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass-subtle rounded-[24px] px-4 py-4">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{body}</p>
    </div>
  );
}
