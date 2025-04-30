navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    console.log("[PermissionPage] Microphone permission granted.");
    stream.getTracks().forEach((track) => track.stop());

    chrome.runtime.sendMessage({ type: "PERMISSION_GRANTED" });

    window.close();
  })
  .catch((error) => {
    console.error("[PermissionPage] Microphone permission denied:", error);
    chrome.runtime.sendMessage({ type: "PERMISSION_DENIED" });
    window.close();
  });
