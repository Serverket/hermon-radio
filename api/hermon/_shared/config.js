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

function cloneDefaultState() {
  return { ...DEFAULT_OVERLAY_STATE, updated_at: new Date().toISOString() };
}

async function fetchEdgeConfigState() {
  if (!EDGE_CONFIG_ID || !EDGE_CONFIG_READ_TOKEN) {
    globalThis.__hermonOverlayState = globalThis.__hermonOverlayState || cloneDefaultState();
    return globalThis.__hermonOverlayState;
  }

  const endpoint = `https://edge-config.vercel.com/${EDGE_CONFIG_ID}/item/state?token=${EDGE_CONFIG_READ_TOKEN}`;
  const res = await fetch(endpoint, { cache: "no-store" });

  if (res.status === 404) {
    return cloneDefaultState();
  }

  if (!res.ok) {
    throw new Error(`Edge Config read failed (${res.status})`);
  }

  const payload = await res.json();
  if (!payload || typeof payload.item?.value !== "object") {
    return cloneDefaultState();
  }

  return payload.item.value;
}

async function writeEdgeConfigState(nextState) {
  const stateWithTimestamp = { ...nextState, updated_at: new Date().toISOString() };

  if (!EDGE_CONFIG_ID || !EDGE_CONFIG_WRITE_TOKEN) {
    globalThis.__hermonOverlayState = stateWithTimestamp;
    return stateWithTimestamp;
  }

  const res = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${EDGE_CONFIG_WRITE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: [
        {
          operation: "upsert",
          key: "state",
          value: stateWithTimestamp
        }
      ]
    })
  });

  if (!res.ok) {
    throw new Error(`Edge Config write failed (${res.status})`);
  }

  return stateWithTimestamp;
}

export async function getOverlayState() {
  return fetchEdgeConfigState();
}

export async function setOverlayState(nextState) {
  return writeEdgeConfigState(nextState);
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
