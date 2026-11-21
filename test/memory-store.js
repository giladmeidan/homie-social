// In-memory stand-in for src/store.js, same interface.
const ACTIVE = ['approved', 'creating', 'processing', 'publishing'];

export function createMemoryStore() {
  const reels = new Map();
  const kv = new Map();
  return {
    reels,
    async createReel(r) {
      reels.set(r.id, { ...r, updated_at: r.created_at });
    },
    async getReel(id) {
      const r = reels.get(id);
      return r ? { ...r } : null;
    },
    async updateReel(id, fields) {
      Object.assign(reels.get(id), fields);
    },
    async transition(id, from, to, fields = {}) {
      const r = reels.get(id);
      if (!r || r.status !== from) return false;
      Object.assign(r, fields, { status: to });
      return true;
    },
    async tiktokTransition(id, from, to, fields = {}) {
      const r = reels.get(id);
      if (!r || (r.tiktok_status ?? null) !== from) return false;
      Object.assign(r, fields, { tiktok_status: to });
      return true;
    },
    async listTikTokActive() {
      return [...reels.values()]
        .filter((r) => ['queued', 'uploading', 'processing'].includes(r.tiktok_status))
        .map((r) => ({ ...r }));
    },
    async listActive() {
      return [...reels.values()].filter((r) => ACTIVE.includes(r.status)).map((r) => ({ ...r }));
    },
    async listReels() {
      return [...reels.values()].map((r) => ({ ...r }));
    },
    async setBeats({ id, title }, beats) {
      let n = 0;
      for (const r of reels.values()) {
        if ((id ? r.id === id : r.title === title) && r.beats == null) { r.beats = beats; n++; }
      }
      return n;
    },
    async kvGet(key) {
      return kv.has(key) ? kv.get(key) : null;
    },
    async kvSet(key, value) {
      kv.set(key, value);
    },
  };
}
