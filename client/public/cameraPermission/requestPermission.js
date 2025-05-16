navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(() => {
    chrome.runtime.sendMessage({ type: 'PERMISSION_GRANTED' });

    window.close();
  })
  .catch((error) => {
    chrome.runtime.sendMessage({ type: 'PERMISSION_DENIED' });
    window.close();
  });
