import browser from "webextension-polyfill";
import $ from "../common/ts/$";
import store from "../store";

const setupFormElement = $("#setup-form") as HTMLFormElement;
const blockAdsInputElement = $("#block-ads") as HTMLInputElement;
const unlockBestQualityInputElement = $(
  "#unlock-best-quality"
) as HTMLInputElement;
const expertModeContainerElement = $(
  "#expert-mode-container"
) as HTMLDivElement;
const expertModeInputElement = $("#expert-mode") as HTMLInputElement;

if (store.readyState === "complete") main();
else store.addEventListener("load", main);

function main() {
  switch (store.state.optionsExperienceType) {
    case "blockAds":
      blockAdsInputElement.checked = true;
      break;
    case "unlockBestQuality":
      unlockBestQualityInputElement.checked = true;
      break;
    case "expertMode":
      expertModeInputElement.checked = true;
      expertModeContainerElement.classList.remove("hidden");
      break;
    default:
      blockAdsInputElement.checked = true;
      store.state.optionsExperienceType = "blockAds";
      break;
  }
  blockAdsInputElement.addEventListener("change", () => {
    store.state.optionsExperienceType = "blockAds";
  });
  unlockBestQualityInputElement.addEventListener("change", () => {
    store.state.optionsExperienceType = "unlockBestQuality";
  });
  expertModeInputElement.addEventListener("change", () => {
    store.state.optionsExperienceType = "expertMode";
  });
}

setupFormElement.addEventListener("submit", e => {
  e.preventDefault();
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    if (tabs.length > 0) {
      browser.tabs.remove(tabs[0].id!);
    }
  });
});
