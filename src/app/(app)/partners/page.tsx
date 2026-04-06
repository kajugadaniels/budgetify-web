"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  cancelPendingInvite,
  getMyPartnership,
  invitePartner,
  removePartnership,
} from "@/lib/api/partnerships/partnerships.api";
import type { PartnerUser, PartnershipResponse } from "@/lib/types/partnership.types";
import { getUserDisplayName } from "@/lib/utils/user-display";

function formatPartnershipDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getPartnerCounterpart(
  partnership: PartnershipResponse,
  currentUserId: string | undefined,
): PartnerUser | null {
  if (partnership.isOwner) {
    return partnership.partner;
  }

  if (partnership.owner.id === currentUserId) {
    return partnership.partner;
  }

  return partnership.owner;
}

export default function PartnersPage() {
  const { token, user } = useAuth();
  const toast = useToast();

  const [partnership, setPartnership] = useState<PartnershipResponse | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [cancellingInvite, setCancellingInvite] = useState(false);
  const [removingPartner, setRemovingPartner] = useState(false);

  const currentUserName = getUserDisplayName(user ?? {}, "You");
  const counterpart = partnership
    ? getPartnerCounterpart(partnership, user?.id)
    : null;
  const counterpartName = counterpart
    ? getUserDisplayName(counterpart, "Your partner")
    : partnership?.inviteeEmail ?? "Your partner";

  const canRemoveAcceptedPartner = Boolean(
    partnership?.status === "ACCEPTED" && partnership.isOwner,
  );

  const partnershipStatusLabel = useMemo(() => {
    if (!partnership) {
      return null;
    }

    return partnership.status === "PENDING" ? "Invitation sent" : "Shared finances live";
  }, [partnership]);

  const loadPartnership = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getMyPartnership(token);
      setPartnership(response);
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : "Partner information could not be loaded right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadPartnership();
  }, [loadPartnership]);

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    const email = inviteEmail.trim().toLowerCase();

    if (!email) {
      return;
    }

    setSubmittingInvite(true);

    try {
      const response = await invitePartner(token, { email });
      setPartnership(response);
      setInviteEmail("");
      toast.success("Invitation sent. Your partner can finish the join flow from their email.");
    } catch (inviteError) {
      toast.error(
        inviteError instanceof ApiError
          ? inviteError.message
          : "The invitation could not be sent right now.",
      );
    } finally {
      setSubmittingInvite(false);
    }
  }

  async function handleCancelInvite() {
    if (!token) {
      return;
    }

    setCancellingInvite(true);

    try {
      await cancelPendingInvite(token);
      setPartnership(null);
      toast.success("Pending invitation cancelled.");
    } catch (cancelError) {
      toast.error(
        cancelError instanceof ApiError
          ? cancelError.message
          : "The pending invitation could not be cancelled.",
      );
    } finally {
      setCancellingInvite(false);
    }
  }

  async function handleRemovePartner() {
    if (!token) {
      return;
    }

    setRemovingPartner(true);

    try {
      await removePartnership(token);
      setPartnership(null);
      toast.success("Partner removed. Your finances are back to a solo workspace.");
    } catch (removeError) {
      toast.error(
        removeError instanceof ApiError
          ? removeError.message
          : "The partner could not be removed right now.",
      );
    } finally {
      setRemovingPartner(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="glass-panel h-52 animate-pulse rounded-[34px]" />
          <div className="glass-panel h-[420px] animate-pulse rounded-[34px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="glass-panel rounded-[34px] p-6">
            <EmptyState
              title="Could not load your partnership"
              description={error}
              action={{
                label: "Try again",
                onClick: () => {
                  void loadPartnership();
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(199,191,167,0.18),transparent_34%),linear-gradient(145deg,rgba(16,20,25,0.98),rgba(10,12,15,0.98))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.34)] md:p-8">
          <div className="absolute -right-14 top-10 h-40 w-40 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute left-10 top-0 h-px w-48 bg-gradient-to-r from-transparent via-white/18 to-transparent" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-primary/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/80">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Shared finances
              </div>
              <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-text-primary md:text-[2.7rem]">
                Build one financial picture, together.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
                Invite one trusted partner to work inside the same income,
                expense, todo, saving, and loan space. Every record stays
                traceable, so both of you can move together without losing who
                added what.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Both partners see the same finances",
                  "Every entry keeps its creator",
                  "Invitations are accepted only after sign-in",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-text-secondary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary/58">
                    {partnershipStatusLabel ?? "Partner access"}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
                    {partnership
                      ? partnership.status === "PENDING"
                        ? "Waiting for acceptance"
                        : "Partners connected"
                      : "Invite your partner"}
                  </p>
                </div>
                <div className="flex items-center gap-[-8px]">
                  <UserAvatar
                    avatarUrl={user?.avatarUrl}
                    email={user?.email}
                    firstName={user?.firstName}
                    fullName={user?.fullName}
                    lastName={user?.lastName}
                    sizeClassName="h-14 w-14 border-2 border-background"
                  />
                  <UserAvatar
                    avatarUrl={counterpart?.avatarUrl}
                    email={counterpart?.email}
                    firstName={counterpart?.firstName}
                    fullName={counterpart?.fullName}
                    lastName={counterpart?.lastName}
                    sizeClassName="h-14 w-14 border-2 border-background -ml-3"
                  />
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-text-secondary">
                {partnership
                  ? `${currentUserName} and ${counterpartName} are building a calmer money rhythm together. Budgetify will keep both of you aligned while still showing who created each movement.`
                  : "Send an invitation by email and let your partner join the same workspace with one acceptance step."}
              </p>
            </div>
          </div>
        </section>

        {partnership ? (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
            <div className="glass-elevated rounded-[34px] p-6 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary/58">
                    Partnership status
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
                    {partnership.status === "PENDING"
                      ? "Invitation is on its way"
                      : "Your shared workspace is active"}
                  </h2>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
                    partnership.status === "PENDING"
                      ? "border border-primary/18 bg-primary/10 text-primary"
                      : "border border-success/18 bg-success/10 text-success"
                  }`}
                >
                  {partnership.status}
                </span>
              </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      avatarUrl={partnership.owner.avatarUrl}
                      email={partnership.owner.email}
                      firstName={partnership.owner.firstName}
                      fullName={partnership.owner.fullName}
                      lastName={partnership.owner.lastName}
                      sizeClassName="h-14 w-14"
                    />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                        Invited by
                      </p>
                      <p className="mt-1 text-base font-semibold text-text-primary">
                        {getUserDisplayName(partnership.owner, "Partner owner")}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {partnership.owner.email}
                      </p>
                    </div>
                  </div>

                  <div className="hidden h-px flex-1 bg-gradient-to-r from-primary/30 via-primary/8 to-transparent md:block" />

                  <div className="flex items-center gap-4">
                    <UserAvatar
                      avatarUrl={partnership.partner?.avatarUrl}
                      email={partnership.partner?.email}
                      firstName={partnership.partner?.firstName}
                      fullName={partnership.partner?.fullName}
                      lastName={partnership.partner?.lastName}
                      sizeClassName="h-14 w-14"
                    />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                        Partner
                      </p>
                      <p className="mt-1 text-base font-semibold text-text-primary">
                        {counterpartName}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {partnership.partner?.email ?? partnership.inviteeEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[22px] border border-white/8 bg-background/40 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                      Shared since
                    </p>
                    <p className="mt-2 text-base font-semibold text-text-primary">
                      {formatPartnershipDate(partnership.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-background/40 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                      Invite expires
                    </p>
                    <p className="mt-2 text-base font-semibold text-text-primary">
                      {formatPartnershipDate(partnership.expiresAt)}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-background/40 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                      Workspace rule
                    </p>
                    <p className="mt-2 text-base font-semibold text-text-primary">
                      Each entry shows its creator
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[34px] p-6 md:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary/58">
                What happens now
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "Both partners can view the same income, expenses, todos, savings, and loans.",
                  "New records stay attributed, so you always know who added the item.",
                  "The inviter keeps control of removing the partnership later if needed.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-text-secondary"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {partnership.status === "PENDING" ? (
                  <button
                    type="button"
                    onClick={() => void handleCancelInvite()}
                    disabled={cancellingInvite}
                    className="rounded-full border border-danger/24 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/16 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {cancellingInvite ? "Cancelling..." : "Cancel invitation"}
                  </button>
                ) : canRemoveAcceptedPartner ? (
                  <button
                    type="button"
                    onClick={() => void handleRemovePartner()}
                    disabled={removingPartner}
                    className="rounded-full border border-danger/24 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/16 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {removingPartner ? "Removing..." : "Remove partner"}
                  </button>
                ) : null}
              </div>

              {partnership.status === "ACCEPTED" && !partnership.isOwner ? (
                <p className="mt-4 text-xs leading-6 text-text-secondary/75">
                  Only the person who sent the invitation can remove this partnership.
                </p>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(340px,0.98fr)]">
            <div className="glass-elevated rounded-[34px] p-6 md:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary/58">
                Invite your partner
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
                Send one email, then let them accept when they sign in.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
                Use the partner’s email address. Budgetify will send a guided
                invitation with a link to review the partnership, sign in, and
                activate shared finances together.
              </p>

              <form onSubmit={handleInvite} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="partner-email"
                    className="mb-2 block text-sm font-medium text-text-secondary"
                  >
                    Partner email
                  </label>
                  <input
                    id="partner-email"
                    type="email"
                    autoComplete="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="partner@example.com"
                    className="w-full rounded-[22px] border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/55 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingInvite || inviteEmail.trim().length === 0}
                  className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition-all hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {submittingInvite ? "Sending invitation..." : "Invite partner"}
                </button>
              </form>
            </div>

            <div className="glass-panel rounded-[34px] p-6 md:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary/58">
                Before you send it
              </p>
              <div className="mt-4 space-y-3">
                {[
                  {
                    title: "Shared visibility",
                    text: "Both of you will see the same ledgers and dashboard context the moment the invitation is accepted.",
                  },
                  {
                    title: "Tracked ownership",
                    text: "Every record will keep the creator attached, so edits and history stay understandable.",
                  },
                  {
                    title: "Simple control",
                    text: "The inviter keeps the ability to remove the partnership later if life changes.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <p className="text-sm font-semibold text-text-primary">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-text-secondary">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
