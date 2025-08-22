export function subscribeOverlay(baseUrl, onData) {
  if (!baseUrl) return () => {};
  const url = `${baseUrl.replace(/\/$/, '')}/overlay/stream`;
  const es = new EventSource(url, { withCredentials: false });
  es.onmessage = (evt) => {
    try { onData(JSON.parse(evt.data)); } catch {}
  };
  es.onerror = () => { /* keep open; browser will retry */ };
  return () => es.close();
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
