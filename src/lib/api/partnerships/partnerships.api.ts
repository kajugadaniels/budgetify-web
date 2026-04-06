import { apiFetch } from "../client";
import { PARTNERSHIPS_ROUTES } from "./partnerships.routes";
import type {
  AcceptInviteRequest,
  InviteInfoResponse,
  InvitePartnerRequest,
  PartnershipResponse,
} from "../../types/partnership.types";

export async function getMyPartnership(
  token: string,
): Promise<PartnershipResponse | null> {
  return apiFetch<PartnershipResponse | null>(PARTNERSHIPS_ROUTES.mine, {
    token,
  });
}

export async function invitePartner(
  token: string,
  body: InvitePartnerRequest,
): Promise<PartnershipResponse> {
  return apiFetch<PartnershipResponse>(PARTNERSHIPS_ROUTES.invite, {
    body,
    method: "POST",
    token,
  });
}

export async function cancelPendingInvite(token: string): Promise<void> {
  return apiFetch<void>(PARTNERSHIPS_ROUTES.invite, {
    method: "DELETE",
    token,
  });
}

export async function removePartnership(token: string): Promise<void> {
  return apiFetch<void>(PARTNERSHIPS_ROUTES.mine, {
    method: "DELETE",
    token,
  });
}

export async function getPartnershipInviteInfo(
  inviteToken: string,
): Promise<InviteInfoResponse> {
  return apiFetch<InviteInfoResponse>(PARTNERSHIPS_ROUTES.inviteInfo(inviteToken));
}

export async function acceptPartnershipInvite(
  token: string,
  body: AcceptInviteRequest,
): Promise<PartnershipResponse> {
  return apiFetch<PartnershipResponse>(PARTNERSHIPS_ROUTES.accept, {
    body,
    method: "POST",
    token,
  });
}
