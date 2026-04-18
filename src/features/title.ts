import { getURL } from "../utils/url.ts";
import { createLogger } from "../utils/logging.ts";
import { ConsolaInstance } from "consola";

const titleLogger: ConsolaInstance = createLogger("title");

// Doesn't seem so useful since you explicitly need to define how to set the title for each host
export async function setTitle(tab: chrome.tabs.Tab) {
  const url = getURL(tab);
  if (!url) {
    return;
  }

  const queryParam = url.searchParams.get("q");
  if (!queryParam || url.host !== `www.startpage.com`) {
    return;
  }

  const newTitle: string = decodeURIComponent(queryParam.replace(/\+/g, ""));
  if (tab.id && !tab.discarded && !tab.frozen) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: setTitleToDocument,
      args: ["Query: " + newTitle],
    }).catch(err => titleLogger.warn(`Could not set tile of tab (id=${tab.id} url=${url}) caugth error: ${err}`));
  }
}

function setTitleToDocument(newTitle: string) {
  document.title = newTitle;
}
