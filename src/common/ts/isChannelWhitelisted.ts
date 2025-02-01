import store from "../../store";

export default function isChannelWhitelisted(
  channelName: string | null
): boolean {
  if (!channelName) return false;
  return store.state.whitelistedChannels.some(
    c => c.toLowerCase() === channelName.toLowerCase()
  );
}
