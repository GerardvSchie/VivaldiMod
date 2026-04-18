import { openTabs } from "../features/open.ts";
import { pin } from "../features/pin.ts";
import { maintainSingletons } from "../features/singletons.ts";
import { sortTabs } from "../features/sorting.ts";
import { setTitle } from "../features/title.ts";
import { FeatureFlagService } from "../utils/featureFlags.service.ts";
import { OpenedTabsService } from "../utils/openedTabService.service.ts";
import { createLogger } from "../utils/logging.ts";
import { ConsolaInstance } from "consola";

const backgroundLogger: ConsolaInstance = createLogger("background");

const featureFlagService: FeatureFlagService = FeatureFlagService.getInstance();
const openedTabsService: OpenedTabsService = OpenedTabsService.getInstance();

chrome.runtime.onInstalled.addListener(async () => {
  backgroundLogger.debug("Event: runtime.onInstalled");
  await featureFlagService.getFlags();
  await openedTabsService.init();
  await updateEverything();
});

chrome.runtime.onStartup.addListener(async () => {
  backgroundLogger.debug("Event: runtime.onStartup");
  await featureFlagService.getFlags();
  await openedTabsService.init();
  await updateEverything();
});

chrome.windows.onCreated.addListener(async (window) => {
  backgroundLogger.debug(`Event: windows.onCreated (id=${window.id})`);
  await featureFlagService.getFlags();
  await openedTabsService.init();
  await updateEverything(window.id);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  backgroundLogger.debug(`Event: windows.onFocusChanged (id=${windowId})`);
  if (windowId === -1) {
    backgroundLogger.info("FocusChange ignored since it is devtools");
    return;
  }

  await featureFlagService.getFlags();
  await updateEverything(windowId);
});

chrome.tabs.onCreated.addListener(async (tab) => {
  if (!tab.id) {
    return;
  }

  backgroundLogger.debug(`Event: tabs.onCreated (id=${tab.id})`);
  await featureFlagService.getFlags();
  openedTabsService.addTab(tab.id);
  await updateEverything(tab.windowId);
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  backgroundLogger.debug(`Event: tabs.onRemoved (id=${tabId})`);
  await featureFlagService.getFlags();
  openedTabsService.removeTab(tabId);

  // Wait a second before doing new things so we are sure all individual tabs are closed aswell
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await updateOpenTabs();
});

chrome.tabs.onUpdated.addListener(async (_, change, tab) => {
  backgroundLogger.debug(`Event: tabs.onUpdated (id=${tab.id})`);
  const windowId = tab.windowId;
  if (change.url) {
    await updateSingletons(windowId);
    await updateOpenTabs(windowId);
    await updateSortTabs(windowId);
    await updateTabPinning(tab);
  }
  if (change.status === "complete") {
    await updateTitle(tab);
  }
});

async function updateEverything(windowId?: number) {
  await updateSingletons(windowId);
  await updateOpenTabs(windowId);
  await updateSortTabs(windowId);

  let tabs: chrome.tabs.Tab[];
  if (windowId) {
    tabs = await new Promise<chrome.tabs.Tab[]>((resolve) =>
      chrome.tabs
        .query({
          windowId: windowId,
        })
        .then((tabs) => resolve(tabs))
        .catch(() => resolve([])),
    );
  } else {
    tabs = await chrome.tabs.query({
      currentWindow: true,
    });
  }

  for (const tab of tabs) {
    await updateTabPinning(tab);
    await updateTitle(tab);
  }
}

async function updateOpenTabs(windowId?: number) {
  if (featureFlagService.getFlag("openTabs")) {
    backgroundLogger.debug(`updateOpenTabs ${windowId}`);
    await openTabs(windowId);
  }
}

async function updateSingletons(windowId?: number) {
  if (featureFlagService.getFlag("singletonTabs")) {
    backgroundLogger.debug(`singletonTabs ${windowId}`);
    await maintainSingletons(windowId);
  }
}

async function updateSortTabs(windowId?: number) {
  if (featureFlagService.getFlag("sortTabs")) {
    backgroundLogger.debug(`sortTabs ${windowId}`);
    await sortTabs(windowId);
  }
}

async function updateTitle(tab: chrome.tabs.Tab) {
  if (featureFlagService.getFlag("updateTitle")) {
    await setTitle(tab);
  }
}

async function updateTabPinning(tab: chrome.tabs.Tab) {
  if (featureFlagService.getFlag("pinTabs")) {
    await pin(tab);
  }
}
