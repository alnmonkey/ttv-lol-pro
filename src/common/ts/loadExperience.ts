import store from "../../store";
import { OptionsExperienceType } from "../../types";

export default function loadExperience(experience: OptionsExperienceType) {
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
}
