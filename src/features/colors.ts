import { getURL, matches } from "../utils/url.ts";
import {
  CLAUDE,
  INTERNAL_JBOSS_ENV,
  INTERNAL_ENV,
  EMPTY,
  LOCALHOST,
} from "../model/urlConstants.ts";
import { ColorURLPattern } from "../model/urlPattern.ts";
import { createLogger } from "../utils/logging.ts";
import { ConsolaInstance } from "consola";

const colorLogger: ConsolaInstance = createLogger("color");

// Color the tab based on which category it fits in.
// Categories defined using regexes. IMO very very useful to quickly glance and see what you have opened.
export async function colorTabs() {
  const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({
    currentWindow: true,
  });
  for (const tab of tabs) {
    const tabElem = document
      .getElementById("tab-" + tab.id)
      ?.querySelector("div.tab") as HTMLDivElement | null;
    if (!tabElem) {
      // Cannot find the element in the header
      continue;
    }

    const url = getURL(tab);
    if (!url) {
      resetTabColor(tabElem);
      continue;
    }

    // Color tab based on first pattern that matches
    let foundPattern;
    for (const pattern of colorPagesPatterns) {
      if (matches(url, pattern)) {
        foundPattern = pattern;
        break;
      }
    }

    // URL does not match any of the patterns, reset color (since it may have been colored before)
    if (!foundPattern) {
      resetTabColor(tabElem);
      continue;
    }

    colorTab(tab, tabElem, foundPattern);
  }
}

export function resetTabColor(tabElem: HTMLElement) {
  colorLogger.debug("Reset tab color");
  tabElem.style.backgroundColor = "";
  const svg = tabElem.nextElementSibling;

  if (svg && svg.classList.contains("svg-tab-stack")) {
    svg.remove();
  }
}

export function colorTab(
  tab: chrome.tabs.Tab,
  tabElem: HTMLElement,
  pattern: ColorURLPattern,
) {
  if (tab.active) {
    colorLogger.debug(
      `Active set tab color of '${getURL(tab)}' to ${pattern.color}`,
    );
    tabElem.style.backgroundColor = "";
    const svgSibling = tabElem.nextElementSibling;
    if (svgSibling && svgSibling?.classList.contains("svg-tab-stack")) {
      svgSibling.remove();
    }

    const svgNS = "http://www.w3.org/2000/svg";

    // create svg
    const svg = document.createElementNS(svgNS, "svg");
    svg.style.height = "100%";
    svg.classList.add("svg-tab-stack");

    // create rect
    const rect = document.createElementNS(svgNS, "rect");
    rect.classList.add("stack-frame");
    rect.style.width = "100%";
    rect.style.height = "100%";
    rect.style.stroke = pattern.color;
    // append rect to svg
    svg.appendChild(rect);
    tabElem.insertAdjacentElement("afterend", svg);
  } else {
    colorLogger.debug(`Set tab color of '${getURL(tab)}' to ${pattern.color}`);
    const svg = tabElem.nextElementSibling;
    if (svg && svg.classList.contains("svg-tab-stack")) {
      svg.remove();
    }

    tabElem.style.backgroundColor = pattern.color;
  }
}

const colorPagesPatterns: ColorURLPattern[] = [
  {
    ...CLAUDE,
    color: "rgb(217, 119, 87)",
  },
  {
    ...LOCALHOST,
    color: "#e735e7",
  },
  {
    ...INTERNAL_JBOSS_ENV,
    color: "#5477ff",
  },
  {
    ...INTERNAL_ENV,
    color: "#ad9744",
  },
  {
    ...EMPTY,
    color: "#B383D8",
  },
];

// color: "#7ea0c3"
// color: "#1f8d19"
