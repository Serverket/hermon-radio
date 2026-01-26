const DEFAULT_INTERVAL_MS = 10000;

export function subscribeOverlay(baseUrl, onData, options = {}) {
  if (!baseUrl) return () => {};

  const root = baseUrl.replace(/\/$/, '');
  const intervalMs = Math.max(1000, options.intervalMs || DEFAULT_INTERVAL_MS);

  let stopped = false;
  let timerId = null;
  let lastEtag = null;

  const fetchOverlay = async () => {
    if (stopped) return;

    try {
      const headers = {};
      if (lastEtag) {
        headers['If-None-Match'] = lastEtag;
      }

      const res = await fetch(`${root}/overlay`, {
        method: 'GET',
        headers
      });

      const etag = res.headers.get('etag');
      if (etag) {
        lastEtag = etag;
      }

      if (res.status === 304 || stopped) {
        return;
      }

      if (!res.ok) {
        throw new Error('overlay-fetch-failed');
      }

      const payload = await res.json();
      if (!stopped) {
        onData(payload);
      }
    } catch (err) {
      // ignore errors to keep scheduler alive
    } finally {
      if (!stopped) {
        timerId = setTimeout(fetchOverlay, intervalMs);
      }
    }
  };

  timerId = setTimeout(fetchOverlay, 0);

  return () => {
    stopped = true;
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
