import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  icons: {
    16: "public/extension/logo16.png",
    32: "public/extension/logo32.png",
    48: "public/extension/logo48.png",
    128: "public/extension/logo128.png",
  },
  action: {
    default_icon: {
      16: "public/extension/logo16.png",
      32: "public/extension/logo32.png",
      48: "public/extension/logo48.png",
      128: "public/extension/logo128.png",
    },
    default_popup: "src/popup/index.html",
  },
  background: {
    service_worker: "src/background/main.ts",
  },
  permissions: ["storage", "tabs", "activeTab", "scripting"],
  // host_permissions: ["<all_urls>", "file:///*", "https://*/*", "http://*/*"],
  host_permissions: ["<all_urls>"],
});
