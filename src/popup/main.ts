import "./style.css";
import { FeatureFlags } from "../model/featureFlags.ts";
import { FeatureFlagService } from "../utils/featureFlags.service.ts";

const featureFlagService: FeatureFlagService = FeatureFlagService.getInstance();

let openTabsCheckbox: HTMLInputElement;
let singletonTabsCheckbox: HTMLInputElement;
let sortTabsCheckbox: HTMLInputElement;
let updateTitleCheckbox: HTMLInputElement;
let pinTabsCheckbox: HTMLInputElement;

document.addEventListener("DOMContentLoaded", async function () {
  openTabsCheckbox = document.getElementById("openTabs") as HTMLInputElement;
  singletonTabsCheckbox = document.getElementById(
    "singletonTabs",
  ) as HTMLInputElement;
  sortTabsCheckbox = document.getElementById("sortTabs") as HTMLInputElement;
  updateTitleCheckbox = document.getElementById(
    "updateTitle",
  ) as HTMLInputElement;
  pinTabsCheckbox = document.getElementById("pinTabs") as HTMLInputElement;

  openTabsCheckbox.addEventListener("click", async () => {
    featureFlagService.setFlag("openTabs", openTabsCheckbox.checked);
  });

  singletonTabsCheckbox.addEventListener("click", async () => {
    featureFlagService.setFlag("singletonTabs", singletonTabsCheckbox.checked);
  });

  sortTabsCheckbox.addEventListener("click", async () => {
    featureFlagService.setFlag("sortTabs", sortTabsCheckbox.checked);
  });

  updateTitleCheckbox.addEventListener("click", async () => {
    featureFlagService.setFlag("updateTitle", updateTitleCheckbox.checked);
  });

  pinTabsCheckbox.addEventListener("click", async () => {
    featureFlagService.setFlag("pinTabs", pinTabsCheckbox.checked);
  });

  await initCheckboxes();
});

async function initCheckboxes() {
  const featureFlags: FeatureFlags = await featureFlagService.getFlags();
  openTabsCheckbox.checked = featureFlags.openTabs;
  singletonTabsCheckbox.checked = featureFlags.singletonTabs;
  sortTabsCheckbox.checked = featureFlags.sortTabs;
  updateTitleCheckbox.checked = featureFlags.updateTitle;
  pinTabsCheckbox.checked = featureFlags.pinTabs;
}
