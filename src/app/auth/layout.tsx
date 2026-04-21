"use client";
import GuestGuard from "@/app/components/auth/GuestGuard";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuestGuard>{children}</GuestGuard>;
}
