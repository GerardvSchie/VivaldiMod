import "./style.css";
import { colorTabs } from "../features/colors.ts";
import { openDevTools } from "../features/devtools.ts";
import { OpenedTabsService } from "../utils/openedTabService.service.ts";

const openedTabsService: OpenedTabsService = OpenedTabsService.getInstance();
chrome.runtime.onStartup.addListener(async () => {
  await openedTabsService.init();
  await colorTabs();
});

chrome.runtime.onInstalled.addListener(async () => {
  await openedTabsService.init();
  await colorTabs();
});

chrome.windows.onCreated.addListener(async () => {
  await openedTabsService.init();
  await colorTabs();
});

chrome.tabs.onCreated.addListener(async (tab) => {
  await colorTabs();
  openedTabsService.addTab(tab.id);
  if (tab.id) {
    await openDevTools(tab.id);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await colorTabs();
  await openDevTools(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, change) => {
  if (change.url) {
    await colorTabs();
    await openDevTools(tabId);
  }

  // await showShortcuts();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  openedTabsService.removeTab(tabId);
});
