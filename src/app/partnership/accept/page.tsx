"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  acceptPartnershipInvite,
  getPartnershipInviteInfo,
} from "@/lib/api/partnerships/partnerships.api";
import type { InviteInfoResponse } from "@/lib/types/partnership.types";
import { getUserDisplayName } from "@/lib/utils/user-display";

function formatInviteDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function PartnershipAcceptPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, token, user } = useAuth();
  const toast = useToast();

  const inviteToken = searchParams.get("token") ?? "";
  const [inviteInfo, setInviteInfo] = useState<InviteInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) {
      setError("This invitation link is incomplete.");
      setLoading(false);
      return;
    }

    let ignore = false;

    async function loadInviteInfo() {
      setLoading(true);
      setError(null);

      try {
        const response = await getPartnershipInviteInfo(inviteToken);

        if (!ignore) {
          setInviteInfo(response);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : "This invitation could not be loaded.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadInviteInfo();

    return () => {
      ignore = true;
    };
  }, [inviteToken]);

  const ownerDisplayName = useMemo(() => {
    if (!inviteInfo) {
      return "Your partner";
    }

    return getUserDisplayName(
      {
        firstName: inviteInfo.ownerFirstName,
        fullName: inviteInfo.ownerFullName,
        lastName: inviteInfo.ownerLastName,
      },
      "Your partner",
    );
  }, [inviteInfo]);

  const invitedUserLabel = useMemo(() => {
    if (user) {
      return getUserDisplayName(user, "You");
    }

    return "You";
  }, [user]);

  const loginHref = inviteToken
    ? `/login?redirect=${encodeURIComponent(`/partnership/accept?token=${inviteToken}`)}`
    : "/login";

  const emailMismatch =
    Boolean(user?.email) &&
    Boolean(inviteInfo?.inviteeEmail) &&
    user?.email.toLowerCase() !== inviteInfo?.inviteeEmail.toLowerCase();

  async function handleAcceptInvite() {
    if (!token || !inviteToken) {
      return;
    }

    setAccepting(true);

    try {
      await acceptPartnershipInvite(token, { token: inviteToken });
      toast.success("You are now connected as partners.");
      router.replace("/partners");
      router.refresh();
    } catch (acceptError) {
      toast.error(
        acceptError instanceof ApiError
          ? acceptError.message
          : "The invitation could not be accepted right now.",
      );
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="text-center">
          <div className="glass-panel mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[18px]">
            <span className="text-2xl font-bold tracking-tight text-primary">B</span>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/65">
            Partnership invitation
          </p>
        </div>

        {loading ? (
          <div className="glass-panel h-[420px] animate-pulse rounded-[36px]" />
        ) : error || !inviteInfo ? (
          <div className="glass-panel rounded-[36px] p-6 md:p-8">
            <EmptyState
              title="This invitation is not available"
              description={error ?? "The partnership link could not be verified."}
              action={{
                label: "Go to login",
                onClick: () => {
                  router.push("/login");
                },
              }}
            />
          </div>
        ) : (
          <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(199,191,167,0.2),transparent_30%),linear-gradient(145deg,rgba(18,23,29,0.98),rgba(9,11,15,0.98))] px-6 py-7 shadow-[0_28px_90px_rgba(0,0,0,0.34)] md:px-10 md:py-10">
            <div className="absolute -left-10 top-12 h-40 w-40 rounded-full bg-primary/12 blur-3xl" />
            <div className="absolute -right-10 bottom-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/82">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Welcome, future partners
                </div>

                <h1 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.05em] text-text-primary md:text-[3rem]">
                  {ownerDisplayName} wants to manage money with you, side by side.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
                  Budgetify will give both of you one shared finance workspace:
                  the same income, expenses, todos, savings, and loans, plus a
                  gentle trace of who added each record. Think of it as one calm
                  home for two partners building better money habits together.
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <UserAvatar
                    avatarUrl={inviteInfo.ownerAvatarUrl}
                    firstName={inviteInfo.ownerFirstName}
                    fullName={inviteInfo.ownerFullName}
                    lastName={inviteInfo.ownerLastName}
                    sizeClassName="h-16 w-16 border-2 border-background"
                  />
                  <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-primary via-primary/30 to-transparent" />
                  <UserAvatar
                    avatarUrl={user?.avatarUrl}
                    email={user?.email}
                    firstName={user?.firstName}
                    fullName={user?.fullName}
                    lastName={user?.lastName}
                    sizeClassName="h-16 w-16 border-2 border-background"
                  />
                </div>

                <div className="mt-4 grid gap-2 text-sm text-text-secondary md:max-w-xl">
                  <p>
                    <span className="font-semibold text-text-primary">{ownerDisplayName}</span>{" "}
                    is ready to welcome you as a Budgetify partner.
                  </p>
                  <p>
                    Your invitation was prepared for{" "}
                    <span className="font-semibold text-text-primary">
                      {inviteInfo.inviteeEmail}
                    </span>
                    .
                  </p>
                  <p>
                    Once accepted, both of you will be able to work in the same
                    financial story, together.
                  </p>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm md:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary/58">
                  Before you continue
                </p>

                <div className="mt-4 space-y-3">
                  {[
                    "Both partners will see the same ledgers and dashboard information.",
                    "Each entry keeps its creator, so activity always stays traceable.",
                    "The person who sent the invitation keeps the ability to remove the partnership later.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[22px] border border-white/8 bg-background/36 px-4 py-3 text-sm leading-7 text-text-secondary"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[24px] border border-primary/12 bg-primary/8 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/72">
                    Invitation details
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-text-secondary">
                    <p>
                      Partner invitation for{" "}
                      <span className="font-semibold text-text-primary">
                        {invitedUserLabel}
                      </span>
                    </p>
                    <p>
                      Expires on{" "}
                      <span className="font-semibold text-text-primary">
                        {formatInviteDate(inviteInfo.expiresAt)}
                      </span>
                    </p>
                  </div>
                </div>

                {isAuthenticated ? (
                  emailMismatch ? (
                    <div className="mt-5 rounded-[24px] border border-danger/20 bg-danger/10 p-4">
                      <p className="text-sm font-semibold text-danger">
                        You’re signed in with {user?.email}, but this invitation was sent to {inviteInfo.inviteeEmail}.
                      </p>
                      <p className="mt-2 text-sm leading-7 text-text-secondary">
                        Sign in with the invited email address to accept this partnership.
                      </p>
                      <Link
                        href={loginHref}
                        className="mt-4 inline-flex rounded-full border border-danger/24 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/16"
                      >
                        Switch account
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleAcceptInvite()}
                      disabled={accepting}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition-all hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {accepting ? "Joining partnership..." : "Accept and start sharing"}
                    </button>
                  )
                ) : (
                  <div className="mt-5">
                    <p className="text-sm leading-7 text-text-secondary">
                      To protect shared finances, you must be signed in before
                      you can accept this invitation.
                    </p>
                    <Link
                      href={loginHref}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition-all hover:opacity-92"
                    >
                      Sign in to continue
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function PartnershipAcceptPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background px-4 py-8 md:px-6 md:py-10" />}>
      <PartnershipAcceptPageContent />
    </Suspense>
  );
}
