/**
 * NearDrop In-Memory Sliding Window Rate Limiter
 * Protects API endpoints from abuse with per-IP, per-endpoint limits.
 * Automatically evicts stale entries to prevent memory leaks.
 */

interface RateLimitEntry {
  timestamps: number[];
  blockedUntil?: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number; // extra block after limit hit
}

// Default endpoint configs
const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  "/api/download": { maxRequests: 30, windowMs: 15 * 60 * 1000, blockDurationMs: 60_000 },
  "/api/upload": { maxRequests: 10, windowMs: 5 * 60 * 1000, blockDurationMs: 30_000 },
  "/s/": { maxRequests: 20, windowMs: 10 * 60 * 1000, blockDurationMs: 60_000 },
  "/api/shares": { maxRequests: 50, windowMs: 5 * 60 * 1000 },
  "/api/files": { maxRequests: 60, windowMs: 5 * 60 * 1000 },
  "default": { maxRequests: 100, windowMs: 5 * 60 * 1000 },
};

// Global store — keyed by `${ip}:${endpoint}`
const store = new Map<string, RateLimitEntry>();

// Periodic cleanup interval (every 5 minutes)
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      // Remove entries older than 30 minutes
      const recent = entry.timestamps.filter((t) => now - t < 30 * 60 * 1000);
      if (recent.length === 0 && (!entry.blockedUntil || now > entry.blockedUntil)) {
        store.delete(key);
      } else {
        entry.timestamps = recent;
      }
    });
  }, 5 * 60 * 1000);
}

function getConfig(endpoint: string): RateLimitConfig {
  for (const [pattern, config] of Object.entries(ENDPOINT_LIMITS)) {
    if (pattern !== "default" && endpoint.startsWith(pattern)) {
      return config;
    }
  }
  return ENDPOINT_LIMITS["default"];
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  limit: number;
}

/**
 * Check if a request is allowed under rate limits.
 */
export function checkRateLimit(ip: string, endpoint: string): RateLimitResult {
  ensureCleanup();

  const config = getConfig(endpoint);
  const key = `${ip}:${endpoint}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Check if currently blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.blockedUntil - now,
      limit: config.maxRequests,
    };
  }

  // Clear block if expired
  if (entry.blockedUntil && now >= entry.blockedUntil) {
    entry.blockedUntil = undefined;
    entry.timestamps = [];
  }

  // Sliding window: keep only timestamps within the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    // Rate limit exceeded — block
    entry.blockedUntil = now + (config.blockDurationMs || 60_000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: config.blockDurationMs || 60_000,
      limit: config.maxRequests,
    };
  }

  // Allow request
  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
    limit: config.maxRequests,
  };
}

/**
 * Returns standardized rate limit headers for HTTP responses.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
  };
  if (!result.allowed) {
    headers["Retry-After"] = String(Math.ceil(result.retryAfterMs / 1000));
  }
  return headers;
}

/**
 * Creates a 429 Too Many Requests JSON Response with proper headers.
 */
export function tooManyRequestsResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please slow down.",
      retryAfterMs: result.retryAfterMs,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...rateLimitHeaders(result),
      },
    }
  );
}
