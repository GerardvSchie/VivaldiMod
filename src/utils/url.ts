import { URLPattern } from "../model/urlPattern.ts";

export function matches(a: URL, pattern: URLPattern): boolean {
  return (
    (!pattern.href || pattern.href.test(a.href)) &&
    (!pattern.protocol || pattern.protocol.test(a.protocol)) &&
    (!pattern.host || pattern.host.test(a.host)) &&
    (!pattern.pathname || pattern.pathname.test(a.pathname))
  );
}

export function getURL(tab: chrome.tabs.Tab): URL | undefined {
  if (tab.pendingUrl) {
    return new URL(tab.pendingUrl);
  } else if (tab.url) {
    return new URL(tab.url);
  } else {
    return undefined;
  }
}
