chrome.runtime.onInstalled.addListener(() => {
  console.log('확장 프로그램 설치됨 ✅');

  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });
});

// 메시지 리스너 등록
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "PERMISSION_GRANTED" || message.type === "PERMISSION_DENIED") {
    chrome.runtime.sendMessage(message);
  }
});
