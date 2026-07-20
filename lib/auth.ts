// Native Web Crypto API HMAC session signer and verifier
// Compatible with both Node.js and Next.js Edge (Middleware) runtimes.

const SECRET = process.env.AUTH_SECRET || "default_auth_secret_change_me_12345678";

async function generateHMAC(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    messageData
  );

  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function signSession(username: string): Promise<string> {
  const timestamp = Date.now().toString();
  const data = `${username}:${timestamp}`;
  const hash = await generateHMAC(data, SECRET);
  return `${data}:${hash}`;
}

export async function verifySession(sessionStr: string | undefined): Promise<boolean> {
  if (!sessionStr) return false;
  const parts = sessionStr.split(":");
  if (parts.length !== 3) return false;
  const [username, timestampStr, hash] = parts;

  // Verify timestamp
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;
  const age = Date.now() - timestamp;
  if (age < 0 || age > 30 * 24 * 60 * 60 * 1000) return false; // 30 days session age limit

  // Verify username match
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  if (username !== expectedUsername) return false;

  // Recompute expected hash
  const data = `${username}:${timestampStr}`;
  const expectedHash = await generateHMAC(data, SECRET);

  return hash === expectedHash;
}
