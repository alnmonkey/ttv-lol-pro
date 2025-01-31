import pageScriptURL from "url:../page/page.ts";
import workerScriptURL from "url:../page/worker.ts";
import browser, { Storage } from "webextension-polyfill";
import findChannelFromTwitchTvUrl from "../common/ts/findChannelFromTwitchTvUrl";
import isChannelWhitelisted from "../common/ts/isChannelWhitelisted";
import isChromium from "../common/ts/isChromium";
import { getStreamStatus, setStreamStatus } from "../common/ts/streamStatus";
import wasChannelSubscriber from "../common/ts/wasChannelSubscriber";
import store from "../store";
import type { State } from "../store/types";
import { MessageType } from "../types";

console.info("[TTV LOL PRO] Content script running.");

if (isChromium) injectPageScript();
// Firefox uses FilterResponseData to inject the page script.

if (store.readyState === "complete") onStoreLoad();
else store.addEventListener("load", onStoreLoad);
store.addEventListener("change", onStoreChange);

browser.runtime.onMessage.addListener(onBackgroundMessage);
window.addEventListener("message", onPageMessage);

function injectPageScript() {
  // From https://stackoverflow.com/a/9517879
  const script = document.createElement("script");
  script.src = pageScriptURL; // src/page/page.ts
  script.dataset.params = JSON.stringify({
    isChromium,
    workerScriptURL, // src/page/worker.ts
  });
  script.onload = () => script.remove();
  // ---------------------------------------
  // 🦊 Attention Firefox Addon Reviewer 🦊
  // ---------------------------------------
  // Please note that this does NOT involve remote code execution. The injected scripts are bundled
  // with the extension. The `url:` imports above are used to get the runtime URLs of the respective scripts.
  // Additionally, there is no custom Content Security Policy (CSP) in use.
  (document.head || document.documentElement).prepend(script); // Note: Despite what the TS types say, `document.head` can be `null`.
}

function onStoreLoad() {
  // Clear stats for stream on page load/reload.
  const channelName = findChannelFromTwitchTvUrl(location.href);
  clearStats(channelName);
}

/**
 * Clear stats for stream on page load/reload.
 * @returns
 */
function clearStats(channelName: string | null) {
  if (!channelName) return;
  const channelNameLower = channelName.toLowerCase();
  if (store.state.streamStatuses.hasOwnProperty(channelNameLower)) {
    delete store.state.streamStatuses[channelNameLower];
  }
  console.log(
    `[TTV LOL PRO] Cleared stats for channel '${channelNameLower}' (content script).`
  );
}

function onStoreChange(changes: Record<string, Storage.StorageChange>) {
  const changedKeys = Object.keys(changes) as (keyof State)[];
  // This is mainly to reduce the amount of messages sent to the page script.
  // (Also to reduce the number of console logs.)
  const ignoredKeys: (keyof State)[] = [
    "activeChannelSubscriptions",
    "adLog",
    "dnsResponses",
    "openedTwitchTabs",
    "streamStatuses",
    "videoWeaverUrlsByChannel",
  ];
  if (changedKeys.every(key => ignoredKeys.includes(key))) return;
  console.log("[TTV LOL PRO] Store changed:", changes);
  window.postMessage({
    type: MessageType.PageScriptMessage,
    message: {
      type: MessageType.GetStoreStateResponse,
      state: JSON.parse(JSON.stringify(store.state)),
    },
  });
}

function onBackgroundMessage(message: any): undefined {
  switch (message.type) {
    case MessageType.EnableFullModeResponse:
      window.postMessage({
        type: MessageType.PageScriptMessage,
        message,
      });
      window.postMessage({
        type: MessageType.WorkerScriptMessage,
        message,
      });
      break;
  }
}

function onPageMessage(event: MessageEvent) {
  if (event.data?.type !== MessageType.ContentScriptMessage) return;

  const message = event.data?.message;
  if (!message) return;

  // GetStoreState
  if (message.type === MessageType.GetStoreState) {
    const sendStoreState = () => {
      window.postMessage({
        type: MessageType.PageScriptMessage,
        message: {
          type: MessageType.GetStoreStateResponse,
          state: JSON.parse(JSON.stringify(store.state)),
        },
      });
    };
    if (store.readyState === "complete") sendStoreState();
    else store.addEventListener("load", sendStoreState);
  }
  // EnableFullMode
  else if (message.type === MessageType.EnableFullMode) {
    try {
      browser.runtime.sendMessage(message);
    } catch (error) {
      console.error(
        "[TTV LOL PRO] Failed to send EnableFullMode message",
        error
      );
    }
  }
  // DisableFullMode
  else if (message.type === MessageType.DisableFullMode) {
    try {
      browser.runtime.sendMessage(message);
    } catch (error) {
      console.error(
        "[TTV LOL PRO] Failed to send DisableFullMode message",
        error
      );
    }
  }
  // ChannelSubscriptionStatus
  else if (message.type === MessageType.ChannelSubscriptionStatus) {
    const { channelName, isSubscribed, scope } = message;
    const wasSubscribed = wasChannelSubscriber(channelName);
    let isWhitelisted = isChannelWhitelisted(channelName);
    console.log(
      "[TTV LOL PRO] Received channel subscription status message. Current state:",
      {
        wasSubscribed,
        isSubscribed,
        isWhitelisted,
      }
    );
    if (store.state.whitelistChannelSubscriptions && channelName != null) {
      if (!wasSubscribed && isSubscribed) {
        store.state.activeChannelSubscriptions.push(channelName);
        // Add to whitelist.
        if (!isWhitelisted) {
          console.log(`[TTV LOL PRO] Adding '${channelName}' to whitelist.`);
          store.state.whitelistedChannels.push(channelName);
          isWhitelisted = true;
        }
      } else if (wasSubscribed && !isSubscribed) {
        store.state.activeChannelSubscriptions =
          store.state.activeChannelSubscriptions.filter(
            c => c.toLowerCase() !== channelName.toLowerCase()
          );
        // Remove from whitelist.
        if (isWhitelisted) {
          console.log(
            `[TTV LOL PRO] Removing '${channelName}' from whitelist.`
          );
          store.state.whitelistedChannels =
            store.state.whitelistedChannels.filter(
              c => c.toLowerCase() !== channelName.toLowerCase()
            );
          isWhitelisted = false;
        }
      }
    }
    console.log("[TTV LOL PRO] Sending channel subscription status response.");
    window.postMessage({
      type:
        scope === "page" // TODO: Is this necessary? Isn't the scope always "worker"?
          ? MessageType.PageScriptMessage
          : MessageType.WorkerScriptMessage,
      message: {
        type: MessageType.ChannelSubscriptionStatusResponse,
        isWhitelisted: isWhitelisted,
      },
    });
  }
  // UsherResponse
  else if (message.type === MessageType.UsherResponse) {
    try {
      browser.runtime.sendMessage(message);
    } catch (error) {
      console.error(
        "[TTV LOL PRO] Failed to send UsherResponse message",
        error
      );
    }
  }
  // MultipleAdBlockersInUse
  else if (message.type === MessageType.MultipleAdBlockersInUse) {
    const channelName = findChannelFromTwitchTvUrl(location.href);
    if (!channelName) return;
    const streamStatus = getStreamStatus(channelName);
    setStreamStatus(channelName, {
      ...(streamStatus ?? { proxied: false }),
      reason: "Another Twitch ad blocker is in use",
    });
  }
  // ClearStats
  else if (message.type === MessageType.ClearStats) {
    clearStats(message.channelName);
  }
}
