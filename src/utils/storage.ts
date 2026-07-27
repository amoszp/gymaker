import type { AppState } from '@/types';

const CHECKSUM_LEN = 8;

function simpleChecksum(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(CHECKSUM_LEN, '0').slice(0, CHECKSUM_LEN);
}

function b64encodeUnicode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function b64decodeUnicode(b64: string): string | null {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeBackup(state: AppState): string {
  const json = JSON.stringify(state);
  const checksum = simpleChecksum(json);
  const payload = checksum + json;
  return b64encodeUnicode(payload);
}

export function decodeBackup(code: string): AppState | null {
  if (!code) return null;
  const raw = b64decodeUnicode(code.trim());
  if (!raw || raw.length < CHECKSUM_LEN + 2) return null;
  const checksum = raw.slice(0, CHECKSUM_LEN);
  const json = raw.slice(CHECKSUM_LEN);
  if (simpleChecksum(json) !== checksum) return null;
  try {
    const parsed = JSON.parse(json) as AppState;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => fallback(text));
  }
  return Promise.resolve(fallback(text));
}

function fallback(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
