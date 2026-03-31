"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  getProfile,
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

  if (loading) {
    return (
      <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
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

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
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
          </section>
        </div>
      </div>
    </div>
  );
}
