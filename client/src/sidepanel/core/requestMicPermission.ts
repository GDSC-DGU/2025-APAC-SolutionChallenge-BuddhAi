import { useVoiceStore } from "../../store/voiceStore";
import { onPermissionGranted } from "../../handlers/onPermissionGranted";
import { startAudioRecording } from "../hooks/useAudioRecorder";

export const requestMicPermission = () => {
  const url = chrome.runtime.getURL("permission/index.html");
  window.open(url, "_blank", "width=500,height=600");
  console.log("[Permission] 마이크 권한 요청 페이지 열기:", url);

  const { setIsRecognizing } = useVoiceStore.getState();

  const handler = (message: any) => {
    console.log("[Permission] 메시지 수신:", message);
    if (message.type === "PERMISSION_GRANTED") {
      console.log("[Permission] 권한 허용됨");
      setIsRecognizing(true);
      onPermissionGranted(); // 별도 파일로 분리된 로직 실행
    } else if (message.type === "PERMISSION_DENIED") {
      console.warn("[Permission] 권한 거부됨");
      alert("마이크 권한이 필요합니다.");
      setIsRecognizing(false);
    }
  };

  chrome.runtime.onMessage.addListener(handler);

  setTimeout(() => {
    chrome.runtime.onMessage.removeListener(handler);
  }, 5000); // 중복 방지

  chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "permission") {
    port.onMessage.addListener((message) => {
      console.log("[Permission] Port 메시지 수신:", message);
      const { setIsRecognizing } = useVoiceStore.getState();

      if (message.type === "PERMISSION_GRANTED") {
        console.log("[Permission] 권한 허용됨. 음성인식 시작");
        setIsRecognizing(true);
        startAudioRecording((file: File) => {
          console.log("Audio recording completed:", file);
        }); // 또는 기존 onPermissionGranted()
      } else if (message.type === "PERMISSION_DENIED") {
        alert("마이크 권한이 필요합니다.");
        setIsRecognizing(false);
      }
    });
  }
});

};
