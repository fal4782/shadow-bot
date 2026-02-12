"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bot,
  Video,
  History,
  MessageSquare,
  FileText,
  Sparkles,
  Play,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { meetingApi } from "@/lib/api/meeting";
import { getMeetingStatus } from "@/lib/status-utils";
import { TranscriptViewer } from "./transcript-viewer";
import { SummaryModal } from "./summary-modal";
import { UserProfileBadge } from "./user-profile-badge";
import { cleanupErrorMessage } from "@/lib/utils/error-utils";
import { ChatInterface } from "./chat-interface";
import { chatApi } from "@/lib/api/chat";

export function MeetingLibrary({ session }: { session: any }) {
  const router = useRouter();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll for recordings only if active
  useEffect(() => {
    if (!session?.accessToken) return;
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchStatus = () => {
      const activeMeeting = recordings.find((r: any) => {
        if (["FAILED", "TIMEOUT"].includes(r.recordingStatus)) return false;
        if (["PENDING", "ASKING_TO_JOIN", "JOINED"].includes(r.recordingStatus))
          return true;
        if (r.recordingStatus === "COMPLETED") {
          return (
            ["PENDING", "IN_PROGRESS"].includes(r.transcriptionStatus) ||
            ["PENDING", "IN_PROGRESS"].includes(r.summaryStatus) ||
            ["PENDING", "IN_PROGRESS"].includes(r.tagsStatus)
          );
        }
        return false;
      });

      if (activeMeeting) {
        meetingApi
          .getStatus(activeMeeting.id, session.accessToken)
          .then((statusData) => {
            if (!isMounted) return;

            setRecordings((prev) =>
              prev.map((r) =>
                r.id === activeMeeting.id
                  ? {
                      ...r,
                      recordingStatus: statusData.recordingStatus,
                      transcriptionStatus: statusData.transcriptionStatus,
                      summaryStatus: statusData.summaryStatus,
                      tagsStatus: statusData.tagsStatus,
                      tags: statusData.tags,
                      recordingError: statusData.recordingError,
                      transcriptOrSummaryError:
                        statusData.transcriptOrSummaryError,
                    }
                  : r,
              ),
            );

            const isStillActive =
              ["PENDING", "ASKING_TO_JOIN", "JOINED"].includes(
                statusData.recordingStatus,
              ) ||
              (statusData.recordingStatus === "COMPLETED" &&
                (["PENDING", "IN_PROGRESS"].includes(
                  statusData.transcriptionStatus,
                ) ||
                  ["PENDING", "IN_PROGRESS"].includes(
                    statusData.summaryStatus,
                  ) ||
                  ["PENDING", "IN_PROGRESS"].includes(statusData.tagsStatus)));

            if (isStillActive) {
              timeoutId = setTimeout(fetchStatus, 5000);
            } else {
              meetingApi.getMeetings(session.accessToken).then((data) => {
                if (isMounted) setRecordings(data);
              });
            }
          })
          .catch(console.error);
      } else {
        meetingApi
          .getMeetings(session.accessToken)
          .then((data) => {
            if (!isMounted) return;
            setRecordings(data);
            setLoading(false);

            const hasActive = data.some((r: any) => {
              if (["FAILED", "TIMEOUT"].includes(r.recordingStatus))
                return false;
              if (
                ["PENDING", "ASKING_TO_JOIN", "JOINED"].includes(
                  r.recordingStatus,
                )
              )
                return true;
              return (
                r.recordingStatus === "COMPLETED" &&
                (["PENDING", "IN_PROGRESS"].includes(r.transcriptionStatus) ||
                  ["PENDING", "IN_PROGRESS"].includes(r.summaryStatus) ||
                  ["PENDING", "IN_PROGRESS"].includes(r.tagsStatus))
              );
            });

            if (hasActive) {
              timeoutId = setTimeout(fetchStatus, 4000);
            }
          })
          .catch((err) => {
            console.error(err);
            if (isMounted) setLoading(false);
          });
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    session,
    recordings.some((r) => {
      if (["FAILED", "TIMEOUT"].includes(r.recordingStatus)) return false;
      if (["PENDING", "ASKING_TO_JOIN", "JOINED"].includes(r.recordingStatus))
        return true;
      return (
        r.recordingStatus === "COMPLETED" &&
        (["PENDING", "IN_PROGRESS"].includes(r.transcriptionStatus) ||
          ["PENDING", "IN_PROGRESS"].includes(r.summaryStatus) ||
          ["PENDING", "IN_PROGRESS"].includes(r.tagsStatus))
      );
    }),
  ]);

  const [activeTranscriptId, setActiveTranscriptId] = useState<string | null>(
    null,
  );
  const [activeSummaryId, setActiveSummaryId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);

  const handleChatOpen = async (recordingId: string) => {
    if (!session?.accessToken) return;
    setChatLoadingId(recordingId);

    try {
      const chats = await chatApi.getChats(session.accessToken, recordingId);

      if (chats && chats.length > 0) {
        setActiveChatId(chats[0].id);
      } else {
        const newChat = await chatApi.startChat(
          recordingId,
          session.accessToken,
        );
        setActiveChatId(newChat.chatId);
      }
    } catch (error) {
      console.error("Failed to open chat:", error);
    } finally {
      setChatLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-100 text-text-900 font-sans selection:bg-accent-500/20 relative flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-200/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[50%] h-[50%] bg-violet-200/8 rounded-full blur-[120px]" />
      </div>

      {/* Library Header */}
      <header className="h-20 px-6 lg:px-12 flex items-center justify-between sticky top-0 bg-secondary-100/80 backdrop-blur-xl z-30 border-b border-text-200/40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <span
              className="text-xl tracking-tight text-text-900 group-hover:opacity-70 transition-opacity"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              Shadow
            </span>
            <span className="text-xl font-semibold tracking-tight text-text-500">
              Bot
            </span>
            <span className="text-[10px] font-medium text-text-400 uppercase tracking-widest ml-2 mt-1">
              Library
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/chat")}
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-text-700 bg-white border border-text-200/60 hover:border-text-300 hover:shadow-sm transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              AI Chat
            </button>

            <button
              onClick={() => router.push("/")}
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white bg-text-900 hover:bg-text-800 transition-all active:scale-95 shadow-sm"
            >
              <Video className="w-4 h-4" />
              Join Meeting
            </button>

            <div className="h-6 w-px bg-text-200 mx-1" />

            <UserProfileBadge user={session?.user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-400 mb-2">
              <History className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Recordings
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl text-text-900 tracking-tight"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              Meeting Library
            </h1>
            <p className="text-text-500 font-normal max-w-lg text-lg">
              Search your recordings, replay key moments, and turn hours of
              conversation into instant answers.
            </p>
          </div>

          <div className="relative group min-w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-300 group-focus-within:text-text-600 transition-colors z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID or date..."
              className="w-full pl-10 pr-4 py-3.5 bg-white/70 backdrop-blur-md border border-text-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-400/30 shadow-sm transition-all text-sm font-medium text-text-900 placeholder:text-text-300"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 text-text-400 animate-spin" />
            <p className="text-sm font-medium text-text-400">
              Loading library...
            </p>
          </div>
        ) : recordings.length === 0 ? (
          <div className="text-center py-32 bg-white/50 backdrop-blur-xl rounded-[32px] border border-text-200/40 shadow-lg shadow-text-900/2">
            <div className="w-20 h-20 bg-secondary-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Video className="w-10 h-10 text-text-300" />
            </div>
            <h3
              className="text-2xl text-text-900 tracking-tight"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              Quiet in the archives
            </h3>
            <p className="text-text-500 mt-3 mb-10 max-w-sm mx-auto font-normal text-lg leading-relaxed">
              You haven't recorded any meetings yet. Start a session to see your
              history appear here.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-8 py-3.5 bg-text-900 text-white rounded-full font-semibold hover:bg-text-800 transition-all shadow-md shadow-text-900/10 active:scale-95 flex items-center gap-3 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              <span>Record First Meeting</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            {recordings.map((rec) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={rec.id}
                className="group relative"
              >
                {/* Glow on Hover */}
                <div className="absolute -inset-0.5 bg-linear-to-r from-accent-300/10 via-blue-200/10 to-accent-300/10 rounded-[28px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative bg-white/70 backdrop-blur-2xl border border-text-200/40 rounded-[24px] p-7 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    {/* Left: Recording Status & Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 flex-1">
                      {(() => {
                        const statusConfig = getMeetingStatus(
                          rec.recordingStatus,
                        );

                        return (
                          <>
                            {/* Play Button / Status Indicator */}
                            <div className="relative shrink-0">
                              {rec.recordingStatus === "COMPLETED" &&
                              rec.fileName ? (
                                <a
                                  href={`${process.env.NEXT_PUBLIC_API_URL}/recordings/${rec.fileName}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group/icon block relative"
                                >
                                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-secondary-200 text-text-600 border border-text-200/50 group-hover/icon:scale-105 group-hover/icon:bg-accent-50 group-hover/icon:text-accent-600 group-hover/icon:border-accent-200 transition-all duration-300 cursor-pointer">
                                    <Play className="w-6 h-6 fill-current ml-0.5" />
                                  </div>
                                </a>
                              ) : (
                                <div
                                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${statusConfig.bgClass} ${statusConfig.textClass} ${statusConfig.borderClass}`}
                                >
                                  <statusConfig.icon
                                    className={`w-6 h-6 ${statusConfig.animationClass || ""}`}
                                  />
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-bold text-text-900 tracking-tight">
                                  {rec.link ? (
                                    <span className="truncate max-w-[300px] block">
                                      {rec.link.replace("https://", "")}
                                    </span>
                                  ) : (
                                    `Direct Meeting Session`
                                  )}
                                </h3>
                                <span
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusConfig.borderClass} ${statusConfig.bgClass} ${statusConfig.textClass}`}
                                >
                                  {statusConfig.label}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-text-400">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 opacity-60" />
                                  <span>
                                    {new Date(rec.createdAt).toLocaleDateString(
                                      undefined,
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )}
                                    <span className="mx-1.5 opacity-30">·</span>
                                    {new Date(rec.createdAt).toLocaleTimeString(
                                      undefined,
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                </div>

                                {rec.id && (
                                  <div className="flex items-center gap-2 opacity-50">
                                    <div className="h-4 w-px bg-text-300" />
                                    <span className="font-mono text-[10px] tracking-wider uppercase">
                                      UID: {rec.id.substring(0, 12)}...
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* AI Tags */}
                              {rec.tags && rec.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {rec.tags.map((tag: string) => (
                                    <span
                                      key={tag}
                                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-secondary-200 text-text-600 border border-text-200/50 hover:border-accent-300 hover:text-accent-600 hover:bg-accent-50 transition-all cursor-default"
                                    >
                                      # {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {rec.recordingError && (
                                <div className="flex items-center gap-2 text-red-600 text-[11px] font-medium bg-red-50/80 px-3 py-1.5 rounded-xl border border-red-200/50 w-fit mt-2">
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                  <span>
                                    {cleanupErrorMessage(rec.recordingError)}
                                  </span>
                                </div>
                              )}
                              {rec.transcriptOrSummaryError && (
                                <div className="flex items-center gap-2 text-amber-700 text-[11px] font-medium bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/50 w-fit mt-2">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                  <span>
                                    {cleanupErrorMessage(
                                      rec.transcriptOrSummaryError,
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {rec.recordingStatus === "COMPLETED" && (
                        <>
                          <button
                            disabled={
                              rec.transcriptionStatus !== "COMPLETED" ||
                              chatLoadingId === rec.id
                            }
                            onClick={() => handleChatOpen(rec.id)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-text-200/60 text-text-800 font-semibold text-sm hover:border-accent-300 hover:text-accent-600 hover:shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-text-200/60 disabled:hover:text-text-800"
                          >
                            {chatLoadingId === rec.id ? (
                              <Loader2 className="w-4 h-4 text-accent-500 animate-spin" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-accent-500" />
                            )}
                            <span>
                              {chatLoadingId === rec.id ? "Opening..." : "Ask"}
                            </span>
                          </button>

                          {/* Summary Button */}
                          {rec.summaryStatus === "COMPLETED" ? (
                            <button
                              onClick={() => setActiveSummaryId(rec.id)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-text-200/60 text-text-800 font-semibold text-sm hover:border-accent-300 hover:text-accent-600 hover:shadow-sm transition-all active:scale-95"
                            >
                              <Sparkles className="w-4 h-4 text-accent-500" />
                              <span>Summary</span>
                            </button>
                          ) : rec.summaryStatus === "FAILED" ? (
                            <button
                              disabled
                              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-50/60 border border-red-200/50 text-red-400 font-semibold text-sm cursor-not-allowed"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              <span>Summary Failed</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary-200 border border-text-200/50 text-text-400 font-semibold text-sm cursor-not-allowed"
                            >
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Generating...</span>
                            </button>
                          )}

                          {/* Transcript Button */}
                          {rec.transcriptionStatus === "COMPLETED" ? (
                            <button
                              onClick={() => setActiveTranscriptId(rec.id)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-text-200/60 text-text-800 font-semibold text-sm hover:border-accent-300 hover:text-accent-600 hover:shadow-sm transition-all active:scale-95"
                            >
                              <FileText className="w-4 h-4 text-accent-500" />
                              <span>Transcript</span>
                            </button>
                          ) : rec.transcriptionStatus === "FAILED" ? (
                            <button
                              disabled
                              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-50/60 border border-red-200/50 text-red-400 font-semibold text-sm cursor-not-allowed"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              <span>Transcript Failed</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary-200 border border-text-200/50 text-text-400 font-semibold text-sm cursor-not-allowed"
                            >
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Transcribing...</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <TranscriptViewer
        recordingId={activeTranscriptId}
        isOpen={!!activeTranscriptId}
        onClose={() => setActiveTranscriptId(null)}
        session={session}
      />

      <SummaryModal
        recordingId={activeSummaryId}
        isOpen={!!activeSummaryId}
        onClose={() => setActiveSummaryId(null)}
        session={session}
      />

      <ChatInterface
        chatId={activeChatId}
        isOpen={!!activeChatId}
        onClose={() => setActiveChatId(null)}
        session={session}
        title={recordings.find((r) => r.id === activeChatId)?.title || "Ask AI"}
      />
    </div>
  );
}
