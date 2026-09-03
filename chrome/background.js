const DISCORD_TOKEN_RE = /^[MN][A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'DISCORD_TOKEN') {
    const token = message.token;
    const tabId = message.tabId != null ? message.tabId : (sender.tab ? sender.tab.id : null);

    if (typeof token !== 'string' || !DISCORD_TOKEN_RE.test(token)) {
      sendResponse({ ok: false, error: 'Invalid token format detected.' });
      return false;
    }

    chrome.storage.local.get({ currentToken: null }, (stored) => {
      if (stored.currentToken === token) {
        sendResponse({ ok: true, changed: false });
        return;
      }
      chrome.storage.local.set({ currentToken: token }, () => {
        sendResponse({ ok: true, changed: true, tabId });
      });
    });

    return true;
  }

  if (message && message.type === 'SET_TOKEN') {
    const token = message.token;
    if (typeof token === 'string' && DISCORD_TOKEN_RE.test(token)) {
      chrome.storage.local.set({ currentToken: token }, () => {
        sendResponse({ ok: true });
      });
    } else {
      sendResponse({ ok: false });
    }
    return true;
  }
  return false;
});
