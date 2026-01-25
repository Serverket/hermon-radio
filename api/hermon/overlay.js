import { getOverlayState, setOverlayState, requireAdminAuth, jsonResponse } from "./_shared/config.js";

export const config = { runtime: "edge" };

const ALLOWED_TYPES = new Set(["image", "youtube", "text", "hls"]);
const ALLOWED_POSITIONS = new Set(["inline", "fullscreen"]);
const ALLOWED_FIT = new Set(["contain", "cover"]);

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders("PUT, GET, OPTIONS") });
  }

  if (request.method === "GET") {
    return handleGet();
  }

  if (request.method === "PUT") {
    return handlePut(request);
  }

  return new Response(null, { status: 405, headers: corsHeaders("PUT, GET, OPTIONS") });
}

async function handleGet() {
  try {
    const state = await getOverlayState();
    return jsonResponse(state, {
      headers: {
        ...corsHeaders("PUT, GET, OPTIONS", false),
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return jsonResponse({ error: "Failed to load overlay" }, {
      status: 500,
      headers: {
        ...corsHeaders("PUT, GET, OPTIONS", false),
        "Cache-Control": "no-store"
      }
    });
  }
}

async function handlePut(request) {
  const authResult = requireAdminAuth(request);
  if (authResult) {
    return respond(authResult, "PUT, GET, OPTIONS");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON" }, {
      status: 400,
      headers: corsHeaders("PUT, GET, OPTIONS", false)
    });
  }

  const nextState = normalizeState(payload);
  try {
    const stored = await setOverlayState(nextState);
    return jsonResponse(stored, {
      headers: {
        ...corsHeaders("PUT, GET, OPTIONS", false),
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return jsonResponse({ error: "Failed to persist overlay" }, {
      status: 500,
      headers: {
        ...corsHeaders("PUT, GET, OPTIONS", false),
        "Cache-Control": "no-store"
      }
    });
  }
}

function normalizeState(body) {
  return {
    visible: Boolean(body.visible),
    type: ALLOWED_TYPES.has(body.type) ? body.type : "image",
    url: typeof body.url === "string" ? body.url : "",
    position: ALLOWED_POSITIONS.has(body.position) ? body.position : "inline",
    fit: ALLOWED_FIT.has(body.fit) ? body.fit : "contain",
    source: "url",
    title: typeof body.title === "string" ? body.title : "",
    text: typeof body.text === "string" ? body.text : "",
    bgColor: typeof body.bgColor === "string" ? body.bgColor : "#2563eb",
    textColor: typeof body.textColor === "string" ? body.textColor : "#ffffff"
  };
}

function corsHeaders(allowMethods, includeCredentials = true) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": allowMethods
  };

  if (includeCredentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

function respond({ status, body, headers = {} }, methods) {
  const mergedHeaders = { ...corsHeaders(methods, false), ...headers };
  if (body === null || body === undefined) {
    return new Response(null, { status, headers: mergedHeaders });
  }
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...mergedHeaders
    }
  });
}
