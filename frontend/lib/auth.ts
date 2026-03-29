"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/api";
import type { SessionUser, UserRole } from "@/lib/types";

export function hasRoleAccess(role: string | undefined | null, allowedRoles?: UserRole[]) {
  if (!allowedRoles?.length) return true;
  if (!role) return false;
  return allowedRoles.includes(role as UserRole);
}

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    if (!storedUser) {
      router.replace("/login");
      setReady(true);
      return;
    }

    if (!hasRoleAccess(storedUser.role, allowedRoles)) {
      router.replace("/dashboard");
      setReady(true);
      return;
    }

    setReady(true);
  }, [allowedRoles, router]);

  const authorized = useMemo(() => {
    if (!user) return false;
    return hasRoleAccess(user.role, allowedRoles);
  }, [allowedRoles, user]);

  return { user, ready, authorized };
}
