import store from "../../store";
import type { UserExperienceMode } from "../../types";
import isChromium from "./isChromium";
import { updateProxySettings } from "./proxySettings";

export default function loadExperience(experience: UserExperienceMode) {
  // Restore overridden options to the state.
  for (const [key, value] of Object.entries(
    store.state.userExperienceOverridenOptions
  )) {
    (store.state as any)[key] = value; // TODO: Use a more type-safe approach.
  }
  store.state.userExperienceOverridenOptions = {};

  switch (experience) {
    case "blockAds":
      store.state.customPassportEnabled = false;
      break;
    case "unlockBestQuality":
      store.state.customPassportEnabled = true;
      // Backup options to be overridden.
      store.state.userExperienceOverridenOptions = {
        adLogEnabled: store.state.adLogEnabled,
        anonymousMode: store.state.anonymousMode,
        customPassport: store.state.customPassport,
        whitelistChannelSubscriptions:
          store.state.whitelistChannelSubscriptions,
      };
      store.state.adLogEnabled = false;
      store.state.anonymousMode = false;
      store.state.customPassport = {
        passport: false,
        usher: true,
        videoWeaver: false,
        graphQL: true,
        graphQLToken: true,
        graphQLIntegrity: false,
        twitchWebpage: false,
      };
      store.state.whitelistChannelSubscriptions = false;
      break;
    case "expertMode":
      store.state.customPassportEnabled = true;
      break;
  }

  if (isChromium && store.state.chromiumProxyActive) {
    updateProxySettings();
  }
}
