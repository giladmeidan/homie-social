// Minimal Telegram Bot API client.

export function createTelegram({ fetchFn, botToken }) {
  return {
    async send(method, payload) {
      const res = await fetchFn(`https://api.telegram.org/bot${botToken}/${method}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.ok) throw new Error(data.description || `Telegram HTTP ${res.status}`);
      return data.result;
    },
  };
}
