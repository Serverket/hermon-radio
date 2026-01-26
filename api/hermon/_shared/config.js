const DEFAULT_OVERLAY_STATE = {
  visible: false,
  type: "image",
  url: "",
  position: "inline",
  fit: "contain",
  source: "url",
  title: "",
  text: "",
  bgColor: "#2563eb",
  textColor: "#ffffff",
  updated_at: new Date().toISOString()
};

const EDGE_CONFIG_CONNECTION = process.env.EDGE_CONFIG || "";
const EDGE_CONFIG_ID = deriveEdgeConfigId();
const EDGE_CONFIG_READ_TOKEN = deriveEdgeConfigToken("read");
const EDGE_CONFIG_WRITE_TOKEN = deriveEdgeConfigToken("write");
const OVERLAY_CACHE_URL = process.env.OVERLAY_CACHE_URL || "";
const OVERLAY_CACHE_TOKEN = process.env.OVERLAY_CACHE_TOKEN || "";
const OVERLAY_CACHE_TEAM_ID = process.env.OVERLAY_CACHE_TEAM_ID || "";

function memoryStore() {
  if (!globalThis.__hermonOverlayStore) {
    globalThis.__hermonOverlayStore = {
      state: cloneDefaultState()
    };
  }
  return globalThis.__hermonOverlayStore;
}

export function storageMode() {
  return EDGE_CONFIG_ID && EDGE_CONFIG_READ_TOKEN && EDGE_CONFIG_WRITE_TOKEN
    ? "edge-config"
    : "memory";
}

export function overlayCacheControlHeader() {
  // If we have the invalidation secrets, we can use a long-lived cache (1 year)
  // because we can manually purge it when data changes.
  // stale-while-revalidate=120 provides a fallback buffer.
  return OVERLAY_CACHE_URL && OVERLAY_CACHE_TOKEN
    ? "public, max-age=0, s-maxage=31536000, stale-while-revalidate=120"
    : "no-cache";
}

function cloneDefaultState() {
  return { ...DEFAULT_OVERLAY_STATE, updated_at: new Date().toISOString() };
}

async function fetchEdgeConfigValue(key, fallback) {
  if (!EDGE_CONFIG_ID || !EDGE_CONFIG_READ_TOKEN) {
    return fallback;
  }

  const endpoint = `https://edge-config.vercel.com/${EDGE_CONFIG_ID}/item/${encodeURIComponent(key)}?token=${EDGE_CONFIG_READ_TOKEN}`;
  const res = await fetch(endpoint, { cache: "no-store" });

  if (res.status === 404) {
    return fallback;
  }

  if (!res.ok) {
    throw new Error(`Edge Config read failed (${res.status})`);
  }

  const payload = await res.json();
  if (payload && typeof payload === "object") {
    if (payload.item && typeof payload.item.value !== "undefined") {
      return payload.item.value;
    }
    if (!payload.item) {
      return payload;
    }
  }

  return fallback;
}

async function patchEdgeConfigItems(items) {
  if (!EDGE_CONFIG_ID || !EDGE_CONFIG_WRITE_TOKEN) {
    throw new Error("Edge Config write not configured");
  }

  const res = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${EDGE_CONFIG_WRITE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items })
  });

  if (!res.ok) {
    throw new Error(`Edge Config write failed (${res.status})`);
  }
}

async function fetchOverlayState() {
  const store = memoryStore();

  if (!EDGE_CONFIG_ID || !EDGE_CONFIG_READ_TOKEN) {
    return store.state;
  }

  const value = await fetchEdgeConfigValue("state", null);
  if (value && typeof value === "object") {
    store.state = value;
    return value;
  }

  store.state = cloneDefaultState();
  return store.state;
}

async function writeOverlayState(nextState) {
  const store = memoryStore();
  const stateWithTimestamp = { ...nextState, updated_at: new Date().toISOString() };

  if (!EDGE_CONFIG_ID || !EDGE_CONFIG_WRITE_TOKEN) {
    store.state = stateWithTimestamp;
    return store.state;
  }

  await patchEdgeConfigItems([
    {
      operation: "upsert",
      key: "state",
      value: stateWithTimestamp
    }
  ]);

  store.state = stateWithTimestamp;
  return store.state;
}

export async function getOverlayState() {
  return fetchOverlayState();
}

export async function setOverlayState(nextState) {
  const stored = await writeOverlayState(nextState);
  await invalidateOverlayCache();
  return stored;
}

export async function computeOverlayEtag(state) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(state));
    const digest = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return `"${hashHex}"`;
  } catch {
    return `"${Date.now().toString(36)}"`;
  }
}

async function invalidateOverlayCache() {
  if (!OVERLAY_CACHE_URL || !OVERLAY_CACHE_TOKEN) {
    console.warn("Skipping cache invalidation: Missing OVERLAY_CACHE_URL or OVERLAY_CACHE_TOKEN");
    return;
  }

  try {
    // URL can be a comma-separated list of paths to invalidate
    const urls = OVERLAY_CACHE_URL.split(",").map((value) => value.trim()).filter(Boolean);
    if (!urls.length) {
      return;
    }

    const body = { urls };
    if (OVERLAY_CACHE_TEAM_ID) {
      body.teamId = OVERLAY_CACHE_TEAM_ID;
    }

    // Call Vercel's purge endpoint
    const res = await fetch("https://api.vercel.com/v2/swr/invalidate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OVERLAY_CACHE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      console.warn("Failed to invalidate overlay cache", await res.text());
    } else {
      console.log("Successfully invalidated overlay cache for:", urls);
    }
  } catch (error) {
    console.warn("Overlay cache invalidation error", error);
  }
}

function deriveEdgeConfigId() {
  if (process.env.EDGE_CONFIG_ID) return process.env.EDGE_CONFIG_ID;
  if (!EDGE_CONFIG_CONNECTION) return "";
  try {
    const url = new URL(EDGE_CONFIG_CONNECTION);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] || "";
  } catch {
    return "";
  }
}

function deriveEdgeConfigToken(type) {
  const envKey = type === "write" ? "EDGE_CONFIG_WRITE_TOKEN" : "EDGE_CONFIG_READ_TOKEN";
  if (process.env[envKey]) return process.env[envKey];
  if (!EDGE_CONFIG_CONNECTION) return "";
  try {
    const url = new URL(EDGE_CONFIG_CONNECTION);
    return url.searchParams.get("token") || "";
  } catch {
    return "";
  }
}

export function requireAdminAuth(request) {
  const expectedUser = process.env.VERCEL_ADMIN_USER || "";
  const expectedPass = process.env.VERCEL_ADMIN_PASS || "";

  if (!expectedUser || !expectedPass) {
    return {
      status: 500,
      body: { error: "Admin credentials not configured" },
      headers: { "Content-Type": "application/json" }
    };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return {
      status: 401,
      body: null,
      headers: { "WWW-Authenticate": "Basic realm=\"Hermon Overlay\"" }
    };
  }

  const decoded = atob(authHeader.slice(6));
  const [user, pass] = decoded.split(":");
  if (user !== expectedUser || pass !== expectedPass) {
    return {
      status: 403,
      body: { error: "Forbidden" },
      headers: { "Content-Type": "application/json" }
    };
  }

  return null;
}

export function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    status: init.status || 200
  });
}
