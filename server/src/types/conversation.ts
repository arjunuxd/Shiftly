export interface ConversationDocument {
  participantVendorId: string;
  participantJobSeekerId: string;
  applicationId: string;
  jobId: string;
  lastMessageText: string;
  lastMessageAt: unknown;
  createdAt: unknown;
}

export interface ConversationResponse {
  id: string;
  participantVendorId: string;
  participantJobSeekerId: string;
  applicationId: string;
  jobId: string;
  lastMessageText: string;
  lastMessageAt: string | null;
  createdAt: string | null;
}

export interface MessageDocument {
  senderId: string;
  text: string;
  createdAt: unknown;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  text: string;
  createdAt: string | null;
}
