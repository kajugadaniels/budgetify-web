"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  getProfile,
  requestAccountDeletion,
  updateProfile,
  uploadProfileAvatar,
} from "@/lib/api/users/users.api";
import type { UserProfileResponse } from "@/lib/types/user.types";
import { ProfileAvatarDropzone } from "./profile/profile-avatar-dropzone";
import { ProfileDetailsForm } from "./profile/profile-details-form";
import { ProfileHeader } from "./profile/profile-header";
import { ProfileMetricCard } from "./profile/profile-metric-card";
import {
  formatProfileDate,
  getProfileDisplayName,
  getProfileInitial,
  validateProfileAvatarFile,
} from "./profile/profile.utils";

export default function ProfilePage() {
  const { token, user, updateUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState<UserProfileResponse | null>(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [requestingDeletion, setRequestingDeletion] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);

  const syncProfile = useCallback((nextProfile: UserProfileResponse) => {
    setProfile(nextProfile);
    setFirstName(nextProfile.firstName ?? "");
    setLastName(nextProfile.lastName ?? "");
    updateUser(nextProfile);
  }, [updateUser]);

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
          syncProfile(response);
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
  }, [syncProfile, token]);

  function handleAvatarSelection(file: File | null) {
    if (!file) {
      setPendingAvatarFile(null);
      return;
    }

    const validationMessage = validateProfileAvatarFile(file);

    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setPendingAvatarFile(file);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !profile) return;

    const nextFirstName = firstName.trim();
    const nextLastName = lastName.trim();
    const payload = {
      ...(nextFirstName !== (profile.firstName ?? "")
        ? { firstName: nextFirstName || undefined }
        : {}),
      ...(nextLastName !== (profile.lastName ?? "")
        ? { lastName: nextLastName || undefined }
        : {}),
    };

    const hasNameChanges = Object.keys(payload).length > 0;

    if (!hasNameChanges && !pendingAvatarFile) {
      toast.info("Nothing changed.");
      return;
    }

    setSaving(true);

    try {
      let nextProfile = profile;

      if (hasNameChanges) {
        nextProfile = await updateProfile(token, payload);
        syncProfile(nextProfile);
      }

      if (pendingAvatarFile) {
        nextProfile = await uploadProfileAvatar(token, pendingAvatarFile);
        syncProfile(nextProfile);
        setPendingAvatarFile(null);
      }

      toast.success(
        hasNameChanges && pendingAvatarFile
          ? "Profile and portrait updated."
          : pendingAvatarFile
            ? "Profile portrait updated."
            : "Profile updated.",
      );
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

  async function handleRequestDeletion() {
    if (!token || !profile || requestingDeletion) {
      return;
    }

    const confirmed = window.confirm(
      "Your account will be scheduled for deletion in 30 days. Any new login or account activity before then will cancel the request automatically. Do you want to continue?",
    );

    if (!confirmed) {
      return;
    }

    setRequestingDeletion(true);

    try {
      const nextProfile = await requestAccountDeletion(token);
      syncProfile(nextProfile);
      toast.success(
        "Deletion request received. Avoid signing in or recording anything if you want it to continue.",
      );
    } catch (requestError) {
      toast.error(
        requestError instanceof ApiError
          ? requestError.message
          : "Account deletion could not be scheduled right now.",
      );
    } finally {
      setRequestingDeletion(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
        <div className="mx-auto flex max-w-none flex-col gap-6">
          <div className="glass-panel h-[220px] animate-pulse rounded-[36px]" />
          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="glass-panel h-[420px] animate-pulse rounded-[36px]" />
            <div className="glass-panel h-[520px] animate-pulse rounded-[36px]" />
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

  const displayName = getProfileDisplayName(profile);
  const initial = getProfileInitial(displayName);
  const hasPendingDeletion = Boolean(profile.accountDeletionScheduledFor);

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-none flex-col gap-6">
        <ProfileHeader
          displayName={displayName}
          email={profile.email}
          isEmailVerified={profile.isEmailVerified}
          status={profile.status}
        />

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <ProfileAvatarDropzone
            currentImageUrl={profile.avatarUrl}
            pendingFile={pendingAvatarFile}
            initial={initial}
            disabled={saving}
            onSelectFile={handleAvatarSelection}
          />

          <section className="glass-elevated rounded-[36px] p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <ProfileMetricCard
                label="Member since"
                value={formatProfileDate(profile.createdAt)}
              />
              <ProfileMetricCard
                label="Last login"
                value={formatProfileDate(profile.lastLoginAt, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              />
              <ProfileMetricCard
                label="Profile state"
                value={profile.status.toLowerCase()}
              />
            </div>

            <ProfileDetailsForm
              email={profile.email}
              firstName={firstName}
              lastName={lastName}
              saving={saving}
              onChangeFirstName={setFirstName}
              onChangeLastName={setLastName}
              onReset={() => {
                setFirstName(profile.firstName ?? "");
                setLastName(profile.lastName ?? "");
                setPendingAvatarFile(null);
              }}
              onSubmit={handleSave}
            />

            <section className="mt-6 rounded-[32px] border border-danger/20 bg-[linear-gradient(180deg,rgba(255,107,107,0.08),rgba(255,107,107,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-danger/70">
                    Account deletion
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                    {hasPendingDeletion
                      ? "Your deletion request is scheduled"
                      : "Close this account permanently"}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    {hasPendingDeletion
                      ? `Your account is scheduled to be deleted on ${formatProfileDate(profile.accountDeletionScheduledFor)}. To let this complete, stop using the account until that date.`
                      : "Request a permanent account deletion. Budgetify will wait 30 days before removing the account so you have time to change your mind."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-background-secondary/60 px-4 py-3 text-sm text-text-secondary md:max-w-[280px]">
                  {hasPendingDeletion ? (
                    <>
                      <p className="font-semibold text-text-primary">
                        Automatic cancellation
                      </p>
                      <p className="mt-2 leading-6">
                        Any new sign-in or account activity, including recording
                        income, expenses, savings, loans, or todos, will cancel
                        this request automatically.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-text-primary">
                        Before you request it
                      </p>
                      <p className="mt-2 leading-6">
                        If you later sign in again or record anything, the
                        deletion request is denied automatically and the account
                        stays active.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-text-secondary">
                  {hasPendingDeletion
                    ? `Requested on ${formatProfileDate(profile.accountDeletionRequestedAt)}`
                    : "You will receive a confirmation email immediately after the request is accepted."}
                </p>

                {hasPendingDeletion ? (
                  <span className="inline-flex items-center justify-center rounded-full border border-danger/25 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
                    Deletion scheduled
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestDeletion}
                    disabled={requestingDeletion || saving}
                    className="inline-flex items-center justify-center rounded-full border border-danger/30 bg-danger/12 px-5 py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger/18 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {requestingDeletion
                      ? "Scheduling..."
                      : "Request account deletion"}
                  </button>
                )}
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}
