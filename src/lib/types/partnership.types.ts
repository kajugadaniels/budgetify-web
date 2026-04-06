export type PartnershipStatus = "PENDING" | "ACCEPTED" | "REVOKED";

export interface PartnerUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface PartnershipResponse {
  id: string;
  status: PartnershipStatus;
  inviteeEmail: string;
  isOwner: boolean;
  owner: PartnerUser;
  partner: PartnerUser | null;
  expiresAt: string;
  createdAt: string;
}

export interface InviteInfoResponse {
  partnershipId: string;
  inviteeEmail: string;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  ownerFullName: string | null;
  ownerAvatarUrl: string | null;
  expiresAt: string;
}

export interface InvitePartnerRequest {
  email: string;
}

export interface AcceptInviteRequest {
  token: string;
}
