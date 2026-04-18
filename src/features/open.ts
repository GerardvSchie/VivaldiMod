import { matches, getURL } from "../utils/url.ts";
import { CLAUDE } from "../model/urlConstants.ts";
import { OpenURLPattern } from "../model/urlPattern.ts";
import { AsyncQueue } from "../utils/asyncQueue.ts";

const asyncQueue = new AsyncQueue();

// Tabs are defined of pages which always should be opened
// CAUTION NOTE: You can cause an infinite loop if you define a tab here which redirects (since its not available f.e.)
export async function openTabs(windowId?: number) {
  await asyncQueue.enqueue(() => openTabsTask(windowId));
}

export async function openTabsTask(windowId?: number) {
  // When calling opening of tabs, wait for a bit to ensure the pages which might previously already been opened are loaded in
  await new Promise((resolve) => setTimeout(resolve, 100));

  let tabs: chrome.tabs.Tab[];
  if (windowId) {
    tabs = await chrome.tabs.query({ windowId: windowId });
  } else {
    tabs = await chrome.tabs.query({ currentWindow: true });
  }

  // Hold the current active tab to go back to it afterwards
  const activeTab: chrome.tabs.Tab | undefined = tabs.find((tab) => tab.active);

  let openedTab = false;

  // Check all patterns, if one is not already active open a tab
  const urls = tabs.map((tab) => getURL(tab));
  for (const pattern of openedPagesPatterns) {
    if (!urls.some((url) => (url ? matches(url, pattern) : false))) {
      await new Promise((resolve) =>
        chrome.tabs
          .create({ url: pattern.urlToOpen })
          .then(resolve)
          .catch(resolve),
      );

      openedTab = true;
    }
  }

  // Jump back to previously active tab
  if (openedTab) {
    if (activeTab?.id) {
      const activeTabId = activeTab.id;
      await new Promise((resolve) =>
        chrome.tabs
          .update(activeTabId, { active: true })
          .then(resolve)
          .catch(resolve),
      );
    }
  }
}

const openedPagesPatterns: OpenURLPattern[] = [
  // {
  //   ...JIRA_BOARD,
  //   urlToOpen: "https://nexus-nederland.atlassian.net/jira/software/c/projects/SDB/boards/20",
  // },
  {
    ...CLAUDE,
    urlToOpen: "https://claude.ai/",
  },
];
