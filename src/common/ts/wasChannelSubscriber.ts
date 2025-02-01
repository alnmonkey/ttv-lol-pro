import store from "../../store";

export default function wasChannelSubscriber(
  channelName: string | null
): boolean {
  if (!channelName) return false;
  return store.state.activeChannelSubscriptions.some(
    c => c.toLowerCase() === channelName.toLowerCase()
  );
}
