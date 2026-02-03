export interface JoinMeetingPayload {
  userId: string;
  link: string;
  recordingId: string;
  timestamp?: string;
  maxDurationMins?: number;
}

export interface TranscriptionPayload {
  recordingId: string;
  fileName: string;
}
