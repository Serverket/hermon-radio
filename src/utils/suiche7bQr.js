/**
 * Bancaribe donation details and authentic Suiche 7B (QR|S7B)
 * Pago Móvil Interbancario payload builder.
 *
 * Implements the `origin=web` RSA-2048 PKCS#1 v1.5 format observed in
 * official physical/web Suiche 7B QRs and verified with `decoder-qr-pago-movil`:
 *   Format: `<Base64(RSA-2048(JSON))>?merchantId=0114&strong_id=<unix_ts>&origin=web`
 *   JSON:   { id, name, phone, bank, versions }
 *
 * Also retains `buildSuiche7bAesPayload` (`origin=app`, AES-256-CBC).
 */

export const BANK_DONATION_DATA = {
  bankName: 'Bancaribe',
  bankCode: '0114',
  accountNumber: '01140370113700093360',
  rif: 'J306723072',
  holderName: 'ASOCIACION CIVIL IGLESIA EVANGELICA HERMON',
  merchantName: 'IGLESIA EVANGELICA HERMON',
  pagoMovilPhone: (import.meta.env?.VITE_S7B_PHONE || '04144887751').trim(),
};

const S7B_DEFAULT_VERSIONS = 'versionName: 1.0.11.5 - keyVersion: 1';
const RSA_PUBLIC_EXPONENT = 65537n;

// Public RSA-2048 modulus for Bancaribe (0114) Suiche 7B `origin=web` payloads (no private key)
const S7B_BANCARIBE_RSA_PUBLIC = {
  '0114':
    '8a927a28adac88305b8037dd00564e3658b0dced8d01224e6b831f8c48aa1370' +
    'cc3152eacd777b1419ae3311693680d1fc8303c406cd76f4436e067c7df2879c' +
    'b9b08618ad3deaa804a94edd743b181688b63c2cb0d859431f31a1ad01978d3f' +
    'ce0775beeb096a8209f8070fda9765601293c61bdacb74f4a12f6dd40861728a' +
    '797fca61d294a485ec1c6d3b73a7dbc4a893593ba498000c2f8fccbdeb2e7da9' +
    '13dfd6a75947646694deebb6f801620eee635926579d4ff10865bca9f9222bcc' +
    '498b89c8dbc88a84588e1428ce76be4f515a36d67d4f3bf4e82cf4366f5766e6' +
    'd99a9bb7407795c60b4f25ecb5075871538ecb0b2955a7bd1c7fd350099f9c87',
};

// Suiche 7B AES-256-CBC key & IV for Bancaribe (0114) `origin=app`
const S7B_BANCARIBE_AES = {
  '0114': {
    key: '4eae63f8e3180fc3a9446c8c70c65486',
    iv: 'a1265b033bf5d11e',
  },
};

export function formatReadableBankText(data = BANK_DONATION_DATA) {
  const lines = [
    `Banco: ${data.bankName} (${data.bankCode})`,
    `Cuenta: ${data.accountNumber}`,
    `RIF: ${data.rif}`,
    `Titular: ${data.holderName}`,
  ];
  const phone = normalizeVenezuelanPhone(data.pagoMovilPhone);
  if (phone) {
    lines.push(`Pago Móvil: 0${phone.slice(2)}`);
  }
  return lines.join('\n');
}

/**
 * Normalizes a Venezuelan mobile number (e.g. `0414-1234567`, `+584141234567`)
 * into the `584XXXXXXXXX` 12-digit format expected by Suiche 7B QRs.
 */
