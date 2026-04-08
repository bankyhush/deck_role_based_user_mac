// app/providers.tsx
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function SessionWatcher() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleExpiry = () => {
      queryClient.clear(); // clear cache before redirect
    };

    window.addEventListener("session-expired", handleExpiry);
    return () => window.removeEventListener("session-expired", handleExpiry);
  }, []);

  return null;
}
