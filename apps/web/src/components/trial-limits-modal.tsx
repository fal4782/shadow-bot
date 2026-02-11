"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Database, HardDrive, ShieldAlert, X, Zap } from "lucide-react";

interface TrialLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrialLimitsModal({ isOpen, onClose }: TrialLimitsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5 z-10"
          >
            {/* Decorative Header Background */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-primary-50 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-text-400 hover:text-text-900 hover:bg-black/5 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative p-6 sm:p-8 pt-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20 ring-4 ring-white">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-text-900 tracking-tight mb-2">
                  Public Beta Active
                </h2>
                <p className="text-text-500 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                  You are currently using the Public Beta. Please note the
                  following limitations:
                </p>
              </div>

              {/* Limitations List */}
              <div className="space-y-3 mb-8">
                {/* 15 Mins */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary-50 border border-secondary-100/60 hover:border-primary-100 transition-colors group">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-white border border-secondary-100 text-orange-500 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-900 text-sm tracking-tight">
                      15-Minute Recording Limit
                    </h3>
                    <p className="text-xs text-text-500 font-medium mt-0.5 leading-relaxed">
                      Bot automatically leaves after 15 minutes of recording.
                    </p>
                  </div>
                </div>

                {/* 1 Concurrent */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary-50 border border-secondary-100/60 hover:border-primary-100 transition-colors group">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-white border border-secondary-100 text-blue-500 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-900 text-sm tracking-tight">
                      Single Concurrent Bot
                    </h3>
                    <p className="text-xs text-text-500 font-medium mt-0.5 leading-relaxed">
                      You can only have one active bot in a meeting at a time.
                    </p>
                  </div>
                </div>

                {/* 24h Retention */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary-50 border border-secondary-100/60 hover:border-primary-100 transition-colors group">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-white border border-secondary-100 text-rose-500 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-900 text-sm tracking-tight">
                      24-Hour Retention
                    </h3>
                    <p className="text-xs text-text-500 font-medium mt-0.5 leading-relaxed">
                      Recordings and transcripts are auto-deleted after 24
                      hours.
                    </p>
                  </div>
                </div>

                {/* Total Limit */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary-50 border border-secondary-100/60 hover:border-primary-100 transition-colors group">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-white border border-secondary-100 text-violet-500 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-900 text-sm tracking-tight">
                      Simultaneous Sessions Limited
                    </h3>
                    <p className="text-xs text-text-500 font-medium mt-0.5 leading-relaxed">
                      A limited number of total meetings can be recorded.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onClose}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>I Understand</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
