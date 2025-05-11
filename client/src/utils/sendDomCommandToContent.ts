
export const sendDomCommandToContent = (domCommand: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    chrome.tabs.sendMessage(
      tabId,
      { type: "DOM_COMMAND", domCommand },
      (res) => {
        console.log("[Extension] content script 응답:", res);
      }
    );
  });
};
