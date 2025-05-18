chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (
    message.type === 'PERMISSION_GRANTED' ||
    message.type === 'PERMISSION_DENIED'
  ) {
    chrome.runtime.sendMessage(message);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'FROM_POPUP') {
    console.log('[Background] 팝업 메시지 수신:', message.message);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;

      chrome.tabs.sendMessage(tab.id, {
        type: 'FROM_BACKGROUND',
        message: '백그라운드에서 전달',
      });

      console.log('[Background] content-script로 메시지 전달 완료');
    });
    return;
  }

  if (message.action === 'ensureContentScript') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js'],
        });
      }
    });
    return true;
  }

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

  if (message.type === 'INPUT_FOCUSED') {
    chrome.runtime.sendMessage({
      type: 'UPDATE_SUBMIT_STATE',
      focused: message.focused,
    });
  }

  if (message.action === 'relayInsertInputValue' && message.value) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'insertInputValue',
          value: message.value,
        });
      }
    });
  }

  if (message.type === 'FOCUS_ON_PAGE') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'showPageCursor' });
      }
    });
    chrome.runtime.sendMessage({ action: 'hideSidePanelCursor' });
  }

  if (message.type === 'FOCUS_ON_SIDEPANEL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'hidePageCursor' });
      }
    });
    chrome.runtime.sendMessage({ action: 'showSidePanelCursor' });
  }

  if (message.action === 'REQUEST_CAMERA_FROM_SIDEPANEL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'INJECT_PERMISSION_IFRAME',
        });
      }
    });
  }
});
