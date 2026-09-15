import { createServerFn } from "@tanstack/react-start";
import { clearAuthSession, readAuthSession } from "@/lib/auth.server";

export type AuthUser = {
  id: number;
  email: string;
};

export const getAuthUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return readAuthSession();
  } catch (error) {
    console.error("getAuthUser failed:", error);
    return null;
  }
});

export const logoutUser = createServerFn({ method: "POST" }).handler(async () => {
  try {
    clearAuthSession();
  } catch (error) {
    console.error("logoutUser failed:", error);
  }
  return { ok: true as const };
});
