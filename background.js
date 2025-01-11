let shortcuts = {};

browser.storage.local.get(['shortcuts']).then(result => {
  shortcuts = result.shortcuts || {};
});

// Listen for address bar inputs
browser.webNavigation.onBeforeNavigate.addListener(details => {
  try {
    const url = new URL(details.url);
    
    // Check if it's a search query
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      const searchQuery = url.searchParams.get('q') || '';
      if (shortcuts[searchQuery]) {
        browser.tabs.update(details.tabId, { url: shortcuts[searchQuery] });
      }
    } else {
      // Direct input in address bar
      const query = url.pathname.slice(1);
      if (shortcuts[query]) {
        browser.tabs.update(details.tabId, { url: shortcuts[query] });
      }
    }
  } catch (e) {
    // Handle invalid URLs
    const query = details.url.replace(/^(http:\/\/|https:\/\/)/, '');
    if (shortcuts[query]) {
      browser.tabs.update(details.tabId, { url: shortcuts[query] });
    }
  }
});

browser.runtime.onMessage.addListener((request) => {
  if (request.action === "getShortcuts") {
    return Promise.resolve({ shortcuts });
  }
  if (request.action === "saveShortcut") {
    shortcuts[request.shortcut] = request.url;
    return browser.storage.local.set({ shortcuts });
  }
  if (request.action === "deleteShortcut") {
    delete shortcuts[request.shortcut];
    return browser.storage.local.set({ shortcuts });
  }
});