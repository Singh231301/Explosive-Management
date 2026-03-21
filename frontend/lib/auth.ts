"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/api";

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    if (!getStoredUser()) {
      router.replace("/login");
    }
  }, [router]);
}

