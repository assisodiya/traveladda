/**
 * No-op Next.js Incremental Cache Handler.
 * Completely disables server-side disk and memory caching for pages, routes,
 * ISR, and fetch() calls so the production disk never accumulates cache files.
 */
module.exports = class NoOpCacheHandler {
  constructor() {}

  async get() {
    return null;
  }

  async set() {
    return;
  }

  async revalidateTag() {
    return;
  }

  resetRequestCache() {
    return;
  }
};

