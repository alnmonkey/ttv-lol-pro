import store from "../../store";

export default function wasChannelSubscriber(
  channelName: string | null
): boolean {
  if (!channelName) return false;
  const activeChannelSubscriptionsLower =
    store.state.activeChannelSubscriptions.map(channel =>
      channel.toLowerCase()
    );
  return activeChannelSubscriptionsLower.includes(channelName.toLowerCase());
}
