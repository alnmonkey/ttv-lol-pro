import setupPageURL from "url:../../setup/page.html";
import browser, { Runtime } from "webextension-polyfill";
import isChromium from "../../common/ts/isChromium";
import store from "../../store";

export default async function onInstalled(
  details: Runtime.OnInstalledDetailsType
): Promise<void> {
  if (store.readyState !== "complete")
    return store.addEventListener("load", () => onInstalled(details));

  if (details.reason === "update") {
    // Remove old Chromium normal proxy.
    const oldChromiumProxy = "chrome.api.cdn-perfprod.com:4023";
    if (store.state.normalProxies.includes(oldChromiumProxy)) {
      store.state.normalProxies = store.state.normalProxies.filter(
        proxy => proxy !== oldChromiumProxy
      );
      store.state.optimizedProxiesEnabled =
        store.state.normalProxies.length === 0;

      // Add new Chromium optimized proxy.
      const newChromiumProxy = "chromium.api.cdn-perfprod.com:2023";
      if (
        isChromium &&
        !store.state.optimizedProxies.includes(newChromiumProxy)
      ) {
        // Remove Firefox optimized proxy (used during beta).
        const firefoxProxy = "firefox.api.cdn-perfprod.com:2023";
        if (store.state.optimizedProxies.includes(firefoxProxy)) {
          store.state.optimizedProxies = store.state.optimizedProxies.filter(
            proxy => proxy !== firefoxProxy
          );
        }

        store.state.optimizedProxies.push(newChromiumProxy);
      }
    }
  }

  const languages = [
    browser.i18n.getUILanguage(),
    ...(await browser.i18n.getAcceptLanguages()),
  ];
  const chromiumProxy = "chromium.api.cdn-perfprod.com:2023";
  const firefoxProxy = "firefox.api.cdn-perfprod.com:2023";
  const mayWantBestQualityExperience =
    languages.some(lang => lang.startsWith("ru")) &&
    store.state.optimizedProxiesEnabled &&
    store.state.optimizedProxies.length >= 1 &&
    (store.state.optimizedProxies[0] === chromiumProxy ||
      store.state.optimizedProxies[0] === firefoxProxy);
  if (
    details.reason === "install" ||
    (details.reason === "update" && mayWantBestQualityExperience)
  ) {
    const currentSetupVersion = 1; // Careful! Increasing this number will trigger the setup page to open for everyone.
    if (store.state.completedSetupVersion < currentSetupVersion) {
      store.state.completedSetupVersion = currentSetupVersion;
      browser.tabs.create({
        url: `${setupPageURL}?reason=${details.reason}`,
      });
    }
  }
}
