const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map();

function normalizeIp(ip) {
  if (!ip || typeof ip !== "string") return null;
  const trimmed = ip.trim();
  if (trimmed.startsWith("::ffff:")) return trimmed.slice(7);
  return trimmed;
}

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80:")) {
    return true;
  }
  return false;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = forwarded.split(",")[0];
    const ip = normalizeIp(first);
    if (ip && !isPrivateIp(ip)) return ip;
  }

  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    const ip = normalizeIp(realIp);
    if (ip && !isPrivateIp(ip)) return ip;
  }

  const socketIp = normalizeIp(req.socket?.remoteAddress || req.ip);
  if (socketIp && !isPrivateIp(socketIp)) return socketIp;

  return null;
}

async function lookupCountry(ip) {
  if (!ip || isPrivateIp(ip)) return null;

  const cached = cache.get(ip);
  if (cached && cached.expires > Date.now()) {
    return cached.country;
  }

  try {
    const url =
      "http://ip-api.com/json/" +
      encodeURIComponent(ip) +
      "?fields=status,country";

    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;

    const data = await res.json();
    const country = data.status === "success" ? data.country : null;

    cache.set(ip, {
      country,
      expires: Date.now() + CACHE_TTL_MS,
    });

    return country;
  } catch (err) {
    console.warn("Country lookup failed for", ip, err.message);
    return null;
  }
}

module.exports = {
  getClientIp,
  lookupCountry,
  isPrivateIp,
  normalizeIp,
};
