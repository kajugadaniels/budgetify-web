"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { MAX_PROFILE_AVATAR_SIZE_BYTES } from "@/constant/profile/avatar-upload";
import { cn } from "@/lib/utils/cn";
import {
  formatProfileFileSize,
} from "./profile.utils";

interface ProfileAvatarDropzoneProps {
  currentImageUrl: string | null;
  pendingFile: File | null;
  initial: string;
  disabled?: boolean;
  onSelectFile: (file: File | null) => void;
}

export function ProfileAvatarDropzone({
  currentImageUrl,
  pendingFile,
  initial,
  disabled = false,
  onSelectFile,
}: ProfileAvatarDropzoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const pendingPreviewUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile],
  );
  const previewUrl = pendingPreviewUrl ?? currentImageUrl;

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
    };
  }, [pendingPreviewUrl]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    onSelectFile(fileList[0]);
  }

  return (
    <section className="glass-panel rounded-[36px] p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/60">
        Portrait
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
        Add a profile image
      </h2>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        Drop one image and save once. The portrait is cropped to a square so it
        stays clean across the app.
      </p>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/18 blur-2xl" />
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-surface-elevated bg-cover bg-center text-4xl font-semibold text-primary shadow-[0_20px_40px_rgba(0,0,0,0.22)]"
            style={
              previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined
            }
          >
            {!previewUrl ? initial : null}
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-text-primary">
          {pendingFile ? "Ready to upload" : previewUrl ? "Current portrait" : "No portrait yet"}
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          JPEG, PNG, or WebP up to{" "}
          {Math.floor(MAX_PROFILE_AVATAR_SIZE_BYTES / (1024 * 1024))}MB.
        </p>
      </div>

      <label
        htmlFor={inputId}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) {
            handleFiles(event.dataTransfer.files);
          }
        }}
        className={cn(
          "mt-6 flex min-h-[168px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed px-6 py-7 text-center transition-all",
          disabled
            ? "cursor-not-allowed border-white/8 bg-white/[0.03] opacity-60"
            : isDragging
              ? "border-primary bg-primary/8"
              : "border-white/12 bg-background-secondary/70 hover:border-primary/30 hover:bg-background-secondary",
        )}
      >
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Choose image
        </div>
        <p className="mt-4 text-sm font-semibold text-text-primary">
          Drag your portrait here or browse
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
          Use a close, clear image so your account feels personal without adding
          noise to the interface.
        </p>
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />

      {pendingFile ? (
        <div className="mt-4 rounded-[24px] border border-primary/14 bg-primary/7 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">
                {pendingFile.name}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {formatProfileFileSize(pendingFile.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectFile(null)}
              className="rounded-full border border-danger/24 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/16"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
