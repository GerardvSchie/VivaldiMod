export interface SortObject {
  tab: chrome.tabs.Tab;
  currentIndex: number;
  url?: URL;
  sortGroupIndex: number;
}
