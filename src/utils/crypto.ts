const STORAGE_SECRET = "axiom-local-secret-2026";
const SALT = "axiom-salt-2026";

function str2ab(str: string) {
  return new TextEncoder().encode(str);
}

function ab2base64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base642ab(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getKey() {
  const pass = str2ab(STORAGE_SECRET);
  const baseKey = await crypto.subtle.importKey("raw", pass, { name: "PBKDF2" }, false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: str2ab(SALT),
      iterations: 100_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptString(plain: string) {
  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, str2ab(plain));
    // store iv + ciphertext together
    const combined = new Uint8Array(iv.length + ct.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ct), iv.length);
    return ab2base64(combined.buffer);
  } catch (e) {
    console.error("encryptString failed", e);
    throw e;
  }
}

export async function decryptString(payload: string) {
  try {
    const buf = base642ab(payload);
    const bytes = new Uint8Array(buf);
    const iv = bytes.slice(0, 12);
    const ct = bytes.slice(12).buffer;
    const key = await getKey();
    const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return new TextDecoder().decode(plainBuf);
  } catch (e) {
    console.error("decryptString failed", e);
    return null;
  }
}

export function clearRememberData() {
  localStorage.removeItem("remember_data");
  localStorage.removeItem("remember_me");
}
