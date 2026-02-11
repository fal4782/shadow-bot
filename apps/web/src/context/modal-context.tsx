"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { TrialLimitsModal } from "@/components/trial-limits-modal";

interface ModalContextType {
  openModal: () => void;
  closeModal: () => void;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check session storage on mount
    const hasSeen = sessionStorage.getItem("hasSeenTrialNotice");
    if (!hasSeen) {
      setIsOpen(true);
      sessionStorage.setItem("hasSeenTrialNotice", "true");
    }
  }, []);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      <TrialLimitsModal isOpen={isOpen} onClose={closeModal} />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
