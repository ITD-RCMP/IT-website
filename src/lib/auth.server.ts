import { randomBytes, timingSafeEqual } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import {
  deleteCookie,
  getCookie,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";
import { getDb, query } from "@/lib/db.server";

export type AuthUser = {
  id: number;
  email: string;
};

type UserRow = RowDataPacket & AuthUser & {
  oid: string | null;
};

type MicrosoftConfig = {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  allowedDomain: string | null;
};

const SESSION_COOKIE = "itd_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const OAUTH_MAX_AGE = 60 * 10;
const OAUTH_STATE_COOKIE = "itd_ms_state";
const OAUTH_VERIFIER_COOKIE = "itd_ms_verifier";
const OAUTH_NONCE_COOKIE = "itd_ms_nonce";
const MICROSOFT_SCOPES = "openid profile email";

function encodeSession(session: AuthUser): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(raw: string): AuthUser | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Partial<AuthUser>;
    if (typeof parsed.id !== "number" || typeof parsed.email !== "string") {
      return null;
    }
    return { id: parsed.id, email: parsed.email };
  } catch {
    try {
      const parsed = JSON.parse(raw) as Partial<AuthUser>;
      if (typeof parsed.id !== "number" || typeof parsed.email !== "string") {
        return null;
      }
      return { id: parsed.id, email: parsed.email };
    } catch {
      return null;
    }
  }
}

function cookieSecure(): boolean {
  try {
    return getRequestProtocol() === "https";
  } catch {
    return false;
  }
}

function writeAuthSession(user: AuthUser) {
  setCookie(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: cookieSecure(),
    maxAge: SESSION_MAX_AGE,
  });
}

function setOauthCookie(name: string, value: string) {
  setCookie(name, value, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: cookieSecure(),
    maxAge: OAUTH_MAX_AGE,
  });
}

function clearOauthCookies() {
  const options = { path: "/", secure: cookieSecure(), sameSite: "lax" as const };
  deleteCookie(OAUTH_STATE_COOKIE, options);
  deleteCookie(OAUTH_VERIFIER_COOKIE, options);
  deleteCookie(OAUTH_NONCE_COOKIE, options);
}

