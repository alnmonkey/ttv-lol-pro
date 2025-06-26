import store from "../../store";
import { UserExperienceMode } from "../../types";
import isChromium from "./isChromium";
import { updateProxySettings } from "./proxySettings";

export default function loadExperience(experience: UserExperienceMode) {
  switch (experience) {
    case "blockAds":
      store.state.customPassportEnabled = false;
      break;
    case "unlockBestQuality":
      store.state.customPassportEnabled = true;
      store.state.customPassport = {
        passport: false,
        usher: true,
        videoWeaver: false,
        graphQL: false,
        graphQLToken: false,
        graphQLIntegrity: false,
        twitchWebpage: false,
      };
      break;
    case "expertMode":
      store.state.customPassportEnabled = true;
      break;
  }
  if (isChromium && store.state.chromiumProxyActive) {
    updateProxySettings();
  }
}
