export function subscribeOverlay(baseUrl, onData, { intervalMs = 10000 } = {}) {
  if (!baseUrl) return () => {};
  const root = baseUrl.replace(/\/$/, '');
  let stopped = false;
  let timerId = null;
  let lastSignature = null;

  const controller = new AbortController();

  const schedule = () => {
    if (stopped) return;
    timerId = setTimeout(fetchOnce, intervalMs);
  };

  const fetchOnce = async () => {
    if (stopped) return;
    try {
      const res = await fetch(`${root}/overlay`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      if (!res.ok) throw new Error('overlay-fetch-failed');
      const data = await res.json();
      const signature = JSON.stringify(data);
      if (signature !== lastSignature) {
        lastSignature = signature;
        onData(data);
      }
    } catch (err) {
      // swallow errors to keep polling
    } finally {
      schedule();
    }
  };

  fetchOnce();

  return () => {
    stopped = true;
    controller.abort();
    if (timerId) clearTimeout(timerId);
  };
}

export async function authCheck(baseUrl, creds) {
  const url = `${baseUrl.replace(/\/$/, '')}/auth-check`;
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
