import { LOCALHOST } from "../model/urlConstants.ts";
import { OpenedTabsService } from "../utils/openedTabService.service.ts";
import { matches, getURL } from "../utils/url.ts";
import { createLogger } from "../utils/logging.ts";
import { ConsolaInstance } from "consola";

const devtoolsLogger: ConsolaInstance = createLogger("devtools");

const openedTabsService: OpenedTabsService = OpenedTabsService.getInstance();

// Open devtools given a tab if it matches LOCALHOST
export async function openDevTools(tabId: number): Promise<void> {
  await new Promise<void>((resolve) =>
    // Sometimes the tab does not exist (anymore) so we gracefully handle the error
    chrome.tabs
      .get(tabId)
      .then((tab: chrome.tabs.Tab): void => {
        const tabInfo = openedTabsService.getTabInfo(tabId);
        if (!tab || !tab.active || !tabInfo || tabInfo.openedDevTools) {
          return;
        }

        const url = getURL(tab);
        if (url && matches(url, LOCALHOST)) {
          devtoolsLogger.info(
            `Opening devtools in tab (id=${tab.id} url='${url}')`,
          );
          tabInfo.openedDevTools = true;
          // @ts-expect-error vivaldi IS known within the context, but not in this contained project
          vivaldi.devtoolsPrivate.toggleDevtools(
            // @ts-expect-error window.vivaldiWindowId DOES exist
            window.vivaldiWindowId,
            "default",
          );
        }
        resolve();
      })
      .catch(resolve),
  );
}

// chrome.devtools.inspectedWindow.eval("!!(window.devtools)", function (result, isException) {
//   if (!isException && result) {
//     console.log("DevTools are open");
//   } else {
//     console.log("DevTools are closed");
//   }
// });

// chrome.windows.onFocusChanged.addListener(async (windowId) => {
//   const windows = await chrome.windows.getAll();
//   for (const window of windows) {
//     console.log(window);
//   }
//   console.log('devtools', document.getElementById('#devtools-status'));
// });

// chrome.tabs.onActivated.addListener(async () => {
//   // @ts-ignore
//   vivaldi.devtoolsPrivate.toggleDevtools(window.vivaldiWindowId, "default");
// });

// vivaldi.devtoolsPrivate.closeDevtools(window.vivaldiWindowId, e, (e)=>{}))
// vivaldi.devtoolsPrivate.closeDevtools(this.props.id,((e)=>{}))
// vivaldi.close(this.state.undockedDevtoolsWindowIwId)
// vivaldi.devtoolsPrivate.onClosed.addListener()
// vivaldi.devtoolsPrivate.onDevtoolsUndocked.removeListener()
// Fi.Z.openWindow(this.context.vivaldiWindowId, "devtools.html", "devtools", t)
// setDevToolsDockingState

// devtools://devtools/bundled/devtools_app.html?remoteBase=https://chrome-devtools-frontend.appspot.co
// Inspect the inspector :)
// devtools://devtools/bundled/devtools_app.html
