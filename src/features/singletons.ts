import {
  EMPTY,
  JIRA_BOARD,
  CLAUDE,
  LOCALHOST,
  BUNDLE_DESKTOP,
} from "../model/urlConstants.ts";
import { SingletonURLPattern } from "../model/urlPattern.ts";
import { OpenedTabsService } from "../utils/openedTabService.service.ts";
import { getURL, matches } from "../utils/url.ts";

const openedTabsService: OpenedTabsService = OpenedTabsService.getInstance();

// Maintain only a single instance of a tab match, and if several are openened close one of the two
export async function maintainSingletons(windowId?: number) {
  let tabs: chrome.tabs.Tab[];
  if (windowId) {
    tabs = await chrome.tabs.query({ windowId: windowId });
  } else {
    tabs = await chrome.tabs.query({ currentWindow: true });
  }

  // Cannot have duplicates if theres not even 2 tabs open
  if (tabs.length < 2) {
    return;
  }

  // Matrix of which patterns are opened, then checks which patterns have several matches
  // Patterns with several matches will be added to the indices to close
  const matchLists: number[][] = createMatchLists(tabs);
  const tabIndicesToClose: Set<number> = getTabIndicesToClose(tabs, matchLists);
  if (tabIndicesToClose.size === 0) {
    return;
  }

  // Activate the tab that is maintained
  const activateTabId = getTabIdToActivate(tabs, matchLists, tabIndicesToClose);
  if (activateTabId) {
    await new Promise((resolve) =>
      chrome.tabs
        .update(activateTabId, { active: true })
        .then(resolve)
        .catch(resolve),
    );
  }

  // Create list with tab ids and remove them
  const tabIds: number[] = Array.from(tabIndicesToClose.keys())
    .map((i) => tabs[i].id)
    .filter(Boolean) as number[];
  await new Promise((resolve) =>
    chrome.tabs.remove(tabIds).then(resolve).catch(resolve),
  );
}

// Matrix size NxM for tabs (N) and patterns (M), only generates list whether the tab matches the pattern
function createMatchLists(tabs: chrome.tabs.Tab[]): number[][] {
  const matchLists: number[][] = [];
  singletonURLPatterns.forEach(() => matchLists.push([]));

  const allMatchingTabIds = new Set<number>();
  const urls = tabs.map((tab) => getURL(tab));
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (!url) {
      continue;
    }

    for (let p = 0; p < singletonURLPatterns.length; p++) {
      if (matches(url, singletonURLPatterns[p])) {
        matchLists[p].push(i);
        allMatchingTabIds.add(i);
      }
    }
  }

  return matchLists;
}

// Based on rules and matches, determine which tabs to close
function getTabIndicesToClose(
  tabs: chrome.tabs.Tab[],
  matchLists: number[][],
): Set<number> {
  const tabIndicesToClose = new Set<number>();
  for (let p = 0; p < singletonURLPatterns.length; p++) {
    const matchingTabs: number[] = matchLists[p];
    if (matchingTabs.length < 2) {
      continue;
    }

    if (singletonURLPatterns[p].urlMatchingPatternMustBeUnique) {
      let tabIndexToKeep = matchingTabs[0];
      const tempListToClose: number[] = [];

      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let j = 0; j < matchingTabs.length; j++) {
        if (
          getURL(tabs[tabIndexToKeep])?.href !==
          getURL(tabs[matchingTabs[j]])?.href
        ) {
          continue;
        }

        tempListToClose.push(matchingTabs[j]);
        tabIndexToKeep = determineTabIndexToKeep(
          tabs,
          tabIndexToKeep,
          matchingTabs[j],
          !!singletonURLPatterns[p].keepNewest,
        );
      }

      tempListToClose
        .filter((i) => i !== tabIndexToKeep)
        .forEach((i) => tabIndicesToClose.add(i));
    } else {
      let tabIndexToKeep = matchingTabs[0];
      for (let i = 1; i < matchingTabs.length; i++) {
        tabIndexToKeep = determineTabIndexToKeep(
          tabs,
          tabIndexToKeep,
          matchingTabs[i],
          !!singletonURLPatterns[p].keepNewest,
        );
      }

      matchingTabs
        .filter((i) => i !== tabIndexToKeep)
        .forEach((i) => tabIndicesToClose.add(i));
    }
  }

  return tabIndicesToClose;
}

function determineTabIndexToKeep(
  tabs: chrome.tabs.Tab[],
  i: number,
  j: number,
  keepNewest: boolean,
): number {
  const tabInfo1 = openedTabsService.getTabInfo(tabs[i]?.id);
  const tabInfo2 = openedTabsService.getTabInfo(tabs[j]?.id);

  if (!tabInfo1?.date) {
    return j;
  } else if (!tabInfo2?.date) {
    return i;
  }

  if (tabInfo1.date === tabInfo2.date) {
    return tabs[i].index < tabs[j].index === keepNewest ? j : i;
  } else if (tabInfo1.date < tabInfo2.date) {
    return keepNewest ? j : i;
  } else {
    return keepNewest ? i : j;
  }
}

function getTabIdToActivate(
  tabs: chrome.tabs.Tab[],
  matchLists: number[][],
  tabIndicesToClose: Set<number>,
) {
  let activateTabId: number | undefined;

  // Activate currently active tab if its not being removed
  const activeTab = tabs.find((t) => t.active);
  if (!activeTab) {
    return;
  }

  const activeTabIndex = tabs.indexOf(activeTab);
  if (!tabIndicesToClose.has(activeTabIndex) && !!activeTab.id) {
    activateTabId = activeTab.id;
  }

  // Activate one in the group of removed tabs if it has been removed
  for (const matchList of matchLists) {
    if (activateTabId !== undefined) {
      break;
    }

    // No item in the matchlist is the currently active tab, so the tab closed is from another pattern
    if (!matchList.includes(activeTabIndex)) {
      continue;
    }

    // Set tab to activate to item in the list of matches that is not being closed
    const tabIndexToActive = matchList.find((i) => !tabIndicesToClose.has(i));
    if (tabIndexToActive !== undefined) {
      activateTabId = tabs[tabIndexToActive].id;
    }
  }

  if (activateTabId === undefined) {
    for (let i = 0; i < tabs.length; i++) {
      if (!tabIndicesToClose.has(i) && !!tabs[i].id) {
        activateTabId = tabs[i].id;
      }
    }
  }

  return activateTabId;
}

const singletonURLPatterns: SingletonURLPattern[] = [
  EMPTY,
  JIRA_BOARD,
  {
    ...LOCALHOST,
    urlMatchingPatternMustBeUnique: true,
    keepNewest: true,
  },
  {
    ...CLAUDE,
    keepNewest: false,
  },
  {
    // Only one bundle desktop per environment
    ...BUNDLE_DESKTOP,
    urlMatchingPatternMustBeUnique: true,
  },
  {
    host: /jenkins\.nexus-nederland\.nl/,
    pathname: /\/job\/.*/,
    urlMatchingPatternMustBeUnique: true,
  },
];