export function normalizeVenezuelanPhone(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (/^584(12|14|16|24|26)\d{7}$/.test(digits)) return digits;
  if (/^04(12|14|16|24|26)\d{7}$/.test(digits)) return `58${digits.slice(1)}`;
  if (/^4(12|14|16|24|26)\d{7}$/.test(digits)) return `58${digits}`;
  return '';
}

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function bytesToHex(bytes) {
  let hex = '';
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToBytes(hex, byteLength) {
  const padded = hex.padStart(byteLength * 2, '0');
  const out = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i += 1) {
    out[i] = parseInt(padded.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function modPow(base, exponent, modulus) {
  let result = 1n;
  let b = base % modulus;
  let e = exponent;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % modulus;
    e >>= 1n;
    if (e > 0n) b = (b * b) % modulus;
  }
  return result;
}

function fillNonZeroRandomBytes(target) {
  const csprng = globalThis.crypto;
  if (typeof csprng?.getRandomValues !== 'function') return false;
  const scratch = new Uint8Array(Math.max(32, target.length));
  let offset = 0;
  while (offset < target.length) {
    csprng.getRandomValues(scratch);
    for (let i = 0; i < scratch.length && offset < target.length; i += 1) {
      if (scratch[i] !== 0) {
        target[offset] = scratch[i];
        offset += 1;
      }
    }
  }
  return true;
}

/**
 * Encrypts UTF-8 bytes with RSAES-PKCS1-V1_5 using the public modulus and e=65537.
 */
function rsaEncryptPkcs1v15(plainBytes, modulusHex) {
  const k = modulusHex.length / 2;
  if (!Number.isInteger(k) || plainBytes.length > k - 11) return null;

  const psLen = k - plainBytes.length - 3;
  const em = new Uint8Array(k);
  em[0] = 0x00;
  em[1] = 0x02;
  if (!fillNonZeroRandomBytes(em.subarray(2, 2 + psLen))) return null;
  em[2 + psLen] = 0x00;
  em.set(plainBytes, 3 + psLen);

  const modulus = BigInt(`0x${modulusHex}`);
  const m = BigInt(`0x${bytesToHex(em)}`);
  const c = modPow(m, RSA_PUBLIC_EXPONENT, modulus);
  return hexToBytes(c.toString(16), k);
}

function prepareSuiche7bContext(data = BANK_DONATION_DATA, options = {}) {
  const phone = normalizeVenezuelanPhone(data.pagoMovilPhone);
  const bankCode = String(data.bankCode || '').trim();
  const cleanId = String(data.rif || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (!phone || !bankCode || !/^[VJG]\d+$/.test(cleanId)) return null;

  const name = String(data.holderName || data.merchantName || '').trim();
  const versions = options.versions ?? S7B_DEFAULT_VERSIONS;
  const strongId = String(options.strongId || Math.floor(Date.now() / 1000));

  const jsonPayload = JSON.stringify({
    id: cleanId,
    ...(name && { name }),
    phone,
    bank: bankCode,
    ...(versions && { versions }),
  });

  return { bankCode, strongId, jsonPayload };
}

/**
 * Generates an official Suiche 7B Pago Móvil QR payload encrypted with
 * RSA-2048 PKCS#1 v1.5 (`origin=web`, matching printed Suiche 7B QRs).
 * Returns `''` if no valid Pago Móvil phone number is configured.
 */
export async function buildSuiche7bPayload(data = BANK_DONATION_DATA, options = {}) {
  const ctx = prepareSuiche7bContext(data, options);
  if (!ctx) return '';

  const modulusHex = S7B_BANCARIBE_RSA_PUBLIC[ctx.bankCode];
  if (!modulusHex) return '';

  const plainBytes = new TextEncoder().encode(ctx.jsonPayload);
  const cipherBytes = rsaEncryptPkcs1v15(plainBytes, modulusHex);
  if (!cipherBytes) return '';

  const cipherBase64 = bytesToBase64(cipherBytes);
  return `${cipherBase64}?merchantId=${ctx.bankCode}&strong_id=${ctx.strongId}&origin=web`;
}

/**
 * Alternative AES-256-CBC (`origin=app`) Suiche 7B payload builder via Web Crypto.
 */
export async function buildSuiche7bAesPayload(data = BANK_DONATION_DATA, options = {}) {
  const ctx = prepareSuiche7bContext(data, options);
  if (!ctx) return '';

  const keyPair = S7B_BANCARIBE_AES[ctx.bankCode];
  if (!keyPair || typeof globalThis.crypto?.subtle?.importKey !== 'function') return '';

  const encoder = new TextEncoder();
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(keyPair.key),
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );

  const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: encoder.encode(keyPair.iv) },
    cryptoKey,
    encoder.encode(ctx.jsonPayload)
  );

  const cipherBase64 = bytesToBase64(new Uint8Array(encryptedBuffer));
  return `${cipherBase64}?merchantId=${ctx.bankCode}&strong_id=${ctx.strongId}&origin=app`;
}
