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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FROM_POPUP") {
    console.log("[Background] 팝업 메시지 수신:", request.message);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;

      chrome.tabs.sendMessage(tab.id, {
        type: "FROM_BACKGROUND",
        message: "백그라운드에서 전달",
      });

      console.log("[Background] content-script로 메시지 전달 완료");
    });
  }
});

