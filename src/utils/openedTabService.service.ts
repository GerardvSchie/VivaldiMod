import { TabInfo } from "../model/tabInfo.ts";

export class OpenedTabsService {
  private static instance: OpenedTabsService;
  private tabTable: Map<number, TabInfo> = new Map<number, TabInfo>();

  private constructor() {
    // Private constructor to prevent instantiation from outside
  }

  public static getInstance(): OpenedTabsService {
    if (!OpenedTabsService.instance) {
      OpenedTabsService.instance = new OpenedTabsService();
    }

    return OpenedTabsService.instance;
  }

  public async init() {
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => this.addTab(tab.id));
  }

  public removeTab(tabId: number | undefined) {
    if (tabId && this.tabTable.has(tabId)) {
      this.tabTable.delete(tabId);
    }
  }

  public addTab(tabId: number | undefined): TabInfo | undefined {
    if (!tabId) {
      return;
    }

    if (!this.tabTable.has(tabId)) {
      const tabInfo: TabInfo = {
        date: new Date(),
        openedDevTools: false,
      };
      this.tabTable.set(tabId, tabInfo);
      return tabInfo;
    }
  }

  public getTabInfo(tabId: number | undefined): TabInfo | undefined {
    if (!tabId) {
      return undefined;
    }
    if (this.tabTable.has(tabId)) {
      return this.tabTable.get(tabId);
    } else {
      return this.addTab(tabId);
    }
  }
}
