import { requireAdminAuth } from "./_shared/config.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  const authResult = requireAdminAuth(request);
  if (authResult) {
    return respond(authResult);
  }

  return new Response(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type, cache-control",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };
}

function respond({ status, body, headers = {} }) {
  const merged = { ...corsHeaders(), ...headers };
  if (body === null || body === undefined) {
    return new Response(null, { status, headers: merged });
  }
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...merged
    }
  });
}
