"use client";

import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "@/context/modal-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ModalProvider>{children}</ModalProvider>
    </SessionProvider>
  );
};
