"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

interface UserProfileBadgeProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserProfileBadge({ user }: UserProfileBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/70 backdrop-blur-md border border-text-200/50 hover:bg-white hover:border-text-300 transition-all shadow-sm cursor-pointer"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-text-200"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-text-200 flex items-center justify-center text-text-600 text-xs font-semibold">
            {user.name?.charAt(0) || "?"}
          </div>
        )}
        <span className="text-sm font-semibold text-text-700 hidden sm:inline max-w-[120px] truncate">
          {user.name || "User"}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-text-200/60 shadow-xl shadow-text-900/5 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-text-200/50">
              <p className="text-sm font-semibold text-text-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-text-400 truncate mt-0.5">
                {user.email}
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
