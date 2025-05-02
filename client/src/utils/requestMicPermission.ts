import { startSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useVoiceStore } from "../store/voiceStore";

export const requestMicPermission = () => {
  const url = chrome.runtime.getURL("permission/index.html");
  window.open(url, "_blank", "width=500,height=600");
  console.log("[Permission] 마이크 권한 요청 페이지 열기:", url);

  const { setIsRecognizing } = useVoiceStore.getState();

  const handler = (message: any) => {
    console.log("[Permission] 메시지 수신:", message);
    if (message.type === "PERMISSION_GRANTED") {
      console.log("[Permission] 권한 허용됨. 음성인식 시작");
      setIsRecognizing(true);
      startSpeechRecognition();
    } else if (message.type === "PERMISSION_DENIED") {
      console.warn("[Permission] 권한 거부됨.");
      alert("마이크 권한이 필요합니다.");
      setIsRecognizing(false);
    }
  };

  chrome.runtime.onMessage.addListener(handler);

  // 중복 등록 방지 위해 5초 뒤 자동 제거
  setTimeout(() => {
    chrome.runtime.onMessage.removeListener(handler);
  }, 5000);
};
