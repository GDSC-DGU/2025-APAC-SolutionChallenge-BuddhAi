export const sendCommandToContentScript = async (command: string) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: "COMMAND", command });
    }
  } catch (error) {
    console.error("[Voice] Failed to send command:", error);
    alert("Failed to send command. Please check the active tab.");
  }
};
