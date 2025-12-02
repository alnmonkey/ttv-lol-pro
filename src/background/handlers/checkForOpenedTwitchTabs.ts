import browser from "webextension-polyfill";
import areAllTabsWhitelisted from "../../common/ts/areAllTabsWhitelisted";
import isChromium from "../../common/ts/isChromium";
import {
  clearProxySettings,
  updateProxySettings,
} from "../../common/ts/proxySettings";
import store from "../../store";

export default async function checkForOpenedTwitchTabs() {
  // Wait for the store to be loaded.
  if (store.readyState !== "complete") {
    await new Promise<void>(resolve => {
      const listener = () => {
        store.removeEventListener("load", listener);
        resolve();
      };
      store.addEventListener("load", listener);
    });
  }

  try {
    const tabs = await browser.tabs.query({
      url: ["https://www.twitch.tv/*", "https://m.twitch.tv/*"],
    });
    console.log(`🔍 Found ${tabs.length} opened Twitch tabs.`);
    store.state.openedTwitchTabs = tabs;

    if (isChromium) {
      const allTabsAreWhitelisted = areAllTabsWhitelisted(tabs);
      if (tabs.length > 0 && !allTabsAreWhitelisted) {
        updateProxySettings();
      } else {
        clearProxySettings();
      }
    }
  } catch (error) {
    console.error(`❌ Failed to query opened Twitch tabs: ${error}`);
  }
}
