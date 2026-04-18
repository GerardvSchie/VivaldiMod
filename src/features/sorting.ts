import { SortObject } from "../model/sortObject.ts";
import {
  EMPTY,
  JIRA_BOARD,
  JIRA,
  CLAUDE,
  LOCALHOST,
  INTERNAL_ENV,
  INTERNAL_JBOSS_ENV,
  BUNDLE_DESKTOP,
} from "../model/urlConstants.ts";
import { URLPattern } from "../model/urlPattern.ts";
import { getURL, matches } from "../utils/url.ts";
import { createLogger } from "../utils/logging.ts";
import { ConsolaInstance } from "consola";

const sortingLogger: ConsolaInstance = createLogger("sorting");

/* This sorts tabs, but keeping tabs with the same domain or matching a specific rule together
 * does not use groups since those would introduce additional clicks and hide whats opened.
 * Instead, we want to limit the number of tabs which are in the tab bar...
 */
export async function sortTabs(windowId?: number) {
  let tabs: chrome.tabs.Tab[];
  if (windowId) {
    sortingLogger.info(`Sorting tabs of window ${windowId}`);
    tabs = await chrome.tabs.query({ windowId: windowId });
  } else {
    sortingLogger.info(`Sorting tabs of current window`);
    tabs = await chrome.tabs.query({ currentWindow: true });
  }

  if (tabs.length < 2) {
    sortingLogger.debug(`Nothing to sort, only ${tabs.length} tabs`);
    return;
  }

  const sortObjects: SortObject[] = tabs.map(
    (tab: chrome.tabs.Tab, i: number) => {
      // Set default sort index (index of group in which the tab will be sorted) to lowest match, else default
      let sortIndex = DEFAULT_GROUP_INDEX;
      for (const j in sortingPatterns) {
        const url = getURL(tab);
        if (!url) {
          continue;
        }

        if (matches(url, sortingPatterns[j])) {
          sortIndex = Number(j);
          break;
        }
      }
      return {
        tab: tab,
        currentIndex: i,
        sortGroupIndex: sortIndex,
        url: getURL(tab),
      };
    },
  );

  sortObjects.sort((a, b) => compareTabs(a, b));

  // Move tabs to reflect the new order, always call move without checking whether it will move the tab since it is optimized
  for (let i = 0; i < sortObjects.length; i++) {
    const sortObject = sortObjects[i];
    const tabId = sortObject.tab.id;
    if (!tabId) {
      continue;
    }

    const before = sortObject.currentIndex;
    const movedTab = await chrome.tabs.move(tabId, { index: i });

    if (before !== movedTab.index) {
      sortingLogger.debug(
        `Moved tab (id=${tabId} url=${sortObject.url}) ${before} -> ${movedTab.index}`,
      );
    }
  }
}

function compareTabs(a: SortObject, b: SortObject) {
  // Pinned are before any other, those cannot move right of unpinned
  if (a.tab.pinned && b.tab.pinned) {
    return a.tab.index - b.tab.index;
  } else if (a.tab.pinned) {
    return -1;
  } else if (b.tab.pinned) {
    return 1;
  }

  // If the group is different, sort based on that
  if (a.sortGroupIndex < b.sortGroupIndex) {
    return -1;
  } else if (a.sortGroupIndex > b.sortGroupIndex) {
    return 1;
  }

  // Order protocols (http and https considered the same)
  const protocolCompare = compareProtocol(a, b);
  if (protocolCompare !== 0) {
    return protocolCompare;
  }

  // Order based on domain (ignoring the www. part since that only messes it up)
  const domainCompare = compareHost(a, b);
  if (domainCompare !== 0) {
    return domainCompare;
  }

  return a.tab.index - b.tab.index;
}

function compareProtocol(a: SortObject, b: SortObject) {
  if (!a.url) {
    return 1;
  } else if (!b.url) {
    return -1;
  }

  if (a.url.protocol.startsWith("http") && b.url.protocol.startsWith("http")) {
    return 0;
  }

  return a.url.protocol.localeCompare(b.url.protocol);
}

function compareHost(a: SortObject, b: SortObject) {
  const hostA = a.url?.host.replace("www.", "");
  const hostB = b.url?.host.replace("www.", "");

  if (!hostA) {
    return 1;
  } else if (!hostB) {
    return -1;
  }

  return hostA.localeCompare(hostB);
}

const sortingPatterns: URLPattern[] = [
  CLAUDE,
  JIRA_BOARD,
  JIRA,
  INTERNAL_ENV,
  BUNDLE_DESKTOP,
  INTERNAL_JBOSS_ENV,
  LOCALHOST,
  EMPTY,
];

// Default is before the empty tab at the end.
const DEFAULT_GROUP_INDEX = sortingPatterns.length - 1.5;
