import { FeatureFlags } from "../model/featureFlags.ts";

export class FeatureFlagService {
  private static instance: FeatureFlagService;

  private flags: FeatureFlags = {
    openTabs: false,
    singletonTabs: false,
    sortTabs: false,
    updateTitle: false,
    pinTabs: false,
  };

  private constructor() {
    // Private constructor to prevent instantiation from outside
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }

    return FeatureFlagService.instance;
  }

  public async setFlags(featureFlags: FeatureFlags): Promise<void> {
    await chrome.storage.local.set(featureFlags);
    this.flags = featureFlags;
  }

  public async getFlags(): Promise<FeatureFlags> {
    const keys: string[] = Object.keys(this.flags);
    const value = await chrome.storage.local.get(keys);

    let changedValue = false;
    for (const key of keys) {
      if (value[key] === undefined) {
        value[key] = false;
        changedValue = true;
      }
    }

    this.flags = value as unknown as FeatureFlags;
    if (changedValue) {
      this.setFlags(this.flags);
    }

    return this.flags;
  }

  public getFlag(flag: keyof FeatureFlags): boolean | undefined {
    return this.flags[flag];
  }

  public async setFlag(
    flag: keyof FeatureFlags,
    value: boolean,
  ): Promise<void> {
    this.flags[flag] = value;
    await this.setFlags(this.flags);
  }
}
