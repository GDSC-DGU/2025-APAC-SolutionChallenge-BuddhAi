chrome.runtime.onInstalled.addListener(() => {
  console.log('확장 프로그램 설치됨 ✅');

  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });
});
