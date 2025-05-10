chrome.runtime.onInstalled.addListener(() => {
  console.log('확장 프로그램 설치됨 ✅');

  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });
});

// 메시지 리스너 등록
chrome.runtime.onMessage.addListener((message) => {
  if (
    message.type === 'PERMISSION_GRANTED' ||
    message.type === 'PERMISSION_DENIED'
  ) {
    chrome.runtime.sendMessage(message);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'ensureContentScript') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.scripting.executeScript(
          {
            target: { tabId },
            files: ['content.js'],
          },
          () => {
            if (chrome.runtime.lastError) {
              sendResponse({ status: 'injection failed' });
            } else {
              sendResponse({ status: 'injected' });
            }
          }
        );
      }
    });

    return true;
  }

  // 시선 좌표 전송 → content script
  if (message.action === 'updateGazePosition' && message.gazeData) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateGazePosition',
          gazeData: message.gazeData,
        });
      }
    });
    return true;
  }

  // 클릭 명령 → content script
  if (message.action === 'performClick') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'performClick',
        });
      }
    });
    return true;
  }

  // 커서 표시/숨김 → content script
  if (message.action === 'toggleGazePointer') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleGazePointer',
          visible: message.visible,
        });
      }
    });
    return true;
  }

  // 스크롤 기능 활성화/비활성화 → content script
  if (message.action === 'toggleScrolling') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleScrolling',
          enabled: message.enabled,
        });
      }
    });
    return true;
  }
});
