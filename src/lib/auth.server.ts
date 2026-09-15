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
const MICROSOFT_SCOPES = "openid profile email User.Read";

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
  const options = { path: "/" };
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

function loginError(request: Request, code: string): Response {
  const url = new URL("/about", request.url);
  url.searchParams.set("error", code);
  return redirectTo(url.toString());
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
  const configured = process.env.MICROSOFT_REDIRECT_URI?.trim();
  if (configured) return configured;
  return `${new URL(request.url).origin}/auth/microsoft/callback`;
}

function microsoftAuthority(tenantId: string): string {
  return `https://login.microsoftonline.com/${tenantId}`;
}

function emailFromPayload(payload: JWTPayload): string | null {
  const candidates = [payload.email, payload.preferred_username, payload.upn];
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

async function findAuthorizedUser(email: string, oid: string): Promise<AuthUser | null> {
  const rows = await query<UserRow[]>("SELECT id, email, oid FROM users WHERE email = ? LIMIT 1", [email]);
  const row = rows[0];
  if (!row) return null;

  const storedOid = row.oid ? String(row.oid) : "";
  if (storedOid && storedOid !== oid) return null;

  if (!storedOid) {
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
  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    clearOauthCookies();
    return loginError(request, oauthError === "access_denied" ? "access_denied" : "failed");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
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
      console.error("Microsoft token exchange failed:", tokenResponse.status);
      return loginError(request, "failed");
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
    return redirectTo(new URL("/admin", request.url).toString());
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
