export interface JoinMeetingPayload {
  userId: string;
  link: string;
  timestamp?: string;
  maxDurationMins?: number;
}
