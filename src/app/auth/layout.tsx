"use client";
import GuestGuard from "@/app/components/auth/GuestGuard";
import RecaptchaProvider from "@/app/components/shared/RecaptchaProvider";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <RecaptchaProvider>{children}</RecaptchaProvider>
    </GuestGuard>
  );
}
