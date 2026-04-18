import { Shortcut } from "../model/shortcut.ts";

// NOTE: Not used currently, good bookmark usage prevents this from being necessary
export async function showShortcuts() {
  const bookmarkBarElement = document.querySelector(
    "div.bookmark-bar",
  ) as HTMLDivElement;
  if (bookmarkBarElement.querySelector("div.custom-bookmark-bar")) {
    return;
  }

  const bookmarkElement: HTMLDivElement = document.createElement("div");
  bookmarkElement.className = "custom-bookmark-bar";

  for (const shortcut of shortcuts) {
    const button = document.createElement("button");

    if (shortcut.icon) {
      const shortcutImage = document.createElement("img");
      shortcutImage.src = shortcut.icon;
      button.appendChild(shortcutImage);
    }

    if (shortcut.name) {
      const shortcutSpan = document.createElement("span");
      shortcutSpan.textContent = shortcut.name;
      button.appendChild(shortcutSpan);
    }

    button.addEventListener("click", async () => {
      await chrome.tabs.create({ url: shortcut.url });
    });

    bookmarkElement.appendChild(button);
  }

  bookmarkBarElement.appendChild(bookmarkElement);
}

const shortcuts: Shortcut[] = [
  {
    name: "Bitbucket",
    url: "https://www.bitbucket.com",
    icon: "icons/Bitbucket.svg",
  },
  {
    url: "https://www.jenkins.com",
    icon: "icons/jenskins.jpg",
  },
];
