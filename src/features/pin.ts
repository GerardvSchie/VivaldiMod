import { CLAUDE } from "../model/urlConstants.ts";
import { URLPattern } from "../model/urlPattern.ts";
import { getURL, matches } from "../utils/url.ts";

// Automatically pin certain tabs in the browser (Which also makes them take less space)
export async function pin(tab: chrome.tabs.Tab): Promise<void> {
  if (!tab.id || tab.pinned) {
    return;
  }

  const tabId = tab.id;
  for (const pattern of pinPagesPatterns) {
    const url = getURL(tab);
    if (url && matches(url, pattern)) {
      await new Promise((resolve) => {
        chrome.tabs
          .update(tabId, { pinned: true })
          .then(resolve)
          .catch(resolve);
      });
    }
  }
}

const pinPagesPatterns: URLPattern[] = [CLAUDE];
