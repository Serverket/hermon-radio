export function subscribeOverlay(baseUrl, onData) {
  if (!baseUrl) return () => { };
  const cleanUrl = baseUrl.replace(/\/$/, '');

  // 1. SSE Connection (Real-time)
  const sseUrl = `${cleanUrl}/overlay/stream`;
  const es = new EventSource(sseUrl, { withCredentials: false });
  es.onopen = () => { /* connected */ };
  es.onmessage = (evt) => {
    try { onData(JSON.parse(evt.data)); } catch (e) { }
  };
  es.onerror = (err) => { };

  // 2. Polling Fallback (Guarantees delivery every 3s if SSE fails/blocks)
  // This ensures everyone gets updates eventually, even on restrictive networks.
  const intervalId = setInterval(async () => {
    try {
      const res = await fetch(`${cleanUrl}/overlay`);
      if (res.ok) {
        const data = await res.json();
        onData(data);
      }
    } catch (e) {
      // Silent fail on polling error to avoid log spam
    }
  }, 3000);

  return () => {
    es.close();
    clearInterval(intervalId);
  };
}

export async function authCheck(baseUrl, creds) {
  const url = `${baseUrl.replace(/\/$/, '')}/overlay/auth-check`;
  const headers = {};
  if (creds?.user && creds?.pass) {
    headers['Authorization'] = 'Basic ' + btoa(`${creds.user}:${creds.pass}`);
  }
  const res = await fetch(url, { method: 'GET', headers });
  if (res.status === 204) return true;
  if (res.status === 401 || res.status === 403) throw new Error('unauthorized');
  throw new Error('auth-check-failed');
}

export async function putOverlay(baseUrl, creds, payload) {
  const url = `${baseUrl.replace(/\/$/, '')}/overlay`;
  const headers = { 'Content-Type': 'application/json' };
  if (creds?.user && creds?.pass) {
    headers['Authorization'] = 'Basic ' + btoa(`${creds.user}:${creds.pass}`);
  }
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to update overlay');
  return res.json();
}
