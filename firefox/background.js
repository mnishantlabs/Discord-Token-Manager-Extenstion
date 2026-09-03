const DISCORD_TOKEN_RE = /^[MN][A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/;

const handleMessage = (message, sender) => {
  if (message && message.type === 'DISCORD_TOKEN') {
    const token = message.token;
    const tabId = message.tabId != null ? message.tabId : (sender.tab ? sender.tab.id : null);

    if (typeof token !== 'string' || !DISCORD_TOKEN_RE.test(token)) {
      return Promise.resolve({ ok: false, error: 'Invalid token format detected.' });
    }

    return browser.storage.local.get({ currentToken: null }).then((stored) => {
      if (stored.currentToken === token) {
        return { ok: true, changed: false };
      }
      return browser.storage.local.set({ currentToken: token }).then(() => {
        return { ok: true, changed: true, tabId };
      });
    });
  }

  if (message && message.type === 'SET_TOKEN') {
    const token = message.token;
    if (typeof token === 'string' && DISCORD_TOKEN_RE.test(token)) {
      return browser.storage.local.set({ currentToken: token }).then(() => ({ ok: true }));
    }
    return Promise.resolve({ ok: false });
  }
  return undefined;
};

if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
  browser.runtime.onMessage.addListener(handleMessage);
}
