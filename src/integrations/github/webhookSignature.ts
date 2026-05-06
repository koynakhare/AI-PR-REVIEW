import crypto from "crypto";

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function computeSig256(secret: string, rawBody: Buffer): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  return `sha256=${hmac.digest("hex")}`;
}

export function verifyGitHubSignature256(params: {
  secret: string;
  signature256Header: string | undefined;
  rawBody: Buffer;
}): boolean {
  const { secret, signature256Header, rawBody } = params;
  if (!signature256Header) return false;
  const expected = computeSig256(secret, rawBody);
  return timingSafeEqual(signature256Header, expected);
}