function randomUrlSafe(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return Buffer.from(digest).toString("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function redirectTo(url: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  });
}

function publicProtocol(): "http" | "https" | null {
  try {
    const proto = getRequestProtocol();
    if (proto === "https") return "https";
    if (proto === "http") return "http";
  } catch {
    return null;
  }
  return null;
}

function appUrl(request: Request, pathname: string, search?: Record<string, string>): string {
  const url = new URL(pathname, request.url);
  const proto = publicProtocol();
  if (proto) url.protocol = `${proto}:`;
  if (search) {
    for (const [key, value] of Object.entries(search)) url.searchParams.set(key, value);
  }
  return url.toString();
}

function loginError(request: Request, code: string): Response {
  return redirectTo(appUrl(request, "/about", { error: code }));
}

function queryParam(url: URL, name: string): string | null {
  const raw = url.search.startsWith("?") ? url.search.slice(1) : url.search;
  if (!raw) return null;
  for (const part of raw.split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const rawKey = eq === -1 ? part : part.slice(0, eq);
    const rawValue = eq === -1 ? "" : part.slice(eq + 1);
    let key = rawKey;
    let value = rawValue;
    try {
      key = decodeURIComponent(rawKey.replace(/\+/g, "%2B"));
      value = decodeURIComponent(rawValue.replace(/\+/g, "%2B"));
    } catch {
      continue;
    }
    if (key === name) return value;
  }
  return null;
}

function getMicrosoftConfig(): MicrosoftConfig | null {
  const clientId = process.env.MICROSOFT_CLIENT_ID?.trim();
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET?.trim();
  const tenantId = process.env.MICROSOFT_TENANT_ID?.trim();
  if (!clientId || !clientSecret || !tenantId) {
    return null;
  }

  const allowedDomain = process.env.MICROSOFT_ALLOWED_DOMAIN?.trim().toLowerCase().replace(/^@/, "") || null;
  return { clientId, clientSecret, tenantId, allowedDomain };
}

function microsoftRedirectUri(request: Request): string {
  const origin = new URL(appUrl(request, "/")).origin;
  const callback = `${origin}/auth/microsoft/callback`;
  const configured = process.env.MICROSOFT_REDIRECT_URI?.trim();
  if (!configured) return callback;
  try {
    if (new URL(configured).origin === origin) return configured;
  } catch {
    return callback;
  }
  return callback;
}

function microsoftAuthority(tenantId: string): string {
  return `https://login.microsoftonline.com/${tenantId}`;
}

function emailFromPayload(payload: JWTPayload): string | null {
  const candidates = [payload.email, payload.preferred_username, payload.upn, payload.unique_name];
  for (const value of candidates) {
    if (typeof value === "string" && value.includes("@")) {
      return value.trim().toLowerCase();
    }
  }
  return null;
}

async function emailFromGraph(accessToken: string): Promise<string | null> {
  const response = await fetch("https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;

  const data = (await response.json()) as { mail?: unknown; userPrincipalName?: unknown };
  const candidates = [data.mail, data.userPrincipalName];
  for (const value of candidates) {
    if (typeof value === "string" && value.includes("@")) {
      return value.trim().toLowerCase();
    }
  }
  return null;
}

function oidFromPayload(payload: JWTPayload): string | null {
  return typeof payload.oid === "string" && payload.oid.trim() ? payload.oid.trim() : null;
}

function isMissingOidColumn(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { code?: string; sqlMessage?: string; message?: string };
  const message = `${err.sqlMessage ?? ""} ${err.message ?? ""}`;
  return err.code === "ER_BAD_FIELD_ERROR" && message.includes("oid");
}

async function loadUserByEmail(email: string): Promise<UserRow | null> {
  try {
    const rows = await query<UserRow[]>("SELECT id, email, oid FROM users WHERE email = ? LIMIT 1", [email]);
    return rows[0] ?? null;
  } catch (error) {
    if (!isMissingOidColumn(error)) throw error;
    await getDb()
      .execute("ALTER TABLE users ADD COLUMN oid VARCHAR(64) NULL")
      .catch(() => undefined);
    try {
      const rows = await query<UserRow[]>("SELECT id, email, oid FROM users WHERE email = ? LIMIT 1", [email]);
      return rows[0] ?? null;
    } catch (retryError) {
      if (!isMissingOidColumn(retryError)) throw retryError;
      const rows = await query<UserRow[]>("SELECT id, email FROM users WHERE email = ? LIMIT 1", [email]);
      return rows[0] ?? null;
    }
  }
}

async function findAuthorizedUser(email: string, oid: string): Promise<AuthUser | null> {
  const row = await loadUserByEmail(email);
  if (!row) return null;

  const storedOid = row.oid ? String(row.oid) : "";
  if (storedOid && storedOid !== oid) return null;

  if (!storedOid && "oid" in row) {
    await getDb().execute("UPDATE users SET oid = ? WHERE id = ? AND oid IS NULL", [oid, Number(row.id)]);
  }

  return { id: Number(row.id), email: String(row.email) };
}

export async function startMicrosoftSso(request: Request): Promise<Response> {
  const config = getMicrosoftConfig();
  if (!config) {
    return loginError(request, "config");
  }

  const state = randomUrlSafe();
  const nonce = randomUrlSafe();
  const verifier = randomUrlSafe(48);
  const challenge = await pkceChallenge(verifier);

  setOauthCookie(OAUTH_STATE_COOKIE, state);
  setOauthCookie(OAUTH_NONCE_COOKIE, nonce);
  setOauthCookie(OAUTH_VERIFIER_COOKIE, verifier);

  const authorize = new URL(`${microsoftAuthority(config.tenantId)}/oauth2/v2.0/authorize`);
  authorize.searchParams.set("client_id", config.clientId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", microsoftRedirectUri(request));
  authorize.searchParams.set("response_mode", "query");
  authorize.searchParams.set("scope", MICROSOFT_SCOPES);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("nonce", nonce);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");
  authorize.searchParams.set("prompt", "select_account");

  return redirectTo(authorize.toString());
}

export async function finishMicrosoftSso(request: Request): Promise<Response> {
  const config = getMicrosoftConfig();
  if (!config) {
    clearOauthCookies();
    return loginError(request, "config");
  }

  const url = new URL(request.url);
  const oauthError = queryParam(url, "error");
  if (oauthError) {
    clearOauthCookies();
    return loginError(request, oauthError === "access_denied" ? "access_denied" : "failed");
  }

  const code = queryParam(url, "code");
  const state = queryParam(url, "state");
  const expectedState = getCookie(OAUTH_STATE_COOKIE);
  const verifier = getCookie(OAUTH_VERIFIER_COOKIE);
  const expectedNonce = getCookie(OAUTH_NONCE_COOKIE);
  clearOauthCookies();

  if (!code || !state || !expectedState || !verifier || !expectedNonce || !safeEqual(state, expectedState)) {
    return loginError(request, "invalid");
  }

  try {
    const tokenResponse = await fetch(`${microsoftAuthority(config.tenantId)}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: microsoftRedirectUri(request),
        code_verifier: verifier,
      }),
    });

    if (!tokenResponse.ok) {
      const failure = (await tokenResponse.json().catch(() => null)) as {
        error?: string;
        error_description?: string;
      } | null;
      const description = failure?.error_description?.split("\r\n")[0] ?? "";
      console.error("Microsoft token exchange failed:", tokenResponse.status, failure?.error, description);
      return loginError(request, failure?.error === "invalid_client" ? "config" : "failed");
    }

    const tokens = (await tokenResponse.json()) as {
      id_token?: unknown;
      access_token?: unknown;
    };

    if (typeof tokens.id_token !== "string") {
      return loginError(request, "failed");
    }

    const jwks = createRemoteJWKSet(
      new URL(`${microsoftAuthority(config.tenantId)}/discovery/v2.0/keys`),
    );
    const { payload } = await jwtVerify(tokens.id_token, jwks, {
      audience: config.clientId,
      clockTolerance: 60,
    });

    const tenant =
      config.tenantId === "common" ||
      config.tenantId === "organizations" ||
      config.tenantId === "consumers"
        ? typeof payload.tid === "string"
          ? payload.tid
          : ""
        : config.tenantId;

    if (!tenant || payload.iss !== `${microsoftAuthority(tenant)}/v2.0`) {
      return loginError(request, "invalid");
    }

    if (
      config.tenantId !== "common" &&
      config.tenantId !== "organizations" &&
      config.tenantId !== "consumers" &&
      payload.tid !== config.tenantId
    ) {
      return loginError(request, "unauthorized");
    }

    if (typeof payload.nonce !== "string" || !safeEqual(payload.nonce, expectedNonce)) {
      return loginError(request, "invalid");
    }

    let email = emailFromPayload(payload);
    if (!email && typeof tokens.access_token === "string") {
      email = await emailFromGraph(tokens.access_token);
    }
    const oid = oidFromPayload(payload);
    if (!email || !oid) {
      return loginError(request, "failed");
    }

    if (config.allowedDomain && email.split("@")[1] !== config.allowedDomain) {
      return loginError(request, "unauthorized");
    }

    const user = await findAuthorizedUser(email, oid);
    if (!user) {
      return loginError(request, "unauthorized");
    }

    writeAuthSession(user);
    return redirectTo(appUrl(request, "/admin"));
  } catch (error) {
    console.error("finishMicrosoftSso failed:", error);
    return loginError(request, "failed");
  }
}

export function readAuthSession(): AuthUser | null {
  const raw = getCookie(SESSION_COOKIE);
  if (!raw) return null;
  return decodeSession(raw);
}

export function clearAuthSession() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}
